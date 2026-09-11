import type { Locale } from "@/app/i18n/config"

// Original template library for RepoContext. Every string intended for human
// reading is provided in all four supported locales (en, es, zh-Hant, ja).
// Code snippets stay language-neutral (English) because they are technical
// artifacts, not prose.
export type LText = Record<Locale, string>

export type SampleFormat =
  | "AGENTS.md"
  | "CLAUDE.md"
  | "Cursor Rules"
  | "Copilot Instructions"

export type Sample = {
  id: string
  stack: string
  format: SampleFormat
  accent: string
  tags: string[]
  desc: LText
  code: string
}

export type PromptTemplate = {
  id: string
  badge: string
  useCase: LText
  prompt: string
  note: LText
}

export type BestPractice = {
  id: string
  title: LText
  desc: LText
  tips: LText[]
}

// ---------------------------------------------------------------------------
// 1. Sample library — real, copy-pasteable context files by tech stack.
// ---------------------------------------------------------------------------
export const SAMPLES: Sample[] = [
  {
    id: "nextjs",
    stack: "Next.js 14",
    format: "AGENTS.md",
    accent: "#0f62fe",
    tags: ["App Router", "RSC", "TypeScript"],
    desc: {
      en: "Drop-in AGENTS.md for a Next.js 14 App Router project. Documents routing, data fetching, and the server/client boundary so agents stop hallucinating imports.",
      es: "Un AGENTS.md listo para usar en un proyecto Next.js 14 con App Router. Documenta el enrutamiento, la obtención de datos y el límite server/client para que los agentes dejen de alucinar imports.",
      "zh-Hant": "為 Next.js 14 App Router 專案準備好的 AGENTS.md。說明路由、資料獲取與 server/client 邊界，讓 AI 代理不再憑空猜測 import。",
      ja: "Next.js 14 App Router プロジェクト向けすぐ使える AGENTS.md。ルーティング、データ取得、server/client の境界を記述し、エージェントのインポート勘違いを防ぎます。",
    },
    code: `# AGENTS.md — Next.js 14 App Router

## Stack
- Next.js 14 (App Router), React 18, TypeScript
- Data: React Server Components + Server Actions

## Conventions
- "use client" only at the leaf that needs interactivity.
- Server Components are the default; never import server-only
  modules (fs, db) into a client component.
- Routes live under app/<feature>/page.tsx (route) or
  app/<feature>/layout.tsx (shared shell).

## Data fetching
- Fetch in Server Components with async/await.
- Mutate via Server Actions; keep forms progressively enhanced.

## Gotchas
- Do not import "@/lib/server" from a "use client" file.
- Environment keys: NEXT_PUBLIC_* are client-visible.`,
  },
  {
    id: "python",
    stack: "Python · FastAPI",
    format: "CLAUDE.md",
    accent: "#009d9a",
    tags: ["FastAPI", "async", "Pydantic"],
    desc: {
      en: "CLAUDE.md tuned for a FastAPI service: async patterns, Pydantic models, dependency injection, and the test layout your coding agent should follow.",
      es: "CLAUDE.md optimizado para un servicio FastAPI: patrones async, modelos Pydantic, inyección de dependencias y la estructura de tests que tu agente debe seguir.",
      "zh-Hant": "為 FastAPI 服務調校的 CLAUDE.md：async 模式、Pydantic 模型、依賴注入，以及你的編碼代理應遵循的測試結構。",
      ja: "FastAPI サービス向けに調整した CLAUDE.md：非同期パターン、Pydantic モデル、依存性注入、およびコーディングエージェントが従うべきテスト構成。",
    },
    code: `# CLAUDE.md — FastAPI service

## Stack
- Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2

## Rules
- All DB access is async (asyncpg); never call blocking IO in a
  request handler without to_thread.
- Define request/response schemas as Pydantic models in api/schemas/.
- Share dependencies (auth, db session) via FastAPI Depends.

## Testing
- pytest + httpx.AsyncClient; tests under tests/ mirror app/ layout.
- Use the dependency_overrides registry to swap the DB for a fixture.

## Notes
- Run migrations with \`alembic upgrade head\`, never edit the DB directly.`,
  },
  {
    id: "rust",
    stack: "Rust · CLI",
    format: "AGENTS.md",
    accent: "#cc6600",
    tags: ["clap", "thiserror", "cargo"],
    desc: {
      en: "AGENTS.md for a Rust CLI built with clap. Captures module layout, error handling with thiserror/anyhow, and the release workflow.",
      es: "AGENTS.md para una CLI en Rust con clap. Refleja la estructura de módulos, el manejo de errores con thiserror/anyhow y el flujo de release.",
      "zh-Hant": "為使用 clap 打造的 Rust CLI 準備的 AGENTS.md。涵蓋模組結構、以 thiserror/anyhow 處理錯誤，以及發布流程。",
      ja: "clap 製 Rust CLI 向け AGENTS.md。モジュール構成、thiserror/anyhow によるエラー処理、リリース手順を網羅。",
    },
    code: `# AGENTS.md — Rust CLI (clap)

## Layout
- src/main.rs: arg parsing + wiring only.
- src/commands/: one module per subcommand.
- src/lib.rs: pure logic, fully unit-tested.

## Error handling
- Define domain errors with thiserror.
- Propagate with anyhow in main; map to exit codes at the boundary.

## Build & release
- cargo build --release; binaries in target/release/.
- CI cross-compiles via cargo-zigbuild for linux/macos/windows.
- Version is sourced from Cargo.toml, not hard-coded.`,
  },
  {
    id: "go",
    stack: "Go · gRPC",
    format: "Cursor Rules",
    accent: "#6929c4",
    tags: ["gRPC", "protobuf", "context"],
    desc: {
      en: "Cursor Rules for a Go gRPC microservice: package conventions, context propagation, generated-code boundaries, and linting rules.",
      es: "Cursor Rules para un microservicio Go gRPC: convenciones de paquetes, propagación de contexto, límites del código generado y reglas de lint.",
      "zh-Hant": "為 Go gRPC 微服務準備的 Cursor Rules：套件慣例、context 傳遞、生成程式碼的邊界，以及 lint 規則。",
      ja: "Go gRPC マイクロサービス向け Cursor Rules：パッケージ規約、context 伝播、生成コードの境界、リント規則。",
    },
    code: `// Cursor Rules — Go gRPC service

- Accept ctx context.Context as the FIRST argument of every
  exported function; never store it in a struct.
- protoc output (*.pb.go, *_grpc.pb.go) is generated; do NOT edit.
  Regenerate with \`make proto\` after changing .proto files.
- Packages: internal/ for unexported code, api/ for the gRPC
  surface, pkg/ only for truly reusable helpers.
- Errors: wrap with fmt.Errorf("...: %w", err); surface gRPC
  status codes via status.Errorf.
- Run \`golangci-lint run\` before every commit.`,
  },
  {
    id: "reactnative",
    stack: "React Native",
    format: "Copilot Instructions",
    accent: "#0f62fe",
    tags: ["Expo", "native", "styles"],
    desc: {
      en: "Copilot Instructions for a React Native app: platform-specific files, native module boundaries, and the styling approach to keep suggestions consistent.",
      es: "Instrucciones de Copilot para una app React Native: archivos específicos de plataforma, límites de módulos nativos y el enfoque de estilos.",
      "zh-Hant": "為 React Native 應用準備的 Copilot Instructions：平台專屬檔案、原生模組邊界，以及保持建議一致的樣式作法。",
      ja: "React Native アプリ向け Copilot Instructions：プラットフォーム別ファイル、ネイティブモジュールの境界、一貫したスタイルの方針。",
    },
    code: `<!-- Copilot Instructions — React Native (Expo) -->

- Use Platform.select() for platform-specific behavior; keep the
  shared component the default and branch only when necessary.
- Native modules live under /modules; never import 'react-native'
  internals directly.
- Styling: StyleSheet.create with design tokens from theme.ts.
  Do not use inline pixel values outside the token system.
- Navigation: React Navigation v7; screen params are typed.
- Avoid nativewind/tailwind mixing with StyleSheet in the same file.`,
  },
  {
    id: "monorepo",
    stack: "Turborepo",
    format: "AGENTS.md",
    accent: "#198038",
    tags: ["pnpm", "workspaces", "pipelines"],
    desc: {
      en: "AGENTS.md for a Turborepo monorepo: workspace graph, task pipelines, and which package owns what, so agents edit the right project.",
      es: "AGENTS.md para un monorepo Turborepo: grafo de workspaces, pipelines de tareas y qué paquete es dueño de qué.",
      "zh-Hant": "為 Turborepo monorepo 準備的 AGENTS.md：workspace 圖、任務管線，以及各套件負責的範圍。",
      ja: "Turborepo モノレポ向け AGENTS.md：ワークスペース構成、タスクパイプライン、各パッケージの責務。",
    },
    code: `# AGENTS.md — Turborepo monorepo (pnpm)

## Packages
- apps/web: Next.js consumer app.
- packages/ui: shared React components (no business logic).
- packages/core: framework-agnostic domain logic.

## Rules
- Import shared code via workspace protocol: "@repo/ui".
- Never reach into another package's src/ directly.
- Run tasks through turbo: \`pnpm turbo build --filter=web\`.

## Pipelines
- build dependsOn ^build; test/test dependOn build.
- Cache is content-addressed; don't disable it for CI speed wins.`,
  },
]

// ---------------------------------------------------------------------------
// 2. Prompt templates — the prompts RepoContext uses to produce context.
//    Shared here as copy-pasteable starting points for your own agents.
// ---------------------------------------------------------------------------
export const PROMPTS: PromptTemplate[] = [
  {
    id: "analyze",
    badge: "Analysis",
    useCase: {
      en: "Dissect a GitHub repository into structure, dependencies, and conventions.",
      es: "Desglosa un repositorio de GitHub en estructura, dependencias y convenciones.",
      "zh-Hant": "將 GitHub 倉庫拆解出結構、依賴與慣例。",
      ja: "GitHub リポジトリを構造・依存・規約に分解します。",
    },
    prompt: `You are a senior software architect. Given the file tree, package
manifests, and a sample of key source files of a repository, produce a
structured analysis with these sections:

1. PURPOSE — one sentence on what the project does.
2. STACK — languages, frameworks, package managers, build tools.
3. ARCHITECTURE — module boundaries and the data/control flow.
4. CONVENTIONS — naming, testing, and layout rules you can infer.
5. EVIDENCE — cite the exact files that support each claim.

Rules:
- Never invent files. Only reference what was provided.
- If confidence is low, say "uncertain" rather than guessing.
- Prefer concrete file paths over vague claims.`,
    note: {
      en: "Constraining the model to cite evidence prevents the most common failure mode: confident but fabricated architecture.",
      es: "Obligar al modelo a citar evidencia evita el fallo más común: una arquitectura inventada pero expuesta con seguridad.",
      "zh-Hant": "要求模型引用證據，能避免最常見的錯誤：看似篤定、實則憑空編造的架構。",
      ja: "根拠の提示を義務付けることで、最も多い失敗（自信満々だが架空のアーキテクチャ）を防げます。",
    },
  },
  {
    id: "generate",
    badge: "Generation",
    useCase: {
      en: "Turn an analysis into a clean, agent-ready context file.",
      es: "Convierte un análisis en un archivo de contexto limpio y listo para agentes.",
      "zh-Hant": "把分析結果轉成乾淨、可供代理使用的上下文檔案。",
      ja: "分析結果を、エージェントが使える清潔なコンテキストファイルに変換します。",
    },
    prompt: `You are writing a context file (AGENTS.md / CLAUDE.md / Cursor
Rules / Copilot Instructions) for an AI coding agent.

Input: a repository analysis (purpose, stack, architecture, conventions).

Produce a file that is:
- Scannable: short sections with bold headers.
- Actionable: tells the agent what to DO, not just what exists.
- Honest: mark anything uncertain as a caveat.

Format strictly as Markdown. Keep it under 400 lines. Lead with the
most load-bearing conventions an agent would otherwise get wrong.`,
    note: {
      en: "Leading with 'what the agent would get wrong' is what makes the output useful rather than a restatement of the README.",
      es: "Empezar por 'lo que el agente haría mal' es lo que hace útil el resultado en vez de repetir el README.",
      "zh-Hant": "先寫「代理容易搞錯的地方」，才能讓產出真正有用，而不是把 README 重述一遍。",
      ja: "「エージェントが間違えやすい点」を先に書くからこそ、README の焼き直しではなく有用になります。",
    },
  },
  {
    id: "evidence",
    badge: "Evidence",
    useCase: {
      en: "Attach the source files that justify each generated claim.",
      es: "Adjunta los archivos fuente que justifican cada afirmación generada.",
      "zh-Hant": "為每條生成的陳述附上對應的來源檔案。",
      ja: "生成された各主張の根拠となるソースファイルを紐付けます。",
    },
    prompt: `For each statement in the context file, return the list of files
that prove it. Output as a mapping:

  "<claim>" -> ["path/to/file.ext:line", ...]

Only include files present in the repository. If a claim has no
supporting file, mark it "unsupported".`,
    note: {
      en: "A claim with no evidence is a liability. Surfacing 'unsupported' items lets humans review before shipping.",
      es: "Una afirmación sin evidencia es un riesgo. Marcar lo 'no soportado' permite revisar antes de publicar.",
      "zh-Hant": "沒有證據的陳述是隱患。標出「無支持」項目，才能在上線前讓人審查。",
      ja: "根拠のない主張はリスクです。「未サポート」を可視化し、公開前に人間がレビューできます。",
    },
  },
  {
    id: "score",
    badge: "Quality",
    useCase: {
      en: "Score how trustworthy the generated context actually is.",
      es: "Puntúa cuán fiable es realmente el contexto generado.",
      "zh-Hant": "為生成內容的可信度打分。",
      ja: "生成コンテキストの信頼性をスコアリングします。",
    },
    prompt: `Rate the context file on a 0-100 quality scale using:
- COVERAGE: does it address the agent's likely tasks?
- ACCURACY: are claims backed by evidence?
- CLARITY: can an agent act on it without ambiguity?
- FRESHNESS: would it still hold after a routine change?

Return a JSON: {"score": int, "breakdown": {...}, "weakest": "..."}.`,
    note: {
      en: "Breaking the score into four axes turns a vanity metric into an actionable checklist for improvement.",
      es: "Desglosar la puntuación en cuatro ejes convierte una métrica vana en una lista accionable.",
      "zh-Hant": "把分數拆成四個維度，就能把空泛指標變成可執行的改進清單。",
      ja: "スコアを4軸に分解することで、単なる数値を改善のチェックリストに変えられます。",
    },
  },
  {
    id: "translate",
    badge: "i18n",
    useCase: {
      en: "Translate a context file into another supported language without losing meaning.",
      es: "Traduce un archivo de contexto a otro idioma sin perder el significado.",
      "zh-Hant": "把上下文檔案翻譯成另一種語言，且不流失語意。",
      ja: "コンテキストファイルを別の言語に、意味を損なわず翻訳します。",
    },
    prompt: `Translate the following context file into {target_lang}. Rules:
- Keep all code blocks, file paths, and commands verbatim.
- Preserve Markdown structure and heading levels.
- Use natural, technical register for {target_lang}; do not transliterate
  library or framework names.
- If a term has no clean translation, keep the English term in parentheses.`,
    note: {
      en: "Keeping code, paths, and commands verbatim is non-negotiable — translation should never touch anything an agent executes.",
      es: "Mantener código, rutas y comandos verbatim es innegociable: la traducción nunca debe tocar lo que un agente ejecuta.",
      "zh-Hant": "程式碼、路徑與指令必須原樣保留——翻譯絕不能動到代理會執行的內容。",
      ja: "コード・パス・コマンドはそのまま維持することが必須です。翻訳で実行対象を変えてはいけません。",
    },
  },
]

// ---------------------------------------------------------------------------
// 3. Best practices — how to get the most out of generated context.
// ---------------------------------------------------------------------------
export const BEST_PRACTICES: BestPractice[] = [
  {
    id: "monorepo",
    title: {
      en: "Tame large monorepos",
      es: "Domar monorepos grandes",
      "zh-Hant": "馴服大型 monorepo",
      ja: "大規模モノレポの整理",
    },
    desc: {
      en: "Monorepos hide ownership. A good context file makes the workspace graph explicit so agents edit the right package.",
      es: "Los monorepos ocultan la propiedad. Un buen archivo de contexto hace explícito el grafo de workspaces.",
      "zh-Hant": "monorepo 會掩蓋所有權。好的上下文檔案會把 workspace 圖攤開，讓代理改對套件。",
      ja: "モノレポは所有権を隠します。良いコンテキストファイルはワークスペース構成を明示し、正しいパッケージを編集させます。",
    },
    tips: [
      {
        en: "Generate one context file per package, not one for the whole repo.",
        es: "Genera un archivo de contexto por paquete, no uno para todo el repo.",
        "zh-Hant": "為每個套件各生成一份上下文檔案，而非整個倉庫共用一份。",
        ja: "リポ全体ではなく、パッケージごとにコンテキストファイルを生成しましょう。",
      },
      {
        en: "Name the workspace graph: which package owns auth, which owns UI.",
        es: "Nombra el grafo de workspaces: qué paquete es dueño de auth, qué de UI.",
        "zh-Hant": "把 workspace 圖寫清楚：誰負責 auth、誰負責 UI。",
        ja: "ワークスペース構成を明記：auth はどのパッケージ、UI はどのパッケージ。",
      },
      {
        en: "Forbid cross-package src imports; route everything through the public API.",
        es: "Prohíbe los imports de src entre paquetes; enruta todo por la API pública.",
        "zh-Hant": "禁止跨套件直接 import src，全部走公開 API。",
        ja: "パッケージ間の src 直接 import を禁止し、公開 API 経由にします。",
      },
    ],
  },
  {
    id: "private",
    title: {
      en: "Work with private repositories",
      es: "Trabaja con repositorios privados",
      "zh-Hant": "處理私有倉庫",
      ja: "非公開リポジトリの扱い",
    },
    desc: {
      en: "Private code never leaves your control. RepoContext reads metadata and structure, not file contents, by default.",
      es: "El código privado nunca sale de tu control. RepoContext lee metadatos y estructura, no contenido, por defecto.",
      "zh-Hant": "私有程式碼始終不離你掌控。RepoContext 預設只讀取元資料與結構，不讀檔案內容。",
      ja: "非公開コードは常にあなたの管理下に。RepoContext は既定でメタデータと構造のみを読み、内容は読みません。",
    },
    tips: [
      {
        en: "Connect via OAuth; scope the token to the repos you actually analyze.",
        es: "Conéctate por OAuth; limita el token a los repos que realmente analizas.",
        "zh-Hant": "用 OAuth 連接；把 token 權限收斂到你真正分析的倉庫。",
        ja: "OAuth で接続し、実際に分析するリポのみにトークン権限を絞ります。",
      },
      {
        en: "Keep secrets in env vars; never let them enter the context file.",
        es: "Guarda secretos en variables de entorno; nunca los incluyas en el contexto.",
        "zh-Hant": "金鑰放在環境變數；絕不讓它們進入上下文檔案。",
        ja: "シークレットは環境変数に。コンテキストファイルに入れてはいけません。",
      },
      {
        en: "Review the generated file before committing it to a shared branch.",
        es: "Revisa el archivo generado antes de hacer commit en una rama compartida.",
        "zh-Hant": "提交到共用分支前，先審閱生成的檔案。",
        ja: "共有ブランチへコミットする前に生成ファイルを確認します。",
      },
    ],
  },
  {
    id: "multilingual",
    title: {
      en: "Handle multilingual codebases",
      es: "Maneja bases de código multilingües",
      "zh-Hant": "處理多語言程式碼庫",
      ja: "多言語コードベースの扱い",
    },
    desc: {
      en: "Mixed-language repos need per-language context. One generic file forces the agent to guess the wrong idioms.",
      es: "Los repos multilingüe necesitan contexto por lenguaje. Un archivo genérico hace que el agente adivine mal.",
      "zh-Hant": "多語言倉庫需要按語言分開的上下文。一份通用檔案會逼代理猜錯慣用法。",
      ja: "多言語リポには言語ごとのコンテキストが必要です。汎用ファイルだと正しい慣習を誤ります。",
    },
    tips: [
      {
        en: "Split context by language: Python services vs TypeScript frontends.",
        es: "Divide el contexto por lenguaje: servicios Python vs frontends TypeScript.",
        "zh-Hant": "按語言拆分上下文：Python 服務 vs TypeScript 前端。",
        ja: "言語で分割：Python サービスと TypeScript フロントエンド。",
      },
      {
        en: "Note the interop boundary (e.g. REST/grpc) between languages explicitly.",
        es: "Señala explícitamente el límite de interoperabilidad (REST/grpc) entre lenguajes.",
        "zh-Hant": "明確寫出語言之間的互通邊界（如 REST/gRPC）。",
        ja: "言語間の相互運用境界（REST/gRPC 等）を明示します。",
      },
      {
        en: "Keep shared contracts (OpenAPI, protobuf) in their own documented section.",
        es: "Mantén los contratos compartidos (OpenAPI, protobuf) en su propia sección.",
        "zh-Hant": "把共用契約（OpenAPI、protobuf）放在獨立章節說明。",
        ja: "共有契約（OpenAPI、protobuf）は専用セクションにまとめます。",
      },
    ],
  },
  {
    id: "cicd",
    title: {
      en: "Wire context into CI/CD",
      es: "Integra el contexto en CI/CD",
      "zh-Hant": "把上下文接進 CI/CD",
      ja: "コンテキストを CI/CD に組み込む",
    },
    desc: {
      en: "A context file that drifts from the code is worse than none. Regenerate it on every meaningful change.",
      es: "Un archivo de contexto que se desvía del código es peor que ninguno. Regenera en cada cambio relevante.",
      "zh-Hant": "與程式碼脫節的上下文檔案，比沒有更糟。每次重大變更都重新生成。",
      ja: "コードと乖離したコンテキストファイルは無いより悪いです。意味のある変更ごとに再生成を。",
    },
    tips: [
      {
        en: "Add a CI step that regenerates and diffs the context file on PRs.",
        es: "Añade un paso de CI que regenere y compare el archivo de contexto en los PR.",
        "zh-Hant": "在 CI 加一步：PR 時重新生成並 diff 上下文檔案。",
        ja: "CI に「PR でコンテキストを再生成・差分チェック」のステップを追加。",
      },
      {
        en: "Fail the build if coverage or accuracy drops below your threshold.",
        es: "Falla el build si la cobertura o exactitud baja de tu umbral.",
        "zh-Hant": "若覆蓋率或準確度低於門檻，就讓建置失敗。",
        ja: "カバレッジや精度が閾値を下回ったらビルドを失敗させます。",
      },
      {
        en: "Store the generated file as an artifact so reviews see what changed.",
        es: "Guarda el archivo generado como artefacto para que la revisión vea los cambios.",
        "zh-Hant": "把生成的檔案存成 artifact，方便審查時看見變動。",
        ja: "生成ファイルをアーティファクトとして保存し、レビューで差分を見せます。",
      },
    ],
  },
  {
    id: "fresh",
    title: {
      en: "Keep docs fresh",
      es: "Mantén la documentación actualizada",
      "zh-Hant": "讓文件保持新鮮",
      ja: "ドキュメントを新鮮に保つ",
    },
    desc: {
      en: "Context decays the moment code changes. Treat the context file as a living artifact, not a one-time export.",
      es: "El contexto caduca en cuanto cambia el código. Trata el archivo como un artefacto vivo, no una exportación única.",
      "zh-Hant": "程式碼一改，上下文就開始過期。把它當成活文件，而非一次性的匯出。",
      ja: "コードが変わればコンテキストはすぐ古びます。一度きりの書き出しではなく、生きた成果物として扱いましょう。",
    },
    tips: [
      {
        en: "Re-run analysis after refactors, not just at project start.",
        es: "Vuelve a analizar tras refactors, no solo al inicio del proyecto.",
        "zh-Hant": "重構之後也要重新分析，別只在專案開始時做一次。",
        ja: "プロジェクト初期だけでなく、リファクタ後にも再分析を。",
      },
      {
        en: "Pin a quality score gate in CI so regressions are caught early.",
        es: "Fija una puerta de puntuación de calidad en CI para detectar regresiones pronto.",
        "zh-Hant": "在 CI 設品質分數門檻，早點抓到退化。",
        ja: "CI に品質スコアの門を設け、退化を早期検知します。",
      },
      {
        en: "Audit existing files quarterly; stale context quietly misleads agents.",
        es: "Audita los archivos existentes cada trimestre; lo viejo engaña en silencio.",
        "zh-Hant": "每季審計既有檔案；過期的上下文會悄悄誤導代理。",
        ja: "既存ファイルを四半期ごと監査。古いコンテキストは静かにエージェントを誤導します。",
      },
    ],
  },
]

// Page-level copy for /templates. Kept here (instead of the JSON dictionaries)
// so the four locales stay aligned with the data above in one file.
export const UI = {
  eyebrow: {
    en: "Resources",
    es: "Recursos",
    "zh-Hant": "資源",
    ja: "リソース",
  },
  title: {
    en: "Templates & playbooks",
    es: "Plantillas y guías",
    "zh-Hant": "模板與實戰手冊",
    ja: "テンプレートと実践集",
  },
  subtitle: {
    en: "Copy-paste context files, the prompts we use to build them, and the practices that keep them accurate — for Next.js, Python, Rust, Go, React Native and monorepos.",
    es: "Archivos de contexto listos para usar, los prompts que usamos para crearlos y las prácticas que los mantienen precisos — para Next.js, Python, Rust, Go, React Native y monorepos.",
    "zh-Hant": "可直接複製的上下文檔案、我們用來生成的提示詞，以及讓它們保持準確的實踐——適用於 Next.js、Python、Rust、Go、React Native 與 monorepo。",
    ja: "そのまま使えるコンテキストファイル、それを作るためのプロンプト、正確性を保つ実践——Next.js、Python、Rust、Go、React Native、モノレポ対応。",
  },
  tabSamples: {
    en: "Sample library",
    es: "Biblioteca de ejemplos",
    "zh-Hant": "樣板庫",
    ja: "サンプル集",
  },
  tabPrompts: {
    en: "Prompt templates",
    es: "Plantillas de prompt",
    "zh-Hant": "提示詞模板",
    ja: "プロンプト集",
  },
  tabBest: {
    en: "Best practices",
    es: "Buenas prácticas",
    "zh-Hant": "最佳實踐",
    ja: "ベストプラクティス",
  },
  samplesTitle: {
    en: "Sample library",
    es: "Biblioteca de ejemplos",
    "zh-Hant": "樣板庫",
    ja: "サンプル集",
  },
  samplesSub: {
    en: "Real, copy-paste context files our engine produces for common stacks.",
    es: "Archivos de contexto reales que nuestro motor genera para stacks comunes.",
    "zh-Hant": "我們的引擎為常見技術棧產生的真實、可複製上下文檔案。",
    ja: "一般的な技術スタック向けに当エンジンが生成する、実際のコピー可能なコンテキストファイル。",
  },
  format: {
    en: "Format",
    es: "Formato",
    "zh-Hant": "格式",
    ja: "形式",
  },
  copy: {
    en: "Copy",
    es: "Copiar",
    "zh-Hant": "複製",
    ja: "コピー",
  },
  copied: {
    en: "Copied ✓",
    es: "Copiado ✓",
    "zh-Hant": "已複製 ✓",
    ja: "コピー済み ✓",
  },
  promptsTitle: {
    en: "Prompt templates",
    es: "Plantillas de prompt",
    "zh-Hant": "提示詞模板",
    ja: "プロンプト集",
  },
  promptsSub: {
    en: "The prompts RepoContext runs to analyze, generate, and score your context.",
    es: "Los prompts que ejecuta RepoContext para analizar, generar y puntuar tu contexto.",
    "zh-Hant": "RepoContext 用來分析、生成與評分你上下文的提示詞。",
    ja: "RepoContext が分析・生成・スコアリングに使うプロンプト。",
  },
  useCase: {
    en: "Best for",
    es: "Ideal para",
    "zh-Hant": "適用場景",
    ja: "用途",
  },
  note: {
    en: "Why it works",
    es: "Por qué funciona",
    "zh-Hant": "為什麼有效",
    ja: "効果的な理由",
  },
  bestTitle: {
    en: "Best practices",
    es: "Buenas prácticas",
    "zh-Hant": "最佳實踐",
    ja: "ベストプラクティス",
  },
  bestSub: {
    en: "How teams keep generated context accurate as code changes.",
    es: "Cómo los equipos mantienen preciso el contexto generado al cambiar el código.",
    "zh-Hant": "當程式碼變動時，團隊如何讓生成的上下文保持準確。",
    ja: "コードが変わっても生成コンテキストを正確に保つ方法。",
  },
  tips: {
    en: "Tips",
    es: "Consejos",
    "zh-Hant": "訣竅",
    ja: "ポイント",
  },
  ctaTitle: {
    en: "Generate your own context file",
    es: "Genera tu propio archivo de contexto",
    "zh-Hant": "生成你自己的上下文檔案",
    ja: "あなたのコンテキストファイルを生成",
  },
  ctaBody: {
    en: "Paste a repository link and get an agent-ready file in seconds — no setup required.",
    es: "Pega un enlace de repositorio y obtén un archivo listo para agentes en segundos, sin configuración.",
    "zh-Hant": "貼上倉庫連結，幾秒內得到可供代理使用的檔案——無須設定。",
    ja: "リポジトリのリンクを貼るだけで、数秒でエージェント向けファイルを生成。設定不要。",
  },
  ctaButton: {
    en: "Start analyzing →",
    es: "Empezar a analizar →",
    "zh-Hant": "開始分析 →",
    ja: "分析を始める →",
  },
} as const
