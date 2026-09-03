import { getFileContent, getRepoTree } from "./github"

// 仓库结构化事实（不依赖 LLM，纯扫描得到的确定性信息）
export interface RepoFacts {
  owner: string
  repo: string
  description: string
  language: string
  defaultBranch: string
  // 检测到的框架/工具
  packageManager: string | null // npm, pnpm, yarn, bun, pip, poetry, cargo, go, etc.
  framework: string | null // Next.js, React, Vue, FastAPI, Gin, etc.
  buildTool: string | null
  testFramework: string | null
  // 命令
  devCommand: string | null
  buildCommand: string | null
  testCommand: string | null
  lintCommand: string | null
  // 路径
  srcDir: string | null
  testDir: string | null
  // 检测到的文件/服务
  hasDocker: boolean
  hasCi: boolean // GitHub Actions
  hasReadme: boolean
  hasAgentsMd: boolean
  agentsMdContent: string | null
  // Monorepo
  isMonorepo: boolean
  monorepoDirs: string[] // e.g. ["packages", "apps"]
  // 语言列表
  topFiles: string[] // 关键配置文件列表
}

export async function scanRepository(
  owner: string,
  repo: string,
  repoInfo: any,
  userToken?: string | null,
): Promise<RepoFacts> {
  const facts: RepoFacts = {
    owner,
    repo,
    description: repoInfo.description || "",
    language: repoInfo.language || "Unknown",
    defaultBranch: repoInfo.default_branch || "main",
    packageManager: null,
    framework: null,
    buildTool: null,
    testFramework: null,
    devCommand: null,
    buildCommand: null,
    testCommand: null,
    lintCommand: null,
    srcDir: null,
    testDir: null,
    hasDocker: false,
    hasCi: false,
    hasReadme: false,
    hasAgentsMd: false,
    agentsMdContent: null,
    isMonorepo: false,
    monorepoDirs: [],
    topFiles: [],
  }

  // 获取文件树
  let tree: any[] = []
  try {
    const treeData = await getRepoTree(owner, repo, userToken)
    tree = treeData.tree || []
  } catch {
    // 如果树太大获取失败，用关键文件逐个探测
  }

  const filePaths = tree.map((t: any) => t.path)
  facts.topFiles = filePaths.slice(0, 50)

  // ─── 检测 README ───
  facts.hasReadme = filePaths.some(
    (p: string) => p.toLowerCase() === "readme.md"
  )

  // ─── 检测 AGENTS.md ───
  const agentsPath = filePaths.find(
    (p: string) => p.toLowerCase() === "agents.md"
  )
  if (agentsPath) {
    facts.hasAgentsMd = true
    facts.agentsMdContent = await getFileContent(owner, repo, "AGENTS.md", userToken)
  }

  // ─── 检测 Docker ───
  facts.hasDocker = filePaths.some(
    (p: string) =>
      p.toLowerCase() === "dockerfile" ||
      p.toLowerCase().startsWith("docker-compose")
  )

  // ─── 检测 CI ───
  facts.hasCi = filePaths.some((p: string) =>
    p.startsWith(".github/workflows/")
  )

  // ─── 检测 src / test 目录 ───
  if (filePaths.some((p: string) => p.startsWith("src/"))) facts.srcDir = "src"
  const testDirs = ["tests", "test", "__tests__", "spec"]
  for (const dir of testDirs) {
    if (filePaths.some((p: string) => p.startsWith(`${dir}/`))) {
      facts.testDir = dir
      break
    }
  }

  // ─── JavaScript / TypeScript 项目 ───
  const hasPackageJson = filePaths.includes("package.json")
  if (hasPackageJson) {
    const pkgContent = await getFileContent(owner, repo, "package.json", userToken)
    if (pkgContent) {
      try {
        const pkg = JSON.parse(pkgContent)
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }
        const scripts = pkg.scripts || {}

        // 包管理器
        if (filePaths.includes("pnpm-lock.yaml")) facts.packageManager = "pnpm"
        else if (filePaths.includes("yarn.lock")) facts.packageManager = "yarn"
        else if (filePaths.includes("bun.lockb") || filePaths.includes("bun.lock"))
          facts.packageManager = "bun"
        else if (filePaths.includes("package-lock.json")) facts.packageManager = "npm"
        else facts.packageManager = "npm"

        const pm = facts.packageManager

        // 框架检测
        if (deps["next"]) facts.framework = "Next.js"
        else if (deps["react"]) facts.framework = "React"
        else if (deps["vue"]) facts.framework = "Vue"
        else if (deps["svelte"]) facts.framework = "Svelte"
        else if (deps["express"]) facts.framework = "Express"
        else if (deps["@nestjs/core"]) facts.framework = "NestJS"

        // 构建工具
        if (deps["vite"]) facts.buildTool = "Vite"
        else if (deps["webpack"]) facts.buildTool = "Webpack"
        else if (deps["turbo"]) facts.buildTool = "Turborepo"

        // 测试框架
        if (deps["jest"]) facts.testFramework = "Jest"
        else if (deps["vitest"]) facts.testFramework = "Vitest"
        else if (deps["mocha"]) facts.testFramework = "Mocha"
        else if (deps["@playwright/test"]) facts.testFramework = "Playwright"

        // 命令
        if (scripts.dev) facts.devCommand = `${pm} run dev`
        else if (scripts.start) facts.devCommand = `${pm} start`

        if (scripts.build) facts.buildCommand = `${pm} run build`

        if (scripts.test) facts.testCommand = `${pm} test`

        if (scripts.lint) facts.lintCommand = `${pm} run lint`

        // monorepo — package.json workspaces
        const ws = pkg.workspaces
        const wsList: string[] = Array.isArray(ws)
          ? ws
          : ws && Array.isArray(ws.packages)
            ? ws.packages
            : []
        if (wsList.length > 0) {
          facts.isMonorepo = true
          for (const w of wsList) {
            const dir = w.endsWith("/*") ? w.slice(0, -2) : w
            if (dir && !facts.monorepoDirs.includes(dir)) facts.monorepoDirs.push(dir)
          }
        }
      } catch {
        // 解析失败，跳过
      }
    }
  }

  // ─── Python 项目 ───
  if (filePaths.includes("pyproject.toml")) {
    facts.packageManager = "poetry"
    const pyproject = await getFileContent(owner, repo, "pyproject.toml", userToken)
    if (pyproject) {
      if (pyproject.includes("fastapi")) facts.framework = "FastAPI"
      else if (pyproject.includes("flask")) facts.framework = "Flask"
      else if (pyproject.includes("django")) facts.framework = "Django"
      if (pyproject.includes("pytest")) facts.testFramework = "pytest"
    }
    facts.testCommand = "pytest"
  } else if (filePaths.includes("requirements.txt")) {
    facts.packageManager = "pip"
    const req = await getFileContent(owner, repo, "requirements.txt", userToken)
    if (req) {
      if (req.includes("fastapi")) facts.framework = "FastAPI"
      else if (req.includes("flask")) facts.framework = "Flask"
      else if (req.includes("django")) facts.framework = "Django"
      if (req.includes("pytest")) facts.testFramework = "pytest"
    }
    facts.testCommand = "pytest"
  }
  if (facts.language === "Python" && !facts.testCommand) {
    facts.testCommand = "pytest"
  }

  // ─── Go 项目 ───
  if (filePaths.includes("go.mod")) {
    facts.packageManager = "go modules"
    facts.buildCommand = "go build"
    facts.testCommand = "go test ./..."
    const goMod = await getFileContent(owner, repo, "go.mod", userToken)
    if (goMod?.includes("gin-gonic/gin")) facts.framework = "Gin"
    else if (goMod?.includes("fiber")) facts.framework = "Fiber"
  }

  // ─── Rust 项目 ───
  if (filePaths.includes("Cargo.toml")) {
    if (!facts.packageManager) facts.packageManager = "cargo"
    if (!facts.buildCommand) facts.buildCommand = "cargo build"
    if (!facts.testCommand) facts.testCommand = "cargo test"
    const cargo = await getFileContent(owner, repo, "Cargo.toml", userToken)
    if (cargo && !facts.framework) {
      if (cargo.includes("tokio")) facts.framework = "Tokio"
      else if (cargo.includes("actix-web")) facts.framework = "Actix Web"
    }
  }

  // ─── Java 项目 ───
  if (filePaths.includes("pom.xml")) {
    facts.packageManager = "Maven"
    facts.buildCommand = "mvn clean install"
    facts.testCommand = "mvn test"
    const pom = await getFileContent(owner, repo, "pom.xml", userToken)
    if (pom) {
      if (pom.includes("spring-boot")) facts.framework = "Spring Boot"
      else if (pom.includes("quarkus")) facts.framework = "Quarkus"
      else if (pom.includes("micronaut")) facts.framework = "Micronaut"
      if (pom.includes("junit")) facts.testFramework = "JUnit"
    }
  } else if (
    filePaths.includes("build.gradle") ||
    filePaths.includes("build.gradle.kts")
  ) {
    const gradleFile = filePaths.includes("build.gradle")
      ? "build.gradle"
      : "build.gradle.kts"
    facts.packageManager = "Gradle"
    facts.buildCommand = "./gradlew build"
    facts.testCommand = "./gradlew test"
    const gradle = await getFileContent(owner, repo, gradleFile, userToken)
    if (gradle) {
      if (gradle.includes("org.springframework.boot")) facts.framework = "Spring Boot"
      if (gradle.includes("junit")) facts.testFramework = "JUnit"
    }
  }

  // ─── PHP 项目 ───
  if (filePaths.includes("composer.json")) {
    facts.packageManager = "Composer"
    facts.buildCommand = "composer install"
    const composer = await getFileContent(owner, repo, "composer.json", userToken)
    if (composer) {
      try {
        const c = JSON.parse(composer)
        const req = { ...(c.require || {}), ...(c["require-dev"] || {}) } as Record<string, string>
        if (req["laravel/framework"]) facts.framework = "Laravel"
        else if (req["symfony/framework-bundle"] || req["symfony/symfony"]) facts.framework = "Symfony"
        if (req["phpunit/phpunit"]) {
          facts.testFramework = "PHPUnit"
          facts.testCommand = "vendor/bin/phpunit"
        }
      } catch {
        // 解析失败，跳过
      }
    }
  }

  // ─── Ruby 项目 ───
  if (filePaths.includes("Gemfile")) {
    facts.packageManager = "Bundler"
    facts.buildCommand = "bundle install"
    const gemfile = await getFileContent(owner, repo, "Gemfile", userToken)
    if (gemfile) {
      if (gemfile.includes("rails")) facts.framework = "Ruby on Rails"
      else if (gemfile.includes("sinatra")) facts.framework = "Sinatra"
      if (gemfile.includes("rspec")) {
        facts.testFramework = "RSpec"
        facts.testCommand = "bundle exec rspec"
      } else if (gemfile.includes("minitest")) {
        facts.testFramework = "Minitest"
        facts.testCommand = "bundle exec rake test"
      }
    }
  }

  // ─── C# / .NET 项目 ───
  const csproj = filePaths.find((p: string) => p.endsWith(".csproj"))
  const hasSln = filePaths.some((p: string) => p.endsWith(".sln"))
  if (csproj || hasSln) {
    facts.packageManager = "NuGet"
    facts.buildCommand = "dotnet build"
    facts.testCommand = "dotnet test"
    if (csproj) {
      const csprojContent = await getFileContent(owner, repo, csproj, userToken)
      if (csprojContent) {
        if (csprojContent.includes("Microsoft.NET.Sdk.Web")) facts.framework = "ASP.NET Core"
        if (csprojContent.includes("xunit")) facts.testFramework = "xUnit"
        else if (csprojContent.includes("nunit")) facts.testFramework = "NUnit"
      }
    }
  }

  // ─── Monorepo 检测 ───
  // 常见布局：packages/、apps/、services/、libs/，或 package.json 的 workspaces
  // 兼容根目录树（非递归）下的目录条目，如 path === "packages"
  for (const dir of ["packages", "apps", "services", "libs"]) {
    if (
      filePaths.some((p: string) => p === dir || p.startsWith(`${dir}/`))
    ) {
      facts.isMonorepo = true
      if (!facts.monorepoDirs.includes(dir)) facts.monorepoDirs.push(dir)
    }
  }

  // ─── 语言兜底命令 ───
  if (facts.language === "Go" && !facts.testCommand) {
    facts.testCommand = "go test ./..."
    facts.buildCommand = "go build"
  }
  if (facts.language === "Rust" && !facts.testCommand) {
    facts.testCommand = "cargo test"
    facts.buildCommand = "cargo build"
  }

  return facts
}
