/**
 * AI 工具导航数据。
 * - 每个条目给出工具名称（品牌名,各语言保持一致）、一句话说明（4 种语言）与官方站点链接。
 * - region: "intl" 表示国际产品,"cn" 表示中国大陆产品;
 *   站点面向海外用户,每个分类内国际产品排在前面。
 */
import type { Locale } from "@/app/i18n/config"

export const LOCALES_4: Locale[] = ["en", "es", "zh-Hant", "ja"]

export type LocalizedText = Record<Locale, string>

export type AiTool = {
  name: string
  desc: LocalizedText
  url: string
  /** "intl" = international, "cn" = mainland China. */
  region: "intl" | "cn"
  /**
   * Optional localized brand name. When set, the page renders the entry
   * for the active locale. `displayName()` falls back to `nameLocalized.en`,
   * then `name`, so users in any language see a clean brand name instead
   * of a mixed Chinese/English string.
   */
  nameLocalized?: LocalizedText
}

export type AiToolCategory = {
  id: string
  name: LocalizedText
  tools: AiTool[]
}

export const AI_TOOL_CATEGORIES: AiToolCategory[] = [
  {
    "id": "hot",
    "name": {
      "en": "Hot picks",
      "es": "Destacados",
      "zh-Hant": "熱門推薦",
      "ja": "人気"
    },
    "tools": [
      {
        "name": "Midjourney",
        "region": "intl",
        "url": "https://www.midjourney.com/",
        "desc": {
          "en": "Top-tier AI image generator known for artistic quality.",
          "es": "Generador de imágenes IA de primer nivel, famoso por su calidad artística.",
          "zh-Hant": "以高品質藝術風格著稱的 AI 圖像生成工具。",
          "ja": "芸術的な品質で知られる最高峰の AI 画像生成ツール。"
        }
      },
      {
        "name": "ChatGPT",
        "region": "intl",
        "url": "https://chat.openai.com",
        "desc": {
          "en": "OpenAI's general-purpose AI assistant.",
          "es": "El asistente IA de uso general de OpenAI.",
          "zh-Hant": "OpenAI 推出的通用 AI 對話助手。",
          "ja": "OpenAI の汎用 AI アシスタント。"
        }
      },
      {
        "name": "Krea AI",
        "region": "intl",
        "url": "https://www.krea.ai/",
        "desc": {
          "en": "Real-time AI image generation with live canvas rendering and upscaling.",
          "es": "Generación de imágenes IA en tiempo real con lienzo activo y escalado.",
          "zh-Hant": "即時 AI 圖像生成,支援畫布即時渲染與放大。",
          "ja": "リアルタイム AI 画像生成とアップスケール。"
        }
      },
      {
        "name": "OiiOii",
        "region": "intl",
        "url": "https://www.oiioii.ai/home",
        "desc": {
          "en": "AI animation production platform.",
          "es": "Plataforma de producción de animación con IA.",
          "zh-Hant": "AI 動畫製作平台。",
          "ja": "AI アニメーション制作プラットフォーム。"
        }
      },
      {
        "name": "TinyWow",
        "region": "intl",
        "url": "https://tinywow.com/",
        "desc": {
          "en": "All-in-one online AI toolbox for PDF, images and writing.",
          "es": "Caja de herramientas IA todo-en-uno para PDF, imágenes y escritura.",
          "zh-Hant": "線上綜合 AI 工具箱,涵蓋 PDF、圖片與寫作。",
          "ja": "PDF・画像・文章向けの統合 AI ツールボックス。"
        }
      },
      {
        "name": "LibTV",
        "region": "cn",
        "url": "https://www.liblib.tv/",
        "desc": {
          "en": "AI video creation platform for brand films and animation.",
          "es": "Plataforma de creación de video IA para anuncios y animación.",
          "zh-Hant": "AI 影片創作平台,適合品牌短片與動畫製作。",
          "ja": "ブランド映像やアニメ向けの AI 動画制作プラットフォーム。"
        }
      },
      {
        "name": "Pixmax",
        "region": "cn",
        "url": "https://www.pixmax.cn/",
        "desc": {
          "en": "AI short-drama and video creation platform.",
          "es": "Plataforma IA para crear cortos y videos.",
          "zh-Hant": "AI 短劇與影片創作平台。",
          "ja": "AI ショートドラマ・動画制作プラットフォーム。"
        }
      },
      {
        "name": "即梦 Jimeng",
        "region": "cn",
        "url": "https://jimeng.jianying.com/ai-tool/home",
        "desc": {
          "en": "ByteDance AI creation tool for text-to-image and text-to-video.",
          "es": "Herramienta de creación IA de ByteDance para imagen y video a partir de texto.",
          "zh-Hant": "字節跳動 AI 創作工具,支援文生圖與文生影片。",
          "ja": "ByteDance の AI 創作ツール(テキストから画像・動画)。"
        }
      },
      {
        "name": "豆包 Doubao",
        "region": "cn",
        "url": "https://www.doubao.com/chat/",
        "desc": {
          "en": "ByteDance's general-purpose AI assistant.",
          "es": "Asistente IA de uso general de ByteDance.",
          "zh-Hant": "字節跳動通用 AI 助手。",
          "ja": "ByteDance の汎用 AI アシスタント。"
        }
      },
      {
        "name": "稿定 AI Gaoding",
        "region": "cn",
        "url": "https://www.gaoding.com/",
        "desc": {
          "en": "AI features inside the Gaoding design platform: text-to-image, cutout, eraser.",
          "es": "Funciones IA dentro de la plataforma Gaoding: texto a imagen, recorte, borrador.",
          "zh-Hant": "稿定設計平台內建 AI 能力,支援文生圖、摳圖與消除。",
          "ja": "Gaoding デザインプラットフォームの AI 機能(画像生成・切り抜き・消去)。"
        }
      },
      {
        "name": "AI 星踪岛",
        "region": "cn",
        "url": "https://aixzd.com/",
        "desc": {
          "en": "AI learning and tool aggregation platform.",
          "es": "Plataforma de aprendizaje y agregación de herramientas IA.",
          "zh-Hant": "AI 知識學習與工具聚合平台。",
          "ja": "AI 学習とツール集約プラットフォーム。"
        }
      },
      {
        "name": "AiPPT",
        "region": "cn",
        "url": "https://www.aippt.cn/",
        "desc": {
          "en": "Generate presentation slides from a single prompt.",
          "es": "Genera diapositivas de presentación a partir de un solo prompt.",
          "zh-Hant": "一鍵根據文字生成 PPT 簡報。",
          "ja": "ワンクリックで PPT スライドを生成。"
        }
      }
    ]
  },
  {
    "id": "agent",
    "name": {
      "en": "AI Agents",
      "es": "Agentes IA",
      "zh-Hant": "Agent 智慧體",
      "ja": "AI エージェント"
    },
    "tools": [
      {
        "name": "Manus",
        "region": "intl",
        "url": "https://manus.im/app",
        "desc": {
          "en": "General-purpose AI agent that plans and completes complex tasks autonomously.",
          "es": "Agente IA de uso general que planifica y completa tareas complejas de forma autónoma.",
          "zh-Hant": "通用型 AI Agent,可自主規劃並完成複雜任務。",
          "ja": "複雑なタスクを自律的に計画・実行する汎用 AI エージェント。"
        }
      },
      {
        "name": "Skywork",
        "region": "intl",
        "url": "https://skywork.ai/",
        "desc": {
          "en": "Multimodal super-agent that generates docs and slides in one place.",
          "es": "Superagente multimodal que genera documentos y diapositivas en un solo lugar.",
          "zh-Hant": "多模態超級 Agent,一站生成文件與簡報。",
          "ja": "ドキュメントとスライドを統合生成するマルチモーダルスーパーエージェント。"
        }
      },
      {
        "name": "Lovart",
        "region": "intl",
        "url": "https://www.lovart.ai/",
        "desc": {
          "en": "AI design agent aimed at professional designers.",
          "es": "Agente de diseño IA pensado para diseñadores profesionales.",
          "zh-Hant": "面向設計師的 AI 設計 Agent。",
          "ja": "プロフェッショナルデザイナー向け AI デザインエージェント。"
        }
      },
      {
        "name": "扣子 Coze",
        "region": "cn",
        "url": "https://www.coze.cn/overview",
        "desc": {
          "en": "Build AI agents with no code, rich plugin ecosystem.",
          "es": "Crea agentes IA sin código, con un rico ecosistema de plugins.",
          "zh-Hant": "零代碼搭建 AI Agent,插件生態豐富。",
          "ja": "ノーコードで AI エージェントを構築、豊富なプラグイン。"
        }
      },
      {
        "name": "星辰 Agent",
        "region": "cn",
        "url": "https://agent.xfyun.cn/",
        "desc": {
          "en": "iFlytek's enterprise-grade agent-building platform.",
          "es": "Plataforma de construcción de agentes empresariales de iFlytek.",
          "zh-Hant": "科大訊飛推出的企業級 Agent 平台。",
          "ja": "iFlytek のエンタープライズ向けエージェント構築プラットフォーム。"
        }
      },
      {
        "name": "MiniMax Agent",
        "region": "intl",
        "url": "https://agent.minimax.io/",
        "desc": {
          "en": "General-purpose AI agent for multi-scenario automation.",
          "es": "Agente IA de uso general para automatización multi-escenario.",
          "zh-Hant": "通用 AI 智能體,適配多場景自動化。",
          "ja": "マルチシナリオ自動化に対応する汎用 AI エージェント。"
        }
      }
    ]
  },
  {
    "id": "skills",
    "name": {
      "en": "Agent Skills",
      "es": "Skills de agente",
      "zh-Hant": "Agent 技能",
      "ja": "エージェントスキル"
    },
    "tools": [
      {
        "name": "Skills.sh",
        "region": "intl",
        "url": "https://skills.sh/",
        "desc": {
          "en": "Trending agent skills with one-click install.",
          "es": "Habilidades de agente en tendencia, instalables con un clic.",
          "zh-Hant": "海量技能即時熱度榜,支援一鍵安裝。",
          "ja": "人気エージェントスキルをワンクリックで導入。"
        }
      },
      {
        "name": "Skillsmp",
        "region": "intl",
        "url": "https://skillsmp.com/",
        "desc": {
          "en": "Open-source agent skill marketplace.",
          "es": "Mercado de skills de agente de código abierto.",
          "zh-Hant": "聚合大量開源技能的 Agent 技能市場。",
          "ja": "オープンソースのエージェントスキルを集約したマーケット。"
        }
      },
      {
        "name": "Skills Directory",
        "region": "intl",
        "url": "https://www.skillsdirectory.com/",
        "desc": {
          "en": "Community-curated skills ranking to surface quality picks.",
          "es": "Ranking de skills de la comunidad para descubrir calidad.",
          "zh-Hant": "社群口碑技能榜單,助你篩選優質技能。",
          "ja": "コミュニティのおすすめスキルランキング。"
        }
      },
      {
        "name": "Agent Skills",
        "region": "intl",
        "url": "https://agent-skills.md/",
        "desc": {
          "en": "Curated ready-to-use agent skills.",
          "es": "Habilidades de agente listas para usar.",
          "zh-Hant": "高頻開箱即用技能集合。",
          "ja": "すぐに使える精選エージェントスキル。"
        }
      },
      {
        "name": "AgentSkills",
        "region": "intl",
        "url": "https://agentskills.me/",
        "desc": {
          "en": "One-stop agent skill store with many third-party skills.",
          "es": "Tienda de skills de agente integral con muchos skills de terceros.",
          "zh-Hant": "一站式 Agent 技能商店,收錄大量第三方技能。",
          "ja": "サードパーティ製スキルを集約した総合マーケット。"
        }
      },
      {
        "name": "Clawhub",
        "region": "intl",
        "url": "https://clawhub.ai/",
        "desc": {
          "en": "OpenClaw ecosystem official skill store.",
          "es": "Tienda oficial de skills del ecosistema OpenClaw.",
          "zh-Hant": "OpenClaw 生態官方技能商店。",
          "ja": "OpenClaw エコシステムの公式スキルストア。"
        }
      },
      {
        "name": "Anthropic Skills",
        "region": "intl",
        "url": "https://github.com/anthropics/skills",
        "desc": {
          "en": "Anthropic's official open-source skill repository.",
          "es": "Repositorio oficial de skills open-source de Anthropic.",
          "zh-Hant": "Anthropic 官方開源技能倉庫。",
          "ja": "Anthropic 公式のオープンソーススキルリポジトリ。"
        }
      },
      {
        "name": "Awesome Agent Skills",
        "region": "intl",
        "url": "https://github.com/JackyST0/awesome-agent-skills",
        "desc": {
          "en": "Community-picked awesome agent skills collection.",
          "es": "Colección comunitaria de skills de agenteAwesome.",
          "zh-Hant": "社群精選的優質 Agent 技能合集。",
          "ja": "コミュニティ厳選の優れたエージェントスキル集。"
        }
      },
      {
        "name": "Skillstore",
        "region": "cn",
        "url": "https://skillstore.io/zh-hans",
        "desc": {
          "en": "Chinese-friendly skill store with security-reviewed skills.",
          "es": "Tienda de skills en chino, con skills revisados por seguridad.",
          "zh-Hant": "中文友好技能商店,技能經過安全審查。",
          "ja": "中国語対応のスキルストア(安全性審査済み)。"
        }
      },
      {
        "name": "SkillHub",
        "region": "cn",
        "url": "https://skillhub.tencent.com/",
        "desc": {
          "en": "Tencent's high-speed skill download hub.",
          "es": "Centro de descarga rápida de skills de Tencent.",
          "zh-Hant": "騰訊出品的技能高速下載站。",
          "ja": "Tencent のスキル高速ダウンロードハブ。"
        }
      },
      {
        "name": "AI Templates",
        "region": "intl",
        "url": "https://www.aitmpl.com/skills",
        "desc": {
          "en": "AI skill template collection for quick reuse.",
          "es": "Colección de plantillas de skills IA listas para reutilizar.",
          "zh-Hant": "AI 技能模板集合,快速複用各類實用技能。",
          "ja": "AI スキルテンプレート集(すぐ再利用可能)。"
        }
      },
      {
        "name": "Skillbox",
        "region": "cn",
        "url": "https://skill-box.zwtj.site/",
        "desc": {
          "en": "Unified skill management center for AI agents.",
          "es": "Centro unificado de gestión de skills para agentes IA.",
          "zh-Hant": "AI Agents 統一技能管理中心。",
          "ja": "AI エージェント向け統合スキル管理センター。"
        }
      }
    ]
  },
  {
    "id": "art",
    "name": {
      "en": "AI Art",
      "es": "Arte con IA",
      "zh-Hant": "AI 繪畫",
      "ja": "AI アート"
    },
    "tools": [
      {
        "name": "Midjourney",
        "region": "intl",
        "url": "https://www.midjourney.com/",
        "desc": {
          "en": "Top-tier AI image generator known for artistic quality.",
          "es": "Generador de imágenes IA de primer nivel, famoso por su calidad artística.",
          "zh-Hant": "以高品質藝術風格著稱的 AI 圖像生成工具。",
          "ja": "芸術的な品質で知られる最高峰の AI 画像生成ツール。"
        }
      },
      {
        "name": "Flux.1",
        "region": "intl",
        "url": "https://blackforestlabs.ai/",
        "desc": {
          "en": "Open-source text-to-image model with strong prompt following.",
          "es": "Modelo open-source de texto a imagen con gran seguimiento de prompts.",
          "zh-Hant": "開源文生圖模型,提示詞跟隨表現出色。",
          "ja": "プロンプト追従性に優れたオープンソースのテキストto画像モデル。"
        }
      },
      {
        "name": "Stable Diffusion",
        "region": "intl",
        "url": "https://stability.ai/",
        "desc": {
          "en": "The most well-known open-source AI image model family.",
          "es": "La familia de modelos de imagen IA open-source más conocida.",
          "zh-Hant": "最知名的開源 AI 繪畫模型系列。",
          "ja": "最も有名なオープンソース AI 画像モデル群。"
        }
      },
      {
        "name": "DALL·E 2",
        "region": "intl",
        "url": "https://openai.com/dall-e-2",
        "desc": {
          "en": "OpenAI's text-to-image model.",
          "es": "Modelo de texto a imagen de OpenAI.",
          "zh-Hant": "OpenAI 推出的文生圖模型。",
          "ja": "OpenAI のテキストto画像モデル。"
        }
      },
      {
        "name": "Civitai",
        "region": "intl",
        "url": "https://civitai.com/",
        "desc": {
          "en": "AI art sharing platform with massive open model and LoRA library.",
          "es": "Plataforma de arte IA con enorme biblioteca de modelos y LoRA open-source.",
          "zh-Hant": "AI 藝術共享平台,海量開源模型與 LoRA。",
          "ja": "豊富なオープンソースモデルと LoRA を備えた AI アート共有プラットフォーム。"
        }
      },
      {
        "name": "Hugging Face",
        "region": "intl",
        "url": "https://huggingface.co/",
        "desc": {
          "en": "Open-source model and dataset hosting platform.",
          "es": "Plataforma de alojamiento de modelos y datasets open-source.",
          "zh-Hant": "開源模型與資料集託管平台。",
          "ja": "オープンソースモデルとデータセットのホスティングプラットフォーム。"
        }
      },
      {
        "name": "DreamStudio",
        "region": "intl",
        "url": "https://dreamstudio.ai/",
        "desc": {
          "en": "Stability AI's official image generation tool.",
          "es": "Herramienta oficial de generación de imágenes de Stability AI.",
          "zh-Hant": "Stability AI 官方的圖像生成工具。",
          "ja": "Stability AI 公式の画像生成ツール。"
        }
      },
      {
        "name": "Lexica",
        "region": "intl",
        "url": "https://lexica.art/",
        "desc": {
          "en": "AI image generation with prompt search engine.",
          "es": "Generación de imágenes IA con motor de búsqueda de prompts.",
          "zh-Hant": "AI 圖像生成與提示詞搜尋引擎。",
          "ja": "AI 画像生成とプロンプト検索エンジン。"
        }
      },
      {
        "name": "Leonardo",
        "region": "intl",
        "url": "https://leonardo.ai/",
        "desc": {
          "en": "AI art community; train your own game-asset models.",
          "es": "Comunidad de arte IA; entrena tus propios modelos de assets de juego.",
          "zh-Hant": "AI 繪圖社群,可訓練自有模型與遊戲資產。",
          "ja": "AI アートコミュニティ(独自モデル・ゲームアセットの学習が可能)。"
        }
      },
      {
        "name": "NightCafe",
        "region": "intl",
        "url": "https://creator.nightcafe.studio/",
        "desc": {
          "en": "Multi-algorithm AI art creation community.",
          "es": "Comunidad de creación de arte IA multi-algoritmo.",
          "zh-Hant": "支援多種演算法的 AI 藝術創作社群。",
          "ja": "複数アルゴリズムに対応する AI アート作成コミュニティ。"
        }
      },
      {
        "name": "Fooocus",
        "region": "intl",
        "url": "https://github.com/lllyasviel/Fooocus",
        "desc": {
          "en": "Free open-source local image generator with simple UI.",
          "es": "Generador local de imágenes open-source gratuito con UI sencilla.",
          "zh-Hant": "開源免費、操作簡單的本地圖像生成工具。",
          "ja": "オープンソースで無料のローカル画像生成ツール(シンプル UI)。"
        }
      },
      {
        "name": "Adobe Firefly",
        "region": "intl",
        "url": "https://firefly.adobe.com/",
        "desc": {
          "en": "Adobe's creative generative AI model family.",
          "es": "Familia de modelos IA generativos creativos de Adobe.",
          "zh-Hant": "Adobe 旗下的創意生成式 AI 模型。",
          "ja": "Adobe のクリエイティブ生成 AI モデル群。"
        }
      },
      {
        "name": "Krea AI",
        "region": "intl",
        "url": "https://www.krea.ai/",
        "desc": {
          "en": "Real-time AI image generation and enhancement.",
          "es": "Generación y mejora de imágenes IA en tiempo real.",
          "zh-Hant": "即時 AI 圖像創作與增強平台。",
          "ja": "リアルタイム AI 画像生成とエンハンスメント。"
        }
      },
      {
        "name": "OpenArt",
        "region": "intl",
        "url": "https://openart.ai/home",
        "desc": {
          "en": "Train your own LoRA from scratch with no prior experience.",
          "es": "Entrena tu propio LoRA desde cero sin experiencia previa.",
          "zh-Hant": "零基礎也能訓練專屬 LoRA 的創作平台。",
          "ja": "初心者でも独自 LoRA を学習できる制作プラットフォーム。"
        }
      },
      {
        "name": "NijiJourney",
        "region": "intl",
        "url": "https://nijijourney.com/zh/",
        "desc": {
          "en": "Anime-style focused AI image generator.",
          "es": "Generador de imágenes IA enfocado en estilo anime.",
          "zh-Hant": "面向二次元風格的 AI 圖像生成工具。",
          "ja": "アニメ調に特化した AI 画像生成ツール。"
        }
      },
      {
        "name": "Whisk",
        "region": "intl",
        "url": "https://labs.google/fx/zh/tools/whisk",
        "desc": {
          "en": "Google's image-mixing creative tool.",
          "es": "Herramienta creativa de mezcla de imágenes de Google.",
          "zh-Hant": "Google 出品的圖像混合創意工具。",
          "ja": "Google の画像ミックスクリエイティブツール。"
        }
      },
      {
        "name": "Bing Image Creator",
        "region": "intl",
        "url": "https://cn.bing.com/create",
        "desc": {
          "en": "Free DALL·E-powered image generation tool.",
          "es": "Herramienta gratuita de generación de imágenes con DALL·E.",
          "zh-Hant": "基於 DALL·E 的免費圖像生成工具。",
          "ja": "DALL·E を活用した無料画像生成ツール。"
        }
      },
      {
        "name": "Artbreeder",
        "region": "intl",
        "url": "https://www.artbreeder.com/browse",
        "desc": {
          "en": "\"Breed\" unique art by remixing AI-generated images.",
          "es": "\"Cruza\" obras únicas mezclando imágenes generadas con IA.",
          "zh-Hant": "透過圖像「育種」創作獨特藝術作品。",
          "ja": "AI 画像を掛け合わせて独自の作品を「育種」する。"
        }
      },
      {
        "name": "DreamUp",
        "region": "intl",
        "url": "https://www.dreamup.com/",
        "desc": {
          "en": "DeviantArt's AI image generation tool.",
          "es": "Herramienta de generación de imágenes IA de DeviantArt.",
          "zh-Hant": "DeviantArt 推出的 AI 繪畫工具。",
          "ja": "DeviantArt 提供の AI 描画ツール。"
        }
      },
      {
        "name": "AISEO Art",
        "region": "intl",
        "url": "https://art.aiseo.ai/",
        "desc": {
          "en": "AI image tool trained on a detailed category taxonomy.",
          "es": "Herramienta de imágenes IA entrenada con taxonomía detallada.",
          "zh-Hant": "按分類精細訓練的 AI 圖像生成工具。",
          "ja": "詳細なカテゴリ分類で学習された AI 画像生成ツール。"
        }
      },
      {
        "name": "Illostration",
        "region": "intl",
        "url": "https://www.illostration.com/",
        "desc": {
          "en": "Create stylized illustrations in seconds.",
          "es": "Crea ilustraciones estilizadas en segundos.",
          "zh-Hant": "幾秒內生成不同風格的插畫。",
          "ja": "数秒で様々なスタイルのイラストを生成。"
        }
      },
      {
        "name": "Pikzels",
        "region": "intl",
        "url": "https://pikzels.com/",
        "desc": {
          "en": "Generate high-CTR YouTube thumbnails.",
          "es": "Genera miniaturas de YouTube con alto CTR.",
          "zh-Hant": "專注生成高點擊率 YouTube 縮圖。",
          "ja": "高 CTR の YouTube サムネイルを生成。"
        }
      },
      {
        "name": "Imagine with Meta",
        "region": "intl",
        "url": "https://imagine.meta.com/",
        "desc": {
          "en": "Meta's free AI image generation tool.",
          "es": "Herramienta gratuita de generación de imágenes IA de Meta.",
          "zh-Hant": "Meta 推出的免費 AI 繪畫工具。",
          "ja": "Meta 提供の無料 AI 描画ツール。"
        }
      },
      {
        "name": "Dreamlike.art",
        "region": "intl",
        "url": "https://dreamlike.art/",
        "desc": {
          "en": "AI image generator with several built-in models.",
          "es": "Generador de imágenes IA con varios modelos integrados.",
          "zh-Hant": "內建多種模型的 AI 圖像生成器。",
          "ja": "複数のモデルを内蔵した AI 画像生成ツール。"
        }
      },
      {
        "name": "Canva AI",
        "region": "intl",
        "url": "https://www.canva.cn/",
        "desc": {
          "en": "Free AI art tool inside Canva.",
          "es": "Herramienta gratuita de arte IA dentro de Canva.",
          "zh-Hant": "Canva 內建的免費 AI 設計與繪圖工具。",
          "ja": "Canva 内蔵の無料 AI デザイン・描画ツール。"
        }
      },
      {
        "name": "liblib哩布哩布",
        "region": "cn",
        "url": "https://www.liblib.art/",
        "desc": {
          "en": "Leading Chinese AI creation platform with many high-quality models.",
          "es": "Plataforma china líder de creación IA con muchos modelos de alta calidad.",
          "zh-Hant": "國內領先的 AI 創作平台,優質模型豐富。",
          "ja": "中国最先端の AI 制作プラットフォーム(高品質モデル豊富)。"
        }
      },
      {
        "name": "TensorArt",
        "region": "cn",
        "url": "https://tensor.art/",
        "desc": {
          "en": "AI creation community with tens of thousands of open models.",
          "es": "Comunidad de creación IA con decenas de miles de modelos open-source.",
          "zh-Hant": "AI 創作社群,數萬開源模型可線上使用。",
          "ja": "数万のオープンソースモデルを備えた AI 制作コミュニティ。"
        }
      },
      {
        "name": "无界 AI",
        "region": "cn",
        "url": "https://www.wujieai.com/",
        "desc": {
          "en": "One-stop AI creation, sharing and social platform.",
          "es": "Plataforma integral de creación, intercambio y comunidad IA.",
          "zh-Hant": "一站式 AI 創作、交流與分享平台。",
          "ja": "AI 制作・交流・共有をワンストップで。"
        }
      },
      {
        "name": "星流 AI",
        "region": "cn",
        "url": "https://www.xingliu.art/",
        "desc": {
          "en": "AI creation platform focused on high-resolution output.",
          "es": "Plataforma de creación IA enfocada en salida de alta resolución.",
          "zh-Hant": "主打高畫質直出的 AI 創作平台。",
          "ja": "高解像度出力に重点を置いた AI 制作プラットフォーム。"
        }
      },
      {
        "name": "Nano Banana (Google AI Studio)",
        "region": "intl",
        "url": "https://aistudio.google.com/",
        "desc": {
          "en": "Google AI Studio with Gemini image generation.",
          "es": "Google AI Studio con generación de imágenes Gemini.",
          "zh-Hant": "Google AI Studio,支援 Gemini 圖像生成。",
          "ja": "Gemini 画像生成機能を備えた Google AI Studio。"
        }
      }
    ]
  },
  {
    "id": "chat",
    "name": {
      "en": "AI Chat",
      "es": "Chat IA",
      "zh-Hant": "AI 聊天",
      "ja": "AI チャット"
    },
    "tools": [
      {
        "name": "ChatGPT",
        "region": "intl",
        "url": "https://chat.openai.com",
        "desc": {
          "en": "OpenAI's general-purpose AI assistant.",
          "es": "El asistente IA de uso general de OpenAI.",
          "zh-Hant": "OpenAI 推出的通用 AI 對話助手。",
          "ja": "OpenAI の汎用 AI アシスタント。"
        }
      },
      {
        "name": "Gemini",
        "region": "intl",
        "url": "https://gemini.google.com/app",
        "desc": {
          "en": "Google's flagship multimodal AI for text, audio, video, and documents.",
          "es": "IA multimodal de Google para texto, audio, video y documentos.",
          "zh-Hant": "Google 旗艦多模態 AI,可處理音訊、影片與文件。",
          "ja": "テキスト・音声・動画・ドキュメントに対応する Google の主力マルチモーダル AI。"
        }
      },
      {
        "name": "Claude",
        "region": "intl",
        "url": "https://claude.com/product/overview",
        "desc": {
          "en": "Safety-focused enterprise AI great at long-document analysis.",
          "es": "IA empresarial enfocada en seguridad, ideal para analizar documentos largos.",
          "zh-Hant": "注重安全合規的企業級 AI,擅長長文件解讀。",
          "ja": "安全性重視のエンタープライズ AI(長文読解に強い)。"
        }
      },
      {
        "name": "Grok",
        "region": "intl",
        "url": "https://grok.com/",
        "desc": {
          "en": "xAI's AI assistant tuned for real-time news and trends.",
          "es": "Asistente IA de xAI centrado en noticias y tendencias en tiempo real.",
          "zh-Hant": "xAI 推出的 AI 助手,擅長即時資訊。",
          "ja": "リアルタイムニュースに強い xAI の AI アシスタント。"
        }
      },
      {
        "name": "Anthropic",
        "region": "intl",
        "url": "https://www.anthropic.com/",
        "desc": {
          "en": "The team behind the Claude model family.",
          "es": "El equipo detrás de la familia de modelos Claude.",
          "zh-Hant": "Claude 系列模型的開發公司。",
          "ja": "Claude モデルファミリーの開発元。"
        }
      },
      {
        "name": "Google Bard",
        "region": "intl",
        "url": "https://bard.google.com",
        "desc": {
          "en": "Google's AI conversation model (now part of Gemini).",
          "es": "Modelo de conversación IA de Google (ahora parte de Gemini).",
          "zh-Hant": "Google 推出的 AI 對話模型(已併入 Gemini)。",
          "ja": "Google の AI 会話モデル(Gemini に統合)。"
        }
      },
      {
        "name": "New Bing",
        "region": "intl",
        "url": "https://www.bing.com/new",
        "desc": {
          "en": "Microsoft's AI-powered conversational search engine.",
          "es": "Motor de búsqueda conversacional con IA de Microsoft.",
          "zh-Hant": "微軟推出的 AI 對話式搜尋引擎。",
          "ja": "Microsoft の AI 会話型検索エンジン。"
        }
      },
      {
        "name": "DeepSeek",
        "region": "cn",
        "url": "https://www.deepseek.com/",
        "desc": {
          "en": "Strong Chinese-built reasoning model for code, math, and long text.",
          "es": "Modelo de razonamiento chino de alto rendimiento para código, matemáticas y textos largos.",
          "zh-Hant": "國產強推理模型,擅長程式碼、數學與長文理解。",
          "ja": "中国製の高性能推論モデル(コード・数学・長文に強い)。"
        }
      },
      {
        "name": "文心一言",
        "region": "cn",
        "url": "https://yiyan.baidu.com/",
        "desc": {
          "en": "Baidu's knowledge-enhanced large language model.",
          "es": "Modelo de lenguaje grande mejorado con conocimiento de Baidu.",
          "zh-Hant": "百度推出的知識增強大語言模型。",
          "ja": "百度提供のナレッジ強化大規模言語モデル。"
        }
      },
      {
        "name": "通义千问",
        "region": "cn",
        "url": "https://www.qianwen.com/",
        "desc": {
          "en": "Alibaba's multilingual personal AI assistant.",
          "es": "Asistente personal multilingüe de Alibaba.",
          "zh-Hant": "阿里推出的多語言個人助理。",
          "ja": "Alibaba の多言語対応パーソナル AI アシスタント。"
        }
      },
      {
        "name": "Kimi",
        "region": "cn",
        "url": "https://kimi.moonshot.cn/",
        "desc": {
          "en": "AI assistant specialized in long-context understanding.",
          "es": "Asistente IA especializado en comprensión de contextos largos.",
          "zh-Hant": "擅長長文本處理的 AI 助手。",
          "ja": "長文コンテキスト理解に特化した AI アシスタント。"
        }
      },
      {
        "name": "腾讯元宝",
        "region": "cn",
        "url": "https://yuanbao.tencent.com/",
        "desc": {
          "en": "Tencent's AI assistant with WeChat ecosystem hooks.",
          "es": "Asistente IA de Tencent integrado con el ecosistema WeChat.",
          "zh-Hant": "騰訊推出的 AI 助手,可與微信生態聯動。",
          "ja": "Tencent の AI アシスタント(WeChat エコシステム連携)。"
        }
      }
    ]
  },
  {
    "id": "prompt",
    "name": {
      "en": "AI Prompts",
      "es": "Prompts IA",
      "zh-Hant": "AI 提示詞",
      "ja": "AI プロンプト"
    },
    "tools": [
      {
        "name": "PromptHero",
        "region": "intl",
        "url": "https://prompthero.com/",
        "desc": {
          "en": "Popular AI prompt and image search engine.",
          "es": "Buscador popular de prompts e imágenes IA.",
          "zh-Hant": "受歡迎的 AI 提示詞與圖像搜尋引擎。",
          "ja": "人気の AI プロンプト・画像検索エンジン。"
        }
      },
      {
        "name": "FlowGPT",
        "region": "intl",
        "url": "https://flowgpt.com/",
        "desc": {
          "en": "Community of AI creators sharing prompts and workflows.",
          "es": "Comunidad de creadores IA que comparten prompts y flujos.",
          "zh-Hant": "面向 AI 玩家的提示詞與創作社群。",
          "ja": "AI ユーザー向けプロンプト・制作コミュニティ。"
        }
      },
      {
        "name": "PromptBase",
        "region": "intl",
        "url": "https://promptbase.com/",
        "desc": {
          "en": "Marketplace for buying and selling prompts.",
          "es": "Mercado para comprar y vender prompts.",
          "zh-Hant": "提示詞交易市場。",
          "ja": "プロンプト売買のマーケットプレイス。"
        }
      },
      {
        "name": "Snack Prompt",
        "region": "intl",
        "url": "https://snackprompt.com/",
        "desc": {
          "en": "Reddit-style library of high-quality prompts.",
          "es": "Biblioteca de prompts de alta calidad estilo Reddit.",
          "zh-Hant": "社群驅動的優質提示詞庫。",
          "ja": "Reddit 風の高品質プロンプトライブラリ。"
        }
      },
      {
        "name": "Prompt Hunt",
        "region": "intl",
        "url": "https://www.prompthunt.com/explore",
        "desc": {
          "en": "Topic-organized prompt exploration platform.",
          "es": "Plataforma de exploración de prompts organizada por temas.",
          "zh-Hant": "按主題分類的提示詞探索平台。",
          "ja": "トピック別で整理されたプロンプト探索プラットフォーム。"
        }
      },
      {
        "name": "Learning Prompt",
        "region": "intl",
        "url": "https://learningprompt.wiki/",
        "desc": {
          "en": "Chinese-friendly ChatGPT prompt engineering guide.",
          "es": "Guía de ingeniería de prompts para ChatGPT, amigable en chino.",
          "zh-Hant": "ChatGPT 提示詞中文指南。",
          "ja": "ChatGPT プロンプトエンジニアリング中文ガイド。"
        }
      },
      {
        "name": "PromptoMania",
        "region": "intl",
        "url": "https://promptomania.com/",
        "desc": {
          "en": "Midjourney and Stable Diffusion prompt builder.",
          "es": "Constructor de prompts para Midjourney y Stable Diffusion.",
          "zh-Hant": "Midjourney 與 Stable Diffusion 提示詞產生器。",
          "ja": "Midjourney・Stable Diffusion 用のプロンプトビルダー。"
        }
      },
      {
        "name": "Content at Scale",
        "region": "intl",
        "url": "https://contentatscale.ai/ai-prompt-library/",
        "desc": {
          "en": "Library of the best ChatGPT prompts.",
          "es": "Biblioteca de los mejores prompts para ChatGPT.",
          "zh-Hant": "收錄最佳 ChatGPT 提示詞的資源庫。",
          "ja": "ChatGPT の最良プロンプトを集めたライブラリ。"
        }
      },
      {
        "name": "AI Valley",
        "region": "intl",
        "url": "https://aivalley.ai/prompt/",
        "desc": {
          "en": "AI tool aggregator with hundreds of curated prompts.",
          "es": "Agregador de herramientas IA con cientos de prompts seleccionados.",
          "zh-Hant": "AI 工具聚合站,附大量精選提示詞。",
          "ja": "AI ツール集約サイトに多数の厳選プロンプト。"
        }
      },
      {
        "name": "Midlibrary",
        "region": "intl",
        "url": "https://midlibrary.io/",
        "desc": {
          "en": "Large Midjourney style and prompt library.",
          "es": "Gran biblioteca de estilos y prompts para Midjourney.",
          "zh-Hant": "收錄大量 Midjourney 風格與提示詞。",
          "ja": "Midjourney のスタイルとプロンプトを多数収録。"
        }
      },
      {
        "name": "Promptalot",
        "region": "intl",
        "url": "https://promptalot.com/",
        "desc": {
          "en": "Midjourney prompt helper and builder plugin.",
          "es": "Plugin de ayuda y constructor de prompts para Midjourney.",
          "zh-Hant": "Midjourney 提示詞輔助與建構外掛。",
          "ja": "Midjourney プロンプト支援・構築プラグイン。"
        }
      },
      {
        "name": "MJ Prompt Tool",
        "region": "intl",
        "url": "https://prompt.noonshot.com/",
        "desc": {
          "en": "Midjourney prompt creator helper.",
          "es": "Asistente para crear prompts de Midjourney.",
          "zh-Hant": "Midjourney 提示詞創造助手。",
          "ja": "Midjourney プロンプト作成支援ツール。"
        }
      },
      {
        "name": "AIWIND",
        "region": "intl",
        "url": "https://www.aiwind.org/",
        "desc": {
          "en": "Professional multimodal prompt platform for high-quality AI output.",
          "es": "Plataforma profesional de prompts multimodales para resultados IA de alta calidad.",
          "zh-Hant": "專業多模態提示詞平台,產出專業級 AI 作品。",
          "ja": "プロフェッショナル向けマルチモーダルプロンプトプラットフォーム。"
        }
      },
      {
        "name": "LIB.KALOS.ART",
        "region": "intl",
        "url": "https://lib.kalos.art/",
        "desc": {
          "en": "Art-style and genre reference library.",
          "es": "Biblioteca de referencia de estilos y géneros artísticos.",
          "zh-Hant": "藝術風格與流派參考庫。",
          "ja": "芸術スタイル・ジャンルの参考ライブラリ。"
        }
      },
      {
        "name": "PublicPrompts",
        "region": "intl",
        "url": "https://publicprompts.art/",
        "desc": {
          "en": "AI art models and style reference collection.",
          "es": "Modelos de arte IA y colección de referencia de estilos.",
          "zh-Hant": "AI 繪畫模型與風格參考集合。",
          "ja": "AI 描画モデルとスタイル参考のコレクション。"
        }
      },
      {
        "name": "Catjourney",
        "region": "intl",
        "url": "https://catjourney.life/",
        "desc": {
          "en": "Big library of Midjourney Style Tuner styles.",
          "es": "Gran biblioteca de estilos de Midjourney Style Tuner.",
          "zh-Hant": "大量 Midjourney Style Tuner 風格庫。",
          "ja": "Midjourney Style Tuner スタイルを多数収録。"
        }
      },
      {
        "name": "OpenArt",
        "region": "intl",
        "url": "https://openart.ai/home",
        "desc": {
          "en": "Stable Diffusion art creation and prompt platform.",
          "es": "Plataforma de creación de arte y prompts para Stable Diffusion.",
          "zh-Hant": "Stable Diffusion 創作與提示詞平台。",
          "ja": "Stable Diffusion 制作・プロンプトプラットフォーム。"
        }
      }
    ]
  },
  {
    "id": "image",
    "name": {
      "en": "AI Image Tools",
      "es": "Edición de imagen IA",
      "zh-Hant": "AI 圖像處理",
      "ja": "AI 画像処理"
    },
    "tools": [
      {
        "name": "Upscayl",
        "region": "intl",
        "url": "https://www.upscayl.org/",
        "desc": {
          "en": "Open-source free AI image upscaler.",
          "es": "Escalador de imágenes IA gratuito y open-source.",
          "zh-Hant": "開源免費的 AI 圖片無損放大工具。",
          "ja": "オープンソースで無料の AI 画像アップスケーラー。"
        }
      },
      {
        "name": "MagicStudio",
        "region": "intl",
        "url": "https://magicstudio.com/zh",
        "desc": {
          "en": "AI image editing and background removal in the browser.",
          "es": "Edición de imágenes IA y eliminación de fondo en el navegador.",
          "zh-Hant": "線上 AI 圖片編輯與背景處理工具。",
          "ja": "ブラウザで使える AI 画像編集・背景処理ツール。"
        }
      },
      {
        "name": "Clipdrop",
        "region": "intl",
        "url": "https://clipdrop.co/",
        "desc": {
          "en": "Versatile all-in-one AI image processing toolbox.",
          "es": "Caja de herramientas IA de imagen versátil y todo-en-uno.",
          "zh-Hant": "功能豐富的 AI 圖像處理工具箱。",
          "ja": "多機能な AI 画像処理ツールボックス。"
        }
      },
      {
        "name": "Designify",
        "region": "intl",
        "url": "https://www.designify.com/",
        "desc": {
          "en": "Free online background removal with auto design composition.",
          "es": "Eliminación de fondo gratuita con composición de diseño automática.",
          "zh-Hant": "免費線上摳圖並自動合成設計稿。",
          "ja": "無料の自動背景除去とデザイン合成。"
        }
      },
      {
        "name": "Vectorizer",
        "region": "intl",
        "url": "https://vectorizer.ai/",
        "desc": {
          "en": "Convert bitmap images to vector format in one click.",
          "es": "Convierte imágenes bitmap a vector con un clic.",
          "zh-Hant": "一鍵將點陣圖轉換為向量圖。",
          "ja": "ワンクリックでビットマップをベクターに変換。"
        }
      },
      {
        "name": "Pixian AI",
        "region": "intl",
        "url": "https://pixian.ai/",
        "desc": {
          "en": "Highly-rated online AI background removal tool.",
          "es": "Herramienta de eliminación de fondo IA muy bien valorada.",
          "zh-Hant": "高評價的線上 AI 摳圖工具。",
          "ja": "評価の高いオンライン AI 背景除去ツール。"
        }
      },
      {
        "name": "Krea",
        "region": "intl",
        "url": "https://www.krea.ai/",
        "desc": {
          "en": "Real-time AI image creation and enhancement platform.",
          "es": "Plataforma de creación y mejora de imágenes IA en tiempo real.",
          "zh-Hant": "即時 AI 圖像創作與增強平台。",
          "ja": "リアルタイム AI 画像制作・エンハンスメントプラットフォーム。"
        }
      },
      {
        "name": "Hama",
        "region": "intl",
        "url": "https://www.hama.app/zh",
        "desc": {
          "en": "Erase unwanted content from images with one click.",
          "es": "Borra contenido no deseado de las imágenes con un clic.",
          "zh-Hant": "一鍵無痕抹除畫面中的多餘內容。",
          "ja": "ワンクリックで不要な部分を消去。"
        }
      },
      {
        "name": "RestorePhotos",
        "region": "intl",
        "url": "https://www.restorephotos.io/",
        "desc": {
          "en": "Restore blurry or damaged face photos with AI.",
          "es": "Restaura fotos de rostro borrosas o dañadas con IA.",
          "zh-Hant": "修復模糊老照片的人像增強工具。",
          "ja": "AI でぼやけた顔写真を修復。"
        }
      },
      {
        "name": "Palette",
        "region": "intl",
        "url": "https://palette.fm/",
        "desc": {
          "en": "Colorize black and white photos with AI.",
          "es": "Colorea fotos en blanco y negro con IA.",
          "zh-Hant": "用 AI 為黑白照片智慧上色。",
          "ja": "AI で白黒写真を着色。"
        }
      },
      {
        "name": "CG Faces",
        "region": "intl",
        "url": "https://cgfaces.com/en",
        "desc": {
          "en": "Free AI-generated portrait image library.",
          "es": "Biblioteca gratuita de retratos generados con IA.",
          "zh-Hant": "免費 AI 人像素材生成網站。",
          "ja": "無料の AI ポートレート素材サイト。"
        }
      },
      {
        "name": "TinyEraser",
        "region": "intl",
        "url": "https://www.tinyeraser.com/zh",
        "desc": {
          "en": "Fast, unlimited background removal tool.",
          "es": "Eliminación de fondo rápida e ilimitada.",
          "zh-Hant": "極速摳圖工具,可無限量使用。",
          "ja": "高速で無制限の背景除去ツール。"
        }
      },
      {
        "name": "Blend",
        "region": "intl",
        "url": "https://www.blendnow.com/",
        "desc": {
          "en": "Pixel-perfect background removal plus marketing poster templates.",
          "es": "Eliminación de fondo pixel-perfect más plantillas de marketing.",
          "zh-Hant": "像素級去背景,內建海量行銷海報模板。",
          "ja": "ピクセル精度の背景除去と豊富なマーケティングテンプレート。"
        }
      },
      {
        "name": "Inpaint Web",
        "region": "intl",
        "url": "https://inpaintweb.lxfater.com/",
        "desc": {
          "en": "Browser-based smart AI inpainting tool.",
          "es": "Herramienta IA de inpainting inteligente basada en navegador.",
          "zh-Hant": "瀏覽器端智慧 AI 塗抹消除工具。",
          "ja": "ブラウザベースのスマート AI 修復ツール。"
        }
      },
      {
        "name": "Tracejourney",
        "region": "intl",
        "url": "https://www.tracejourney.com/",
        "desc": {
          "en": "Convert images to vector graphics in one click.",
          "es": "Convierte imágenes a gráficos vectoriales con un clic.",
          "zh-Hant": "將圖片一鍵轉換為向量圖。",
          "ja": "ワンクリックで画像をベクターに変換。"
        }
      },
      {
        "name": "Booltool",
        "region": "intl",
        "url": "https://booltool.boolv.tech/home",
        "desc": {
          "en": "All-in-one online AI image processing site.",
          "es": "Sitio web todo-en-uno de procesamiento de imágenes IA.",
          "zh-Hant": "多合一 AI 圖像處理工具站。",
          "ja": "AI 画像処理の統合オンラインサイト。"
        }
      },
      {
        "name": "Toolkit",
        "region": "intl",
        "url": "https://boolpic.fun/background-remover",
        "desc": {
          "en": "Multi-function AI image processing toolkit.",
          "es": "Kit de herramientas IA multifunción para imágenes.",
          "zh-Hant": "多功能 AI 圖片處理工具集合。",
          "ja": "多機能 AI 画像処理ツールキット。"
        }
      },
      {
        "name": "Arc Lab",
        "region": "cn",
        "url": "https://arc.tencent.com/zh/ai-demos/faceRestoration",
        "desc": {
          "en": "Tencent's online image processing and face restoration tool.",
          "es": "Herramienta online de procesamiento de imágenes y restauración facial de Tencent.",
          "zh-Hant": "騰訊出品的線上圖片處理與人像修復工具。",
          "ja": "Tencent のオンライン画像処理・顔修復ツール。"
        }
      },
      {
        "name": "PicWish",
        "region": "cn",
        "url": "https://picwish.com/",
        "desc": {
          "en": "Pro AI cutout and image edit with format conversion.",
          "es": "Recorte IA profesional y edición de imágenes con conversión de formato.",
          "zh-Hant": "專業 AI 摳圖修圖,支援格式轉換。",
          "ja": "プロ仕様の AI 切り抜き・画像編集(形式変換対応)。"
        }
      },
      {
        "name": "美图 AI 开放平台",
        "region": "cn",
        "url": "https://ai.meitu.com/index/",
        "desc": {
          "en": "Meitu's AI face image processing platform.",
          "es": "Plataforma IA de procesamiento de imágenes faciales de Meitu.",
          "zh-Hant": "美圖推出的 AI 人臉圖像處理平台。",
          "ja": "Meitu の AI 顔画像処理プラットフォーム。"
        }
      },
      {
        "name": "美图云修",
        "region": "cn",
        "url": "https://yunxiu.meitu.com/home/",
        "desc": {
          "en": "Commercial-grade AI batch photo enhancement.",
          "es": "Mejora por lotes de fotos con IA de grado comercial.",
          "zh-Hant": "商業級 AI 影像批次處理工具。",
          "ja": "業務レベルの AI 画像一括処理ツール。"
        }
      },
      {
        "name": "BgSub",
        "region": "cn",
        "url": "https://bgsub.cn/webapp/",
        "desc": {
          "en": "Remove or replace image backgrounds with AI.",
          "es": "Elimina o reemplaza fondos de imagen con IA.",
          "zh-Hant": "消除或替換圖像背景的 AI 工具。",
          "ja": "AI で画像の背景を除去・置換。"
        }
      },
      {
        "name": "清图",
        "region": "cn",
        "url": "https://qingtu.cn/",
        "desc": {
          "en": "Chinese-built online AI image repair and enhancement tool.",
          "es": "Herramienta china online de reparación y mejora de imágenes IA.",
          "zh-Hant": "國產線上 AI 圖像修復與增強工具。",
          "ja": "中国製のオンライン AI 画像修復・拡張ツール。"
        }
      },
      {
        "name": "像素蛋糕",
        "region": "cn",
        "url": "https://www.pixcakeai.com/",
        "desc": {
          "en": "Commercial AI photo retouching for photography workflows.",
          "es": "Retoque fotográfico IA comercial para flujos de fotografía.",
          "zh-Hant": "商業級 AI 修圖,提升攝影後製效率。",
          "ja": "業務レベルの AI レタッチ(写真ワークフロー向け)。"
        }
      }
    ]
  },
  {
    "id": "ui",
    "name": {
      "en": "UI Design",
      "es": "Diseño UI",
      "zh-Hant": "UI 設計",
      "ja": "UI デザイン"
    },
    "tools": [
      {
        "name": "Uizard",
        "region": "intl",
        "url": "https://uizard.io/autodesigner/",
        "desc": {
          "en": "Generate multi-screen UI from prompts.",
          "es": "Genera interfaces multi-pantalla a partir de prompts.",
          "zh-Hant": "透過提示詞生成多螢幕 UI 介面。",
          "ja": "プロンプトからマルチ画面 UI を生成。"
        }
      },
      {
        "name": "Visily",
        "region": "intl",
        "url": "https://www.visily.ai/",
        "desc": {
          "en": "Convert hand-drawn wireframes into high-fidelity UI.",
          "es": "Convierte wireframes a mano en UI de alta fidelidad.",
          "zh-Hant": "將手繪線框轉換為高保真介面。",
          "ja": "手描きのワイヤーフレームを高忠実度 UI に変換。"
        }
      },
      {
        "name": "Dora AI",
        "region": "intl",
        "url": "https://www.dora.run/ai",
        "desc": {
          "en": "Generate interactive, editable websites from a sentence.",
          "es": "Genera sitios web interactivos y editables a partir de una frase.",
          "zh-Hant": "一句話生成可互動、可編輯的網站。",
          "ja": "ワンセンテンスで編集可能なインタラクティブサイトを生成。"
        }
      },
      {
        "name": "Stitch",
        "region": "intl",
        "url": "https://www.usegalileo.ai/",
        "desc": {
          "en": "Generate editable UI from a prompt.",
          "es": "Genera UI editable a partir de un prompt.",
          "zh-Hant": "透過提示詞生成可編輯的 UI 介面。",
          "ja": "プロンプトから編集可能な UI を生成。"
        }
      },
      {
        "name": "Make Real (tldraw)",
        "region": "intl",
        "url": "https://github.com/tldraw/make-real",
        "desc": {
          "en": "Turn sketches into interactive UI and code.",
          "es": "Convierte bocetos en UI interactiva y código.",
          "zh-Hant": "透過手繪草圖生成可互動 UI 與程式碼。",
          "ja": "スケッチからインタラクティブな UI とコードを生成。"
        }
      },
      {
        "name": "QoQo",
        "region": "intl",
        "url": "https://qoqo.ai/index.html",
        "desc": {
          "en": "AI helps you build user journey maps quickly.",
          "es": "La IA te ayuda a crear mapas de journey de usuario.",
          "zh-Hant": "AI 快速建立使用者旅程地圖。",
          "ja": "AI でユーザージャーニーマップを素早く作成。"
        }
      },
      {
        "name": "Creatie.ai",
        "region": "intl",
        "url": "https://creatie.ai/",
        "desc": {
          "en": "AI quickly generates UI designs.",
          "es": "La IA genera diseños UI rápidamente.",
          "zh-Hant": "AI 快速生成 UI 設計。",
          "ja": "AI で UI デザインを素早く生成。"
        }
      },
      {
        "name": "Superflow",
        "region": "intl",
        "url": "https://www.usesuperflow.com/",
        "desc": {
          "en": "AI-augmented website collaboration and review.",
          "es": "Colaboración y revisión de sitios web aumentada con IA.",
          "zh-Hant": "AI 輔助的網站協作與評審設計工具。",
          "ja": "AI 支援のウェブサイト协作・レビューツール。"
        }
      },
      {
        "name": "Noya",
        "region": "intl",
        "url": "https://www.noya.io/",
        "desc": {
          "en": "Turn wireframes into high-fidelity designs.",
          "es": "Convierte wireframes en diseños de alta fidelidad.",
          "zh-Hant": "將線框圖快速轉為高保真設計。",
          "ja": "ワイヤーフレームを高忠実度デザインに変換。"
        }
      },
      {
        "name": "Readdy",
        "region": "intl",
        "url": "https://readdy.ai/",
        "desc": {
          "en": "Generate a website from your idea in seconds.",
          "es": "Genera un sitio web a partir de tu idea en segundos.",
          "zh-Hant": "輸入想法即刻生成網站。",
          "ja": "アイデアを即座にウェブサイト化。"
        }
      },
      {
        "name": "Appicons AI",
        "region": "intl",
        "url": "https://appicons.ai/",
        "desc": {
          "en": "Generate polished app icons with AI.",
          "es": "Genera iconos de app pulidos con IA.",
          "zh-Hant": "AI 生成精緻的 App 圖示。",
          "ja": "AI で洗練されたアプリアイコンを生成。"
        }
      },
      {
        "name": "UI Sketcher",
        "region": "intl",
        "url": "https://github.com/pAIrprogio/vscode-ui-sketcher",
        "desc": {
          "en": "VS Code plugin that turns sketches into React Native UI.",
          "es": "Plugin de VS Code que convierte bocetos en UI React Native.",
          "zh-Hant": "VS Code 外掛,將草圖轉為 React Native 介面。",
          "ja": "スケッチを React Native UI に変換する VS Code プラグイン。"
        }
      }
    ]
  },
  {
    "id": "graphic",
    "name": {
      "en": "Graphic Design",
      "es": "Diseño gráfico",
      "zh-Hant": "平面設計",
      "ja": "グラフィックデザイン"
    },
    "tools": [
      {
        "name": "Looka",
        "region": "intl",
        "url": "https://looka.com/",
        "desc": {
          "en": "AI logo and brand design helper.",
          "es": "Asistente IA de diseño de logos y marca.",
          "zh-Hant": "AI 輔助 Logo 與品牌視覺設計。",
          "ja": "AI によるロゴ・ブランドデザイン支援。"
        }
      },
      {
        "name": "Microsoft Designer",
        "region": "intl",
        "url": "https://designer.microsoft.com/",
        "desc": {
          "en": "Microsoft's AI graphic design tool for quick visuals.",
          "es": "Herramienta de diseño gráfico IA de Microsoft para crear visuales rápidos.",
          "zh-Hant": "微軟推出的 AI 平面設計工具。",
          "ja": "Microsoft の AI グラフィックデザインツール。"
        }
      },
      {
        "name": "Canva AI",
        "region": "intl",
        "url": "https://www.canva.cn/",
        "desc": {
          "en": "Free AI art tool inside Canva.",
          "es": "Herramienta gratuita de arte IA dentro de Canva.",
          "zh-Hant": "Canva 內建的免費 AI 設計與繪圖工具。",
          "ja": "Canva 内蔵の無料 AI デザイン・描画ツール。"
        }
      },
      {
        "name": "BrandMark",
        "region": "intl",
        "url": "https://brandmark.io/",
        "desc": {
          "en": "AI-driven logo and brand design tool.",
          "es": "Herramienta IA de diseño de logos y marca.",
          "zh-Hant": "AI 驅動的 Logo 與品牌設計工具。",
          "ja": "AI 駆動のロゴ・ブランドデザインツール。"
        }
      },
      {
        "name": "Huemint",
        "region": "intl",
        "url": "https://huemint.com/brand-intersection/",
        "desc": {
          "en": "Generate harmonious custom color palettes with AI.",
          "es": "Genera paletas de colores armoniosas y personalizadas con IA.",
          "zh-Hant": "用 AI 生成和諧的自訂配色。",
          "ja": "AI で調和のとれたカスタム配色を生成。"
        }
      },
      {
        "name": "AIcolors",
        "region": "intl",
        "url": "https://aicolors.co/",
        "desc": {
          "en": "Generate color palettes from text and see examples.",
          "es": "Genera paletas desde texto y muestra ejemplos.",
          "zh-Hant": "根據文字生成配色並提供案例。",
          "ja": "テキストから配色と事例を生成。"
        }
      },
      {
        "name": "Recraft",
        "region": "intl",
        "url": "https://app.recraft.ai/community",
        "desc": {
          "en": "Easy-to-use AI vector image generator.",
          "es": "Generador IA de imágenes vectoriales fácil de usar.",
          "zh-Hant": "便利好用的 AI 向量圖像產生器。",
          "ja": "使いやすい AI ベクター画像生成ツール。"
        }
      },
      {
        "name": "Flair AI",
        "region": "intl",
        "url": "https://flair.ai/",
        "desc": {
          "en": "Your personal AI designer for product photos.",
          "es": "Tu diseñador IA personal para fotos de producto.",
          "zh-Hant": "你的私人 AI 設計師,一鍵生成精美商品照。",
          "ja": "商品写真のためのパーソナル AI デザイナー。"
        }
      },
      {
        "name": "Getimg",
        "region": "intl",
        "url": "https://getimg.ai/",
        "desc": {
          "en": "Multi-function AI image edit and generation tool.",
          "es": "Herramienta IA multifunción de edición y generación de imágenes.",
          "zh-Hant": "多功能 AI 圖片編輯與生成工具。",
          "ja": "多機能 AI 画像編集・生成ツール。"
        }
      },
      {
        "name": "ImgCreator",
        "region": "intl",
        "url": "https://imgcreator.ai/",
        "desc": {
          "en": "All-in-one AI design tool, strong at backgrounds and posters.",
          "es": "Herramienta IA todo-en-uno, fuerte en fondos y carteles.",
          "zh-Hant": "多合一 AI 設計工具,背景與海報能力強。",
          "ja": "背景・ポスター生成に優れた統合 AI デザインツール。"
        }
      },
      {
        "name": "Palette",
        "region": "intl",
        "url": "https://palette.tone-row.com/",
        "desc": {
          "en": "Generate a complete UI color palette.",
          "es": "Genera una paleta de colores UI completa.",
          "zh-Hant": "生成整套 UI 配色。",
          "ja": "UI 配色一式を生成。"
        }
      },
      {
        "name": "Vectorize",
        "region": "intl",
        "url": "https://vectorizer.ai/",
        "desc": {
          "en": "Quickly convert bitmaps to vector format.",
          "es": "Convierte rápidamente mapas de bits a vector.",
          "zh-Hant": "快速將點陣圖轉為向量圖。",
          "ja": "ビットマップを素早くベクター化。"
        }
      },
      {
        "name": "Daft Art",
        "region": "intl",
        "url": "https://www.daftart.ai/",
        "desc": {
          "en": "AI album cover image generator.",
          "es": "Generador de portadas de álbum con IA.",
          "zh-Hant": "AI 專輯封面圖片產生器。",
          "ja": "AI アルバムカバー生成ツール。"
        }
      },
      {
        "name": "PLUG AI",
        "region": "intl",
        "url": "https://hp.package-ai.jp/",
        "desc": {
          "en": "AI-assisted packaging design with analysis of options.",
          "es": "Diseño de packaging asistido por IA con análisis de opciones.",
          "zh-Hant": "AI 輔助包裝設計並對方案生成評估。",
          "ja": "AI 支援のパッケージデザイン(方案分析付き)。"
        }
      },
      {
        "name": "Alpaca",
        "region": "intl",
        "url": "https://www.alpacaml.com/",
        "desc": {
          "en": "Personalized AI toolkit; Photoshop plugin for SD painting.",
          "es": "Kit IA personalizado; plugin de Photoshop para pintura SD.",
          "zh-Hant": "個性化 AI 工具包,可接入 PS 的 SD 繪圖外掛。",
          "ja": "Photoshop 対応の SD 描画プラグイン付き AI ツールキット。"
        }
      },
      {
        "name": "字体家 AI 神笔",
        "region": "cn",
        "url": "https://ai.zitijia.com/",
        "desc": {
          "en": "Generate a full Chinese font from just 8 sample characters.",
          "es": "Genera una fuente china completa a partir de 8 caracteres.",
          "zh-Hant": "少量字樣即可生成整套中文字庫。",
          "ja": "8 文字のサンプルから中国語フォント一式を生成。"
        }
      },
      {
        "name": "标小智",
        "region": "cn",
        "url": "https://www.logosc.cn/",
        "desc": {
          "en": "AI-powered logo design tool for SMBs.",
          "es": "Herramienta de diseño de logos con IA para PYMEs.",
          "zh-Hant": "AI 智慧 Logo 設計工具。",
          "ja": "AI 搭載のロゴデザインツール。"
        }
      },
      {
        "name": "AIDesign",
        "region": "cn",
        "url": "https://ailogo.qq.com/guide/brandname",
        "desc": {
          "en": "Tencent's AI logo design tool.",
          "es": "Herramienta de diseño de logos IA de Tencent.",
          "zh-Hant": "騰訊出品的 AI Logo 設計工具。",
          "ja": "Tencent の AI ロゴデザインツール。"
        }
      },
      {
        "name": "ImageCreator",
        "region": "cn",
        "url": "https://imagecreator.alkaidvision.com/",
        "desc": {
          "en": "AI painting plugin usable inside Photoshop.",
          "es": "Plugin de pintura IA utilizable dentro de Photoshop.",
          "zh-Hant": "可在 Photoshop 中使用的 AI 繪圖外掛。",
          "ja": "Photoshop 内で使える AI 描画プラグイン。"
        }
      }
    ]
  },
  {
    "id": "writing",
    "name": {
      "en": "AI Writing",
      "es": "Escritura IA",
      "zh-Hant": "AI 智慧寫作",
      "ja": "AI ライティング"
    },
    "tools": [
      {
        "name": "Notion AI",
        "region": "intl",
        "url": "https://www.notion.so/product/ai",
        "desc": {
          "en": "AI writing and organization assistant inside Notion.",
          "es": "Asistente IA de escritura y organización dentro de Notion.",
          "zh-Hant": "Notion 內建的 AI 寫作與整理助手。",
          "ja": "Notion 内蔵の AI ライティング・整理アシスタント。"
        }
      },
      {
        "name": "Jasper AI",
        "region": "intl",
        "url": "https://www.jasper.ai/",
        "desc": {
          "en": "AI marketing copywriter aimed at enterprise teams.",
          "es": "Redactor IA de marketing orientado a equipos empresariales.",
          "zh-Hant": "面向企業的 AI 行銷文案寫作工具。",
          "ja": "企業向け AI マーケティングコピーライタ。"
        }
      },
      {
        "name": "Writesonic",
        "region": "intl",
        "url": "https://writesonic.com/",
        "desc": {
          "en": "All-in-one platform combining writing, search, and art.",
          "es": "Plataforma todo-en-uno que combina escritura, búsqueda y arte.",
          "zh-Hant": "集寫作、搜尋與繪畫於一體的內容平台。",
          "ja": "ライティング・検索・アートを統合したプラットフォーム。"
        }
      },
      {
        "name": "Copy.ai",
        "region": "intl",
        "url": "https://www.copy.ai/",
        "desc": {
          "en": "AI social media and marketing copy assistant.",
          "es": "Asistente IA de copies para redes sociales y marketing.",
          "zh-Hant": "AI 社群與行銷文案寫作助手。",
          "ja": "AI ソーシャル・マーケティングコピーアシスタント。"
        }
      },
      {
        "name": "editGPT",
        "region": "intl",
        "url": "https://www.editgpt.app/",
        "desc": {
          "en": "Use ChatGPT to edit and polish English articles.",
          "es": "Usa ChatGPT para editar y pulir artículos en inglés.",
          "zh-Hant": "借助 ChatGPT 修改與潤飾英文文章。",
          "ja": "ChatGPT で英文記事を加筆・推敲。"
        }
      },
      {
        "name": "Grammarly",
        "region": "intl",
        "url": "https://www.grammarly.com",
        "desc": {
          "en": "Personalized AI writing assistance and suggestions.",
          "es": "Asistencia y sugerencias personalizadas de escritura IA.",
          "zh-Hant": "提供個人化建議的 AI 寫作輔助工具。",
          "ja": "パーソナライズされた AI ライティング補助。"
        }
      },
      {
        "name": "QuillBot",
        "region": "intl",
        "url": "https://quillbot.com/",
        "desc": {
          "en": "English paraphrasing and polishing tool.",
          "es": "Herramienta de paráfrasis y pulido en inglés.",
          "zh-Hant": "英文改寫、潤飾與釋義優化工具。",
          "ja": "英文のパラフレーズ・推敲ツール。"
        }
      },
      {
        "name": "WordAi",
        "region": "intl",
        "url": "https://wordai.com/",
        "desc": {
          "en": "AI content rewriting and batch production.",
          "es": "Reescritura de contenido IA y producción por lotes.",
          "zh-Hant": "AI 內容重寫與批次產出工具。",
          "ja": "AI コンテンツ書き換え・一括生成ツール。"
        }
      },
      {
        "name": "Paperpal",
        "region": "intl",
        "url": "https://www.editage.cn/paperpal",
        "desc": {
          "en": "AI academic writing assistant for researchers.",
          "es": "Asistente de escritura académica IA para investigadores.",
          "zh-Hant": "面向研究人員的學術寫作助手。",
          "ja": "研究者向け学術ライティングアシスタント。"
        }
      },
      {
        "name": "Bearly",
        "region": "intl",
        "url": "https://bearly.ai/",
        "desc": {
          "en": "Boost English reading and writing efficiency.",
          "es": "Aumenta la eficiencia de lectura y escritura en inglés.",
          "zh-Hant": "提升英文閱讀與寫作效率的工具。",
          "ja": "英文の読解・執筆効率を向上。"
        }
      },
      {
        "name": "MagicPen",
        "region": "intl",
        "url": "https://magickpen.com/",
        "desc": {
          "en": "Online AI English writing assistant.",
          "es": "Asistente online de escritura en inglés con IA.",
          "zh-Hant": "線上 AI 英文寫作助手。",
          "ja": "オンライン AI 英文ライティングアシスタント。"
        }
      },
      {
        "name": "Jenni",
        "region": "intl",
        "url": "https://jenni.ai/",
        "desc": {
          "en": "AI collaboration assistant for writers.",
          "es": "Asistente IA de colaboración para escritores.",
          "zh-Hant": "面向作家的 AI 協作寫作助手。",
          "ja": "ライター向け AI 协作アシスタント。"
        }
      },
      {
        "name": "Novelist AI",
        "region": "intl",
        "url": "https://novelistai.com/",
        "desc": {
          "en": "AI-assisted novel creation tool.",
          "es": "Herramienta IA para crear novelas.",
          "zh-Hant": "AI 輔助小說創作工具。",
          "ja": "AI 支援の小説制作ツール。"
        }
      },
      {
        "name": "NovelAI",
        "region": "intl",
        "url": "https://novelai.net/",
        "desc": {
          "en": "AI story generation tool for literary creation.",
          "es": "Herramienta IA para generación de historias literarias.",
          "zh-Hant": "面向文學創作的 AI 故事生成工具。",
          "ja": "文学創作向け AI ストーリー生成ツール。"
        }
      },
      {
        "name": "秘塔 AI 搜索",
        "region": "cn",
        "url": "https://metaso.cn/",
        "desc": {
          "en": "Ad-free AI search engine that goes straight to results.",
          "es": "Motor de búsqueda IA sin anuncios, directo al resultado.",
          "zh-Hant": "無廣告直達結果的 AI 搜尋引擎。",
          "ja": "広告なしで結果に直結する AI 検索エンジン。"
        }
      },
      {
        "name": "秘塔写作猫",
        "region": "cn",
        "url": "https://www.xiezuocat.com/",
        "desc": {
          "en": "Chinese-focused AI writing assistant.",
          "es": "Asistente de escritura IA enfocado en chino.",
          "zh-Hant": "面向中文場景的 AI 寫作輔助工具。",
          "ja": "中国語向けの AI ライティングアシスタント。"
        }
      },
      {
        "name": "火山写作",
        "region": "cn",
        "url": "https://www.writingo.net/home",
        "desc": {
          "en": "ByteDance's AI writing tool focused on English expression.",
          "es": "Herramienta de escritura IA de ByteDance centrada en inglés.",
          "zh-Hant": "字節跳動推出的 AI 英文寫作工具。",
          "ja": "ByteDance の英語ライティング向け AI ツール。"
        }
      },
      {
        "name": "据意查句",
        "region": "cn",
        "url": "https://wantquotes.net/",
        "desc": {
          "en": "Tsinghua-built AI tool to find quotes by meaning.",
          "es": "Herramienta IA de Tsinghua para encontrar citas por significado.",
          "zh-Hant": "清華大學出品,根據語意查找名言警句。",
          "ja": "清華大学が開発した意味に基づく引用検索ツール。"
        }
      },
      {
        "name": "Effidit",
        "region": "cn",
        "url": "https://effidit.qq.com/",
        "desc": {
          "en": "Tencent AI Lab's smart writing assistant.",
          "es": "Asistente de escritura inteligente de Tencent AI Lab.",
          "zh-Hant": "騰訊 AI Lab 開發的智慧寫作助手。",
          "ja": "Tencent AI Lab 開発のスマートライティングアシスタント。"
        }
      },
      {
        "name": "爱改写",
        "region": "cn",
        "url": "https://www.aigaixie.com/",
        "desc": {
          "en": "AI text productivity tool for research writers.",
          "es": "Herramienta IA de productividad textual para investigadores.",
          "zh-Hant": "科研工作者的 AI 文字生產力工具。",
          "ja": "研究者向け AI テキスト生産性ツール。"
        }
      },
      {
        "name": "新华妙笔",
        "region": "cn",
        "url": "https://miaobi.xinhuaskl.com/",
        "desc": {
          "en": "Xinhua's AI learning platform for official-document writing.",
          "es": "Plataforma IA de Xinhua para aprender redacción oficial.",
          "zh-Hant": "新華社出品的 AI 公文寫作學習平台。",
          "ja": "新華社提供の AI 公文書写作学習プラットフォーム。"
        }
      },
      {
        "name": "悉语",
        "region": "cn",
        "url": "https://chuangyi.taobao.com/pages/aiCopy",
        "desc": {
          "en": "One-click e-commerce marketing copy generator.",
          "es": "Generador de copies de marketing e-commerce con un clic.",
          "zh-Hant": "一鍵生成電商行銷文案。",
          "ja": "EC マーケティングコピーを一键生成。"
        }
      },
      {
        "name": "爱创作",
        "region": "cn",
        "url": "https://ai.zaker.cn/",
        "desc": {
          "en": "Generate articles, marketing text, images and short videos in one go.",
          "es": "Genera artículos, textos de marketing, imágenes y videos cortos en un solo paso.",
          "zh-Hant": "一鍵生成文章、行銷文案、配圖與短影片。",
          "ja": "記事・マーケティング文・画像・ショート動画を一键生成。"
        }
      },
      {
        "name": "字语未来",
        "region": "cn",
        "url": "https://getgetai.com/workstation",
        "desc": {
          "en": "Smart-office content creation platform.",
          "es": "Plataforma de creación de contenido para oficina inteligente.",
          "zh-Hant": "面向智慧辦公場景的 AI 內容創作平台。",
          "ja": "スマートオフィス向け AI コンテンツ制作プラットフォーム。"
        }
      }
    ]
  },
  {
    "id": "video",
    "name": {
      "en": "AI Audio & Video",
      "es": "Audio y video IA",
      "zh-Hant": "AI 音視訊",
      "ja": "AI オーディオ・ビデオ"
    },
    "tools": [
      {
        "name": "Stable Audio",
        "region": "intl",
        "url": "https://www.stableaudio.com/",
        "desc": {
          "en": "Stability AI's AI music generation tool.",
          "es": "Herramienta IA de generación de música de Stability AI.",
          "zh-Hant": "Stability AI 推出的 AI 音樂生成工具。",
          "ja": "Stability AI の AI 音楽生成ツール。"
        }
      },
      {
        "name": "Runway",
        "region": "intl",
        "url": "https://runwayml.com/",
        "desc": {
          "en": "Powerful AI video generation and editing tool.",
          "es": "Potente herramienta de generación y edición de video IA.",
          "zh-Hant": "功能強大的 AI 影片生成與編輯工具。",
          "ja": "高機能な AI 動画生成・編集ツール。"
        }
      },
      {
        "name": "HeyGen",
        "region": "intl",
        "url": "https://www.heygen.com",
        "desc": {
          "en": "Quickly produce digital-human product videos.",
          "es": "Produce rápidamente videos de productos con humanos digitales.",
          "zh-Hant": "快速製作數字人產品宣傳影片。",
          "ja": "デジタルヒューマン商品紹介動画を素早く制作。"
        }
      },
      {
        "name": "Wonder Studio",
        "region": "intl",
        "url": "https://wonderdynamics.com/",
        "desc": {
          "en": "Auto-convert live-action performances into CG characters.",
          "es": "Convierte automáticamente actuaciones reales en personajes CG.",
          "zh-Hant": "將真人表演自動轉換為 CG 角色。",
          "ja": "実演演技を自動的に CG キャラクターへ変換。"
        }
      },
      {
        "name": "Play.ht",
        "region": "intl",
        "url": "https://play.ht/",
        "desc": {
          "en": "Generate many lifelike voices from text.",
          "es": "Genera muchas voces realistas a partir de texto.",
          "zh-Hant": "根據文字生成多種逼真語音。",
          "ja": "テキストから多種多様な自然な音声を生成。"
        }
      },
      {
        "name": "Soundraw",
        "region": "intl",
        "url": "https://soundraw.io/",
        "desc": {
          "en": "Make royalty-free music with AI.",
          "es": "Crea música libre de derechos con IA.",
          "zh-Hant": "用 AI 製作免版稅音樂。",
          "ja": "AI でロイヤリティフリー音楽を制作。"
        }
      },
      {
        "name": "Fliki",
        "region": "intl",
        "url": "https://fliki.ai/",
        "desc": {
          "en": "Text-to-video creation tool with text-to-speech.",
          "es": "Herramienta de creación de video a partir de texto con TTS.",
          "zh-Hant": "文字轉影片與配音創作工具。",
          "ja": "テキストから動画・ナレーションを生成。"
        }
      },
      {
        "name": "Mubert",
        "region": "intl",
        "url": "https://mubert.com/",
        "desc": {
          "en": "Generate AI background music in under a minute.",
          "es": "Genera música de fondo IA en menos de un minuto.",
          "zh-Hant": "一分鐘內生成 AI 背景音樂。",
          "ja": "1 分以内に AI BGM を生成。"
        }
      },
      {
        "name": "Genmo",
        "region": "intl",
        "url": "https://www.genmo.ai/",
        "desc": {
          "en": "Edit images and video using text instructions.",
          "es": "Edita imágenes y video con instrucciones de texto.",
          "zh-Hant": "透過文字指令編輯圖像與影片。",
          "ja": "テキスト指示で画像・動画を編集。"
        }
      },
      {
        "name": "BeatBot",
        "region": "intl",
        "url": "https://beatbot.fm/",
        "desc": {
          "en": "Splash's AI music generator.",
          "es": "Generador de música IA de Splash.",
          "zh-Hant": "Splash 推出的 AI 音樂產生器。",
          "ja": "Splash の AI 音楽生成ツール。"
        }
      },
      {
        "name": "Uberduck",
        "region": "intl",
        "url": "https://uberduck.ai/",
        "desc": {
          "en": "Open-source AI voice generation platform.",
          "es": "Plataforma open-source de generación de voz IA.",
          "zh-Hant": "開源 AI 語音生成平台。",
          "ja": "オープンソースの AI 音声生成プラットフォーム。"
        }
      },
      {
        "name": "Audo Studio",
        "region": "intl",
        "url": "https://audo.ai/",
        "desc": {
          "en": "One-click AI background noise removal for audio.",
          "es": "Eliminación de ruido de fondo de audio con IA en un clic.",
          "zh-Hant": "一鍵清除音訊背景雜訊。",
          "ja": "ワンクリックで音声背景ノイズを除去。"
        }
      },
      {
        "name": "Unscreen",
        "region": "intl",
        "url": "https://www.unscreen.com/",
        "desc": {
          "en": "AI-powered automatic video background removal.",
          "es": "Eliminación automática de fondo de video con IA.",
          "zh-Hant": "線上智慧去除影片背景。",
          "ja": "AI で動画背景を自動除去。"
        }
      },
      {
        "name": "Clipchamp",
        "region": "intl",
        "url": "https://clipchamp.com/zh-hans/",
        "desc": {
          "en": "Turn text into video narration; create and export quickly.",
          "es": "Convierte texto en narración de video; crea y exporta rápido.",
          "zh-Hant": "文字轉影片旁白,快速建立並匯出影片。",
          "ja": "テキストを動画ナレーションに変換、迅速に作成・書き出し。"
        }
      },
      {
        "name": "Rask",
        "region": "intl",
        "url": "https://zh.rask.ai/",
        "desc": {
          "en": "Leading AI video localization and dubbing tool.",
          "es": "Herramienta líder de localización y doblaje de video IA.",
          "zh-Hant": "領先的 AI 影片本地化與配音工具。",
          "ja": "最先端の AI 動画ローカライズ・吹き替えツール。"
        }
      },
      {
        "name": "Akool",
        "region": "intl",
        "url": "https://akool.com/zh-cn",
        "desc": {
          "en": "AI video generation and personalized content platform.",
          "es": "Plataforma de generación de video IA y contenido personalizado.",
          "zh-Hant": "AI 影片生成與個人化內容創作平台。",
          "ja": "AI 動画生成とパーソナライズコンテンツプラットフォーム。"
        }
      },
      {
        "name": "SAM Audio",
        "region": "intl",
        "url": "https://ai.meta.com/research/samaudio/",
        "desc": {
          "en": "Meta's audio separation research project.",
          "es": "Proyecto de investigación de separación de audio de Meta.",
          "zh-Hant": "Meta 推出的音訊分離研究專案。",
          "ja": "Meta の音声分離研究プロジェクト。"
        }
      },
      {
        "name": "BibiGPT",
        "region": "intl",
        "url": "https://b.jimmylv.cn/",
        "desc": {
          "en": "One-click summary of Bilibili video content.",
          "es": "Resumen de un clic para contenido de video de Bilibili.",
          "zh-Hant": "一鍵總結 B 站音視訊內容。",
          "ja": "Bilibili 動画内容を一键で要約。"
        }
      },
      {
        "name": "TTSMaker",
        "region": "cn",
        "url": "https://ttsmaker.cn/",
        "desc": {
          "en": "Free online text-to-speech tool.",
          "es": "Herramienta gratuita online de texto a voz.",
          "zh-Hant": "免費線上文字轉語音工具。",
          "ja": "無料のオンライン TTS ツール。"
        }
      },
      {
        "name": "Spotiguess",
        "region": "intl",
        "url": "https://spotiguess.com/",
        "desc": {
          "en": "Fun music guessing mini-game.",
          "es": "Mini-juego de adivinar música.",
          "zh-Hant": "音樂趣味猜謎小遊戲。",
          "ja": "音楽当てクイズのミニゲーム。"
        }
      },
      {
        "name": "蝉妈妈",
        "region": "cn",
        "url": "https://www.chanmama.com/",
        "desc": {
          "en": "Short-video and live-commerce analytics platform.",
          "es": "Plataforma de análisis de live-commerce y video corto.",
          "zh-Hant": "短視訊內容運營與直播電商數據分析平台。",
          "ja": "ショート動画・ライブコマース分析プラットフォーム。"
        }
      },
      {
        "name": "网易天音",
        "region": "cn",
        "url": "https://tianyin.163.com/",
        "desc": {
          "en": "NetEase's one-stop AI music composition, rendering, and export tool.",
          "es": "Herramienta integral de NetEase para composición, renderizado y exportación con IA.",
          "zh-Hant": "網易出品的一站式 AI 編曲、渲染與匯出工具。",
          "ja": "NetEase 製の AI 作曲・レンダリング・書き出し統合ツール。"
        }
      },
      {
        "name": "剪映专业版",
        "region": "cn",
        "url": "https://www.capcut.cn/",
        "desc": {
          "en": "Chinese editing tool with AI subtitles and dubbing.",
          "es": "Editor chino con subtítulos y doblaje IA.",
          "zh-Hant": "國產剪輯工具,支援 AI 字幕與配音。",
          "ja": "中国製の編集ツール(AI 字幕・吹き替え対応)。"
        }
      },
      {
        "name": "腾讯智影",
        "region": "cn",
        "url": "https://zenvideo.qq.com/",
        "desc": {
          "en": "Tencent's cloud-based one-stop smart video creation tool.",
          "es": "Herramienta integral en la nube de Tencent para crear video con IA.",
          "zh-Hant": "騰訊出品的一站式雲端智慧影片創作工具。",
          "ja": "Tencent のクラウド型スマート動画制作ツール。"
        }
      }
    ]
  },
  {
    "id": "three-d",
    "name": {
      "en": "3D Design",
      "es": "Diseño 3D",
      "zh-Hant": "3D 設計",
      "ja": "3D デザイン"
    },
    "tools": [
      {
        "name": "Luma Labs",
        "region": "intl",
        "url": "https://lumalabs.ai/",
        "desc": {
          "en": "Convert video into 3D game assets.",
          "es": "Convierte video en assets 3D para juegos.",
          "zh-Hant": "將影片轉換為 3D 遊戲資產。",
          "ja": "動画を 3D ゲームアセットに変換。"
        }
      },
      {
        "name": "Sloyd",
        "region": "intl",
        "url": "https://www.sloyd.ai/",
        "desc": {
          "en": "Quickly generate 3D game asset models.",
          "es": "Genera rápidamente modelos 3D para juegos.",
          "zh-Hant": "快速生成 3D 遊戲資產模型。",
          "ja": "3D ゲームアセットを素早く生成。"
        }
      },
      {
        "name": "Cascadeur",
        "region": "intl",
        "url": "https://cascadeur.com/",
        "desc": {
          "en": "AI-assisted 3D keyframe animation.",
          "es": "Animación de keyframes 3D asistida por IA.",
          "zh-Hant": "AI 輔助製作 3D 關鍵影格動畫。",
          "ja": "AI 支援の 3D キーフレームアニメーション。"
        }
      },
      {
        "name": "Poly",
        "region": "intl",
        "url": "https://withpoly.com/browse/textures",
        "desc": {
          "en": "Generate 3D textures from text.",
          "es": "Genera texturas 3D a partir de texto.",
          "zh-Hant": "根據文字生成 3D 材質貼圖。",
          "ja": "テキストから 3D マテリアルを生成。"
        }
      },
      {
        "name": "Kaedim",
        "region": "intl",
        "url": "https://www.kaedim3d.com/",
        "desc": {
          "en": "Quickly generate 3D models and textures.",
          "es": "Genera rápidamente modelos 3D y texturas.",
          "zh-Hant": "快速生成 3D 模型與材質。",
          "ja": "3D モデルとテクスチャを素早く生成。"
        }
      },
      {
        "name": "Plask",
        "region": "intl",
        "url": "https://plask.ai/",
        "desc": {
          "en": "AI motion capture for smooth 3D animation.",
          "es": "Captura de movimiento IA para animación 3D fluida.",
          "zh-Hant": "AI 動作捕捉,製作流暢 3D 動畫。",
          "ja": "AI モーキャプで滑らかな 3D アニメーション。"
        }
      },
      {
        "name": "Ponzu",
        "region": "intl",
        "url": "https://www.ponzu.gg/",
        "desc": {
          "en": "AI-generated seamless 3D textures.",
          "es": "Texturas 3D sin costuras generadas con IA.",
          "zh-Hant": "AI 生成 3D 無縫貼圖材質。",
          "ja": "AI でシームレスな 3D テクスチャを生成。"
        }
      },
      {
        "name": "Plasmo",
        "region": "intl",
        "url": "https://www.plasmo.ai/",
        "desc": {
          "en": "Convert sketches into 3D models.",
          "es": "Convierte bocetos en modelos 3D.",
          "zh-Hant": "將草圖轉換為 3D 模型。",
          "ja": "スケッチを 3D モデルに変換。"
        }
      },
      {
        "name": "3DFY AI",
        "region": "intl",
        "url": "https://3dfy.ai/",
        "desc": {
          "en": "Generate large quantities of high-quality 3D assets with AI.",
          "es": "Genera grandes cantidades de assets 3D de alta calidad con IA.",
          "zh-Hant": "大規模生成高品質 3D 資產。",
          "ja": "AI で大量の高品質 3D アセットを生成。"
        }
      },
      {
        "name": "Text to Skybox",
        "region": "intl",
        "url": "https://skybox.blockadelabs.com/",
        "desc": {
          "en": "Generate seamless 360° environment maps with AI.",
          "es": "Genera mapas de entorno 360° sin costuras con IA.",
          "zh-Hant": "AI 生成 360° 無縫環境貼圖。",
          "ja": "AI で 360° シームレス環境マップを生成。"
        }
      },
      {
        "name": "DreamFusion",
        "region": "intl",
        "url": "https://dreamfusion3d.github.io/",
        "desc": {
          "en": "Google's text-to-3D research project.",
          "es": "Proyecto de investigación de texto a 3D de Google.",
          "zh-Hant": "Google 推出的文字轉 3D 模型研究專案。",
          "ja": "Google のテキストto 3D 研究プロジェクト。"
        }
      },
      {
        "name": "GET3D",
        "region": "intl",
        "url": "https://nv-tlabs.github.io/GET3D/",
        "desc": {
          "en": "NVIDIA's 2D-to-3D research model.",
          "es": "Modelo de investigación 2D a 3D de NVIDIA.",
          "zh-Hant": "NVIDIA 的 2D 轉 3D 模型研究專案。",
          "ja": "NVIDIA の 2D to 3D 研究モデル。"
        }
      }
    ]
  },
  {
    "id": "study",
    "name": {
      "en": "AI Learning",
      "es": "Aprendizaje IA",
      "zh-Hant": "AI 學習",
      "ja": "AI 学習"
    },
    "tools": [
      {
        "name": "DeepLearning.AI",
        "region": "intl",
        "url": "https://www.deeplearning.ai/",
        "desc": {
          "en": "Deep learning and AI online learning platform.",
          "es": "Plataforma de aprendizaje online de deep learning e IA.",
          "zh-Hant": "深度學習與 AI 線上學習平台。",
          "ja": "ディープラーニングと AI のオンライン学習プラットフォーム。"
        }
      },
      {
        "name": "Coursera",
        "region": "intl",
        "url": "https://www.coursera.org/collections/best-machine-learning-ai",
        "desc": {
          "en": "Well-known MOOC platform with many AI courses.",
          "es": "Plataforma MOOC conocida con muchos cursos de IA.",
          "zh-Hant": "知名 MOOC 平台,匯聚大量 AI 課程。",
          "ja": "有名な MOOC プラットフォーム(豊富な AI 講座)。"
        }
      },
      {
        "name": "fast.ai",
        "region": "intl",
        "url": "https://www.fast.ai/",
        "desc": {
          "en": "Free open-source deep learning resources.",
          "es": "Recursos open-source gratuitos de deep learning.",
          "zh-Hant": "免費開源的深度學習資源。",
          "ja": "無料のオープンソース深層学習リソース。"
        }
      },
      {
        "name": "Kaggle",
        "region": "intl",
        "url": "https://www.kaggle.com/",
        "desc": {
          "en": "Machine learning and data science community.",
          "es": "Comunidad de machine learning y ciencia de datos.",
          "zh-Hant": "機器學習與資料科學社群平台。",
          "ja": "機械学習・データサイエンスのコミュニティ。"
        }
      },
      {
        "name": "Udacity",
        "region": "intl",
        "url": "https://www.udacity.com",
        "desc": {
          "en": "AI and machine learning courses from intro to advanced.",
          "es": "Cursos de IA y machine learning de básico a avanzado.",
          "zh-Hant": "提供從入門到進階的 AI 與機器學習課程。",
          "ja": "入門から上級までの AI・機械学習コース。"
        }
      },
      {
        "name": "Google AI",
        "region": "intl",
        "url": "https://ai.google/",
        "desc": {
          "en": "Google's official AI learning and developer platform.",
          "es": "Plataforma oficial de aprendizaje y desarrollo de IA de Google.",
          "zh-Hant": "Google 官方 AI 學習與開發者平台。",
          "ja": "Google 公式の AI 学習・开发者プラットフォーム。"
        }
      },
      {
        "name": "Elements of AI",
        "region": "intl",
        "url": "https://www.elementsofai.com/",
        "desc": {
          "en": "Free large-scale open online AI course.",
          "es": "Curso online masivo y gratuito de IA.",
          "zh-Hant": "免費的大規模 AI 線上開放課程。",
          "ja": "無料の大規模オープン AI オンラインコース。"
        }
      },
      {
        "name": "Brilliant Neural Networks",
        "region": "intl",
        "url": "https://brilliant.org/courses/intro-neural-networks/",
        "desc": {
          "en": "Interactive deep-dive into neural networks.",
          "es": "Inmersión interactiva en redes neuronales.",
          "zh-Hant": "深入研究神經網路的互動課程。",
          "ja": "ニューラルネットワークを対話的に深く学ぶ。"
        }
      },
      {
        "name": "ML for Beginners",
        "region": "intl",
        "url": "https://microsoft.github.io/ML-For-Beginners/",
        "desc": {
          "en": "Microsoft's introductory machine learning curriculum.",
          "es": "Currículo introductorio de machine learning de Microsoft.",
          "zh-Hant": "微軟提供的機器學習入門課程。",
          "ja": "Microsoft 提供の機械学習入門カリキュラム。"
        }
      },
      {
        "name": "阿里云 AI 学习路线",
        "region": "cn",
        "url": "https://developer.aliyun.com/learning/roadmap/ai",
        "desc": {
          "en": "Alibaba Cloud's AI learning roadmap.",
          "es": "Hoja de ruta de aprendizaje de IA de Alibaba Cloud.",
          "zh-Hant": "阿里雲推出的人工智慧學習路線。",
          "ja": "Alibaba Cloud の AI 学習ロードマップ。"
        }
      },
      {
        "name": "AI 大课堂",
        "region": "cn",
        "url": "https://www.aidaxue.com/",
        "desc": {
          "en": "iFlytek's AI learning platform.",
          "es": "Plataforma de aprendizaje IA de iFlytek.",
          "zh-Hant": "科大訊飛推出的 AI 學習平台。",
          "ja": "iFlytek の AI 学習プラットフォーム。"
        }
      }
    ]
  },
  {
    "id": "office",
    "name": {
      "en": "AI Office",
      "es": "Oficina con IA",
      "zh-Hant": "AI 辦公",
      "ja": "AI オフィス"
    },
    "tools": [
      {
        "name": "Microsoft 365 Copilot",
        "region": "intl",
        "url": "https://www.microsoft.com/microsoft-365/copilot",
        "desc": {
          "en": "AI assistant built into the Microsoft 365 suite.",
          "es": "Asistente IA integrado en la suite Microsoft 365.",
          "zh-Hant": "內建於 Office 全家桶的 AI 辦公助手。",
          "ja": "Microsoft 365 に内蔵された AI オフィスアシスタント。"
        }
      },
      {
        "name": "Tome",
        "region": "intl",
        "url": "https://tome.app/",
        "desc": {
          "en": "AI-driven presentation and storytelling tool.",
          "es": "Herramienta de presentaciones y storytelling con IA.",
          "zh-Hant": "AI 驅動的演示文稿與敘事工具。",
          "ja": "AI 駆動のプレゼンテーション・ナラティブツール。"
        }
      },
      {
        "name": "Glimmer AI",
        "region": "intl",
        "url": "https://glimmerai.tech/",
        "desc": {
          "en": "Quickly generate AI presentation slides.",
          "es": "Genera diapositivas de presentación con IA rápidamente.",
          "zh-Hant": "快速生成 AI PPT 簡報。",
          "ja": "AI で PPT スライドを素早く生成。"
        }
      },
      {
        "name": "PandaGPT",
        "region": "intl",
        "url": "https://www.pandagpt.io/",
        "desc": {
          "en": "Upload a document and chat with it to extract key points.",
          "es": "Sube un documento y chatea con él para extraer puntos clave.",
          "zh-Hant": "上傳文件後透過對話總結重點。",
          "ja": "ドキュメントをアップロードして対話形式で要点を抽出。"
        }
      },
      {
        "name": "WordAi",
        "region": "intl",
        "url": "https://wordai.com/",
        "desc": {
          "en": "AI content rewriting and batch production.",
          "es": "Reescritura de contenido IA y producción por lotes.",
          "zh-Hant": "AI 內容重寫與批次產出工具。",
          "ja": "AI コンテンツ書き換え・一括生成ツール。"
        }
      },
      {
        "name": "Timely",
        "region": "intl",
        "url": "https://timelyapp.com/",
        "desc": {
          "en": "AI time management and time-tracking app.",
          "es": "App de gestión del tiempo y seguimiento con IA.",
          "zh-Hant": "AI 時間管理與工時追蹤工具。",
          "ja": "AI による時間管理・トラッキングアプリ。"
        }
      },
      {
        "name": "Taskade",
        "region": "intl",
        "url": "https://www.taskade.com/",
        "desc": {
          "en": "AI-generated outlines and mind maps, unified workflow.",
          "es": "Esquemas y mapas mentales con IA, workflow unificado.",
          "zh-Hant": "AI 大綱與心智圖,統一工作流程。",
          "ja": "AI によるアウトライン・マインドマップと統合ワークフロー。"
        }
      },
      {
        "name": "Rossum",
        "region": "intl",
        "url": "https://rossum.ai/",
        "desc": {
          "en": "Enterprise-grade intelligent document processing platform.",
          "es": "Plataforma empresarial de procesamiento inteligente de documentos.",
          "zh-Hant": "企業級智慧文件處理平台。",
          "ja": "エンタープライズ向けスマート文書処理プラットフォーム。"
        }
      },
      {
        "name": "Otter AI",
        "region": "intl",
        "url": "https://otter.ai/",
        "desc": {
          "en": "Meeting notes and real-time transcription summarization.",
          "es": "Notas de reunión y resumen por transcripción en tiempo real.",
          "zh-Hant": "會議記錄與即時轉寫總結工具。",
          "ja": "議事録とリアルタイム文字起こし要約。"
        }
      },
      {
        "name": "Zapier AI",
        "region": "intl",
        "url": "https://zapier.com/ai",
        "desc": {
          "en": "Zapier's AI automation and integration features.",
          "es": "Funciones de automatización e integración IA de Zapier.",
          "zh-Hant": "Zapier 推出的 AI 自動化整合能力。",
          "ja": "Zapier の AI 自動化・連携機能。"
        }
      },
      {
        "name": "Prezo",
        "region": "intl",
        "url": "https://prezo.ai/",
        "desc": {
          "en": "AI-assisted presentation creation.",
          "es": "Creación de presentaciones asistida por IA.",
          "zh-Hant": "AI 助力 PPT 演示文稿創作。",
          "ja": "AI で PPT プレゼンテーション作成。"
        }
      },
      {
        "name": "酷表 ChatExcel",
        "region": "cn",
        "url": "https://chatexcel.com/",
        "desc": {
          "en": "Chat with your spreadsheet to manipulate it (built by a Peking University team).",
          "es": "Chatea con tu hoja de cálculo para manipularla (equipo de la Universidad de Pekín).",
          "zh-Hant": "北大團隊研發的透過聊天操作表格的 AI 工具。",
          "ja": "北京大学チーム開発のチャット操作スプレッドシートツール。"
        }
      }
    ]
  },
  {
    "id": "translate",
    "name": {
      "en": "AI Translation",
      "es": "Traducción IA",
      "zh-Hant": "AI 翻譯",
      "ja": "AI 翻訳"
    },
    "tools": [
      {
        "name": "DeepL",
        "region": "intl",
        "url": "https://www.deepl.com/translator",
        "desc": {
          "en": "New-generation AI translator famous for natural output.",
          "es": "Traductor IA de nueva generación famoso por su naturalidad.",
          "zh-Hant": "以自然通順著稱的新一代 AI 翻譯工具。",
          "ja": "自然な译文で知られる次世代 AI 翻訳ツール。"
        }
      },
      {
        "name": "Google Translate",
        "region": "intl",
        "url": "https://translate.google.com/",
        "desc": {
          "en": "Free instant translation across 100+ languages.",
          "es": "Traducción instantánea gratuita en más de 100 idiomas.",
          "zh-Hant": "支援上百種語言的免費即時翻譯。",
          "ja": "100 以上の言語に対応する無料即時翻訳。"
        }
      },
      {
        "name": "必应翻译",
        "region": "intl",
        "url": "https://cn.bing.com/translator/",
        "desc": {
          "en": "Microsoft's online translation tool.",
          "es": "Herramienta de traducción online de Microsoft.",
          "zh-Hant": "微軟出品的線上翻譯工具。",
          "ja": "Microsoft のオンライン翻訳ツール。"
        }
      },
      {
        "name": "秘塔 AI 翻译",
        "region": "cn",
        "url": "https://law.metaso.cn/",
        "desc": {
          "en": "AI translation tool for professional terminology.",
          "es": "Herramienta IA para traducción de terminología profesional.",
          "zh-Hant": "面向專業術語的文件翻譯工具。",
          "ja": "専門用語向けの文書翻訳ツール。"
        }
      },
      {
        "name": "TranSmart",
        "region": "cn",
        "url": "https://transmart.qq.com/zh-CN/index",
        "desc": {
          "en": "Tencent AI Lab's AI-assisted translation product.",
          "es": "Producto de traducción asistida por IA de Tencent AI Lab.",
          "zh-Hant": "騰訊 AI Lab 研發的 AI 輔助翻譯產品。",
          "ja": "Tencent AI Lab 開発の AI 支援翻訳製品。"
        }
      },
      {
        "name": "有道翻译",
        "region": "cn",
        "url": "https://fanyi.youdao.com/index.html#/",
        "desc": {
          "en": "NetEase's popular translation and learning tool.",
          "es": "Herramienta popular de traducción y aprendizaje de NetEase.",
          "zh-Hant": "網易出品的翻譯與學習工具。",
          "ja": "NetEase の翻訳・学習ツール。"
        }
      },
      {
        "name": "阿里翻译",
        "region": "cn",
        "url": "https://translate.alibaba.com",
        "desc": {
          "en": "Alibaba DAMO Academy's multilingual online translation.",
          "es": "Traducción online multilingüe de Alibaba DAMO Academy.",
          "zh-Hant": "阿里達摩院推出的多語種線上翻譯。",
          "ja": "Alibaba DAMO 学院の多言語オンライン翻訳。"
        }
      },
      {
        "name": "讯飞智能翻译",
        "region": "cn",
        "url": "https://fanyi.xfyun.cn/console/trans/text",
        "desc": {
          "en": "iFlytek's AI translation platform.",
          "es": "Plataforma de traducción IA de iFlytek.",
          "zh-Hant": "科大訊飛推出的人工智慧翻譯平台。",
          "ja": "iFlytek の AI 翻訳プラットフォーム。"
        }
      },
      {
        "name": "百度翻译",
        "region": "cn",
        "url": "https://fanyi.baidu.com/",
        "desc": {
          "en": "Free translation across 200+ languages.",
          "es": "Traducción gratuita en más de 200 idiomas.",
          "zh-Hant": "提供 200+ 語言的免費翻譯服務。",
          "ja": "200 以上の言語に対応する無料翻訳。"
        }
      },
      {
        "name": "彩云小译",
        "region": "cn",
        "url": "https://fanyi.caiyunapp.com/#/",
        "desc": {
          "en": "Translation tool with real-time bilingual subtitles.",
          "es": "Herramienta de traducción con subtítulos bilingües en tiempo real.",
          "zh-Hant": "支援同傳字幕的翻譯工具。",
          "ja": "同時字幕対応の翻訳ツール。"
        }
      },
      {
        "name": "搜狗翻译",
        "region": "cn",
        "url": "https://fanyi.sogou.com/text",
        "desc": {
          "en": "Translation between 50+ languages.",
          "es": "Traducción entre más de 50 idiomas.",
          "zh-Hant": "支援 50 多種語言互譯。",
          "ja": "50 以上の言語間の相互翻訳。"
        }
      },
      {
        "name": "Lufe AI",
        "region": "cn",
        "url": "https://www.lufe.ai/zh",
        "desc": {
          "en": "Image text extraction plus all-in-one AI translation.",
          "es": "Extracción de texto de imágenes y traducción IA todo-en-uno.",
          "zh-Hant": "圖片文字擷取與多合一翻譯器。",
          "ja": "画像文字抽出と統合 AI 翻訳。"
        }
      }
    ]
  },
  {
    "id": "code",
    "name": {
      "en": "AI Coding",
      "es": "Programación IA",
      "zh-Hant": "AI 程式開發",
      "ja": "AI プログラミング"
    },
    "tools": [
      {
        "name": "GitHub Copilot",
        "region": "intl",
        "url": "https://github.com/features/copilot",
        "desc": {
          "en": "GitHub's AI coding assistant.",
          "es": "Asistente IA de programación de GitHub.",
          "zh-Hant": "GitHub 出品的 AI 程式助手。",
          "ja": "GitHub の AI プログラミングアシスタント。"
        }
      },
      {
        "name": "Cursor",
        "region": "intl",
        "url": "https://cursor.com/",
        "desc": {
          "en": "AI-powered code editor that thinks with you.",
          "es": "Editor de código con IA que piensa contigo.",
          "zh-Hant": "會思考的 AI 程式碼編輯器。",
          "ja": "一緒に考える AI コードエディタ。"
        }
      },
      {
        "name": "Codeium",
        "region": "intl",
        "url": "https://codeium.com/",
        "desc": {
          "en": "Free AI code acceleration across 40+ languages.",
          "es": "Acelerador de código IA gratuito para más de 40 lenguajes.",
          "zh-Hant": "支援 40 多種語言的免費 AI 程式碼加速工具。",
          "ja": "40 以上の言語に対応する無料 AI コード加速。"
        }
      },
      {
        "name": "CodiumAI",
        "region": "intl",
        "url": "https://www.codium.ai/",
        "desc": {
          "en": "Code completion and test generation assistant.",
          "es": "Asistente de completado de código y generación de tests.",
          "zh-Hant": "程式碼補完與測試生成助手。",
          "ja": "コード補完とテスト生成アシスタント。"
        }
      },
      {
        "name": "Warp",
        "region": "intl",
        "url": "https://www.warp.dev/",
        "desc": {
          "en": "Modern terminal with built-in AI command search.",
          "es": "Terminal moderno con búsqueda de comandos IA integrada.",
          "zh-Hant": "內建 AI 命令搜尋的現代終端機工具。",
          "ja": "AI コマンド検索を内蔵した最新ターミナル。"
        }
      },
      {
        "name": "Tabnine",
        "region": "intl",
        "url": "https://www.tabnine.com/",
        "desc": {
          "en": "AI code completion assistant.",
          "es": "Asistente IA de autocompletado de código.",
          "zh-Hant": "AI 程式碼編寫助手。",
          "ja": "AI コード補完アシスタント。"
        }
      },
      {
        "name": "AskCodi",
        "region": "intl",
        "url": "https://www.askcodi.com/",
        "desc": {
          "en": "AI assistant for any coding task.",
          "es": "Asistente IA para cualquier tarea de programación.",
          "zh-Hant": "覆蓋多種編碼場景的 AI 助手。",
          "ja": "あらゆるコーディング作業に対応する AI アシスタント。"
        }
      },
      {
        "name": "Conductor",
        "region": "intl",
        "url": "https://www.conductor.build/",
        "desc": {
          "en": "Parallel AI coding: no more single-threaded waits.",
          "es": "Programación IA en paralelo: olvídate de la espera de un solo hilo.",
          "zh-Hant": "並行 AI 程式設計,告別單執行緒等待。",
          "ja": "並列 AI プログラミングでシングルスレッド待ちを解消。"
        }
      },
      {
        "name": "Pencil",
        "region": "intl",
        "url": "https://www.pencil.dev/",
        "desc": {
          "en": "Design and code on one screen with live AI UI generation.",
          "es": "Diseño y código en una pantalla con UI IA en vivo.",
          "zh-Hant": "設計與程式碼同螢幕,AI 即時生成介面。",
          "ja": "デザインとコードを同画面で、AI が UI を即時生成。"
        }
      },
      {
        "name": "JamGPT",
        "region": "intl",
        "url": "https://jam.dev/jamgpt",
        "desc": {
          "en": "AI debug assistant for quick fixes.",
          "es": "Asistente IA de depuración para arreglos rápidos.",
          "zh-Hant": "AI Debug 調試助手,快速找到解決方案。",
          "ja": "AI デバッグアシスタント(迅速な解決策)。"
        }
      },
      {
        "name": "Hocoos",
        "region": "intl",
        "url": "https://hocoos.com/",
        "desc": {
          "en": "No-code AI website builder.",
          "es": "Constructor de sitios web IA sin código.",
          "zh-Hant": "無程式碼 AI 快速建立網站。",
          "ja": "ノーコード AI ウェブサイトビルダー。"
        }
      },
      {
        "name": "Fronty",
        "region": "intl",
        "url": "https://fronty.com/",
        "desc": {
          "en": "Image to HTML/CSS converter.",
          "es": "Conversor de imagen a HTML/CSS.",
          "zh-Hant": "圖像轉 HTML/CSS 轉換器。",
          "ja": "画像から HTML/CSS への変換ツール。"
        }
      },
      {
        "name": "Ludo AI",
        "region": "intl",
        "url": "https://ludo.ai/",
        "desc": {
          "en": "AI tool for game creators.",
          "es": "Herramienta IA para creadores de juegos.",
          "zh-Hant": "助力遊戲開發者的 AI 創作工具。",
          "ja": "ゲーム開発者向け AI 制作ツール。"
        }
      },
      {
        "name": "AI Dungeon",
        "region": "intl",
        "url": "https://play.aidungeon.io/main/home",
        "desc": {
          "en": "AI-driven interactive text adventure game.",
          "es": "Juego de aventura de texto interactivo con IA.",
          "zh-Hant": "AI 驅動的互動文字冒險遊戲。",
          "ja": "AI 駆動のインタラクティブテキストアドベンチャー。"
        }
      },
      {
        "name": "Charisma",
        "region": "intl",
        "url": "https://charisma.ai/",
        "desc": {
          "en": "AI character engine for Unity/Unreal and beyond.",
          "es": "Motor de personajes IA para Unity/Unreal y más.",
          "zh-Hant": "可接入 Unity/Unreal 的 AI 角色引擎。",
          "ja": "Unity/Unreal 対応の AI キャラクターエンジン。"
        }
      },
      {
        "name": "Hidden Door",
        "region": "intl",
        "url": "https://www.hiddendoor.co/",
        "desc": {
          "en": "AI-generated social role-playing games from novels.",
          "es": "Juegos sociales de rol generados con IA a partir de novelas.",
          "zh-Hant": "基於小說作品生成社交角色扮演遊戲。",
          "ja": "小説作品から生成される AI ソーシャル RPG。"
        }
      },
      {
        "name": "Latitude",
        "region": "intl",
        "url": "https://latitude.io/",
        "desc": {
          "en": "Platform for AI-driven interactive storytelling experiences.",
          "es": "Plataforma de experiencias narrativas interactivas con IA.",
          "zh-Hant": "AI 驅動的互動敘事體驗平台。",
          "ja": "AI 駆動のインタラクティブ物語体験プラットフォーム。"
        }
      },
      {
        "name": "MarsX",
        "region": "intl",
        "url": "https://www.marsx.dev/",
        "desc": {
          "en": "No-code micro-app builder.",
          "es": "Constructor de micro-apps sin código.",
          "zh-Hant": "無程式碼微應用開發平台。",
          "ja": "ノーコードのマイクロアプリ開発。"
        }
      },
      {
        "name": "TheCultureDAO",
        "region": "intl",
        "url": "https://www.theculturedao.com/",
        "desc": {
          "en": "AI-driven comics, games, and film platform.",
          "es": "Plataforma IA de cómics, juegos y cine.",
          "zh-Hant": "AI 驅動的漫畫、遊戲與影視平台。",
          "ja": "AI 駆動の漫画・ゲーム・映画プラットフォーム。"
        }
      }
    ]
  },
  {
    "id": "lab",
    "name": {
      "en": "AI Research Labs",
      "es": "Laboratorios IA",
      "zh-Hant": "AI 研究機構",
      "ja": "AI 研究機関"
    },
    "tools": [
      {
        "name": "OpenAI",
        "region": "intl",
        "url": "https://openai.com/",
        "desc": {
          "en": "The lab behind ChatGPT, GPT-4 and DALL·E.",
          "es": "El laboratorio detrás de ChatGPT, GPT-4 y DALL·E.",
          "zh-Hant": "ChatGPT、GPT-4 與 DALL·E 的開發機構。",
          "ja": "ChatGPT・GPT-4・DALL·E を開発する研究所。"
        }
      },
      {
        "name": "Anthropic",
        "region": "intl",
        "url": "https://www.anthropic.com/",
        "desc": {
          "en": "The lab behind the Claude model family.",
          "es": "El laboratorio detrás de la familia de modelos Claude.",
          "zh-Hant": "Claude 系列模型的開發機構。",
          "ja": "Claude モデルファミリーの開発元。"
        }
      },
      {
        "name": "Google DeepMind",
        "region": "intl",
        "url": "https://www.deepmind.google/",
        "desc": {
          "en": "Google's AI research lab (Gemini, AlphaFold, etc.).",
          "es": "Laboratorio de IA de Google (Gemini, AlphaFold, etc.).",
          "zh-Hant": "Google 的 AI 研究實驗室(Gemini、AlphaFold 等)。",
          "ja": "Google の AI 研究ラボ(Gemini、AlphaFold など)。"
        }
      },
      {
        "name": "Meta AI",
        "region": "intl",
        "url": "https://ai.meta.com/",
        "desc": {
          "en": "Meta's AI research lab (LLaMA, SAM, etc.).",
          "es": "Laboratorio IA de Meta (LLaMA, SAM, etc.).",
          "zh-Hant": "Meta 的 AI 研究實驗室(LLaMA、SAM 等)。",
          "ja": "Meta の AI 研究ラボ(LLaMA、SAM など)。"
        }
      },
      {
        "name": "Hugging Face",
        "region": "intl",
        "url": "https://huggingface.co/",
        "desc": {
          "en": "Open-source model and dataset hub with a strong research community.",
          "es": "Hub de modelos y datasets open-source con una sólida comunidad investigadora.",
          "zh-Hant": "開源模型與資料集中樞,擁有活躍的研究社群。",
          "ja": "活発な研究コミュニティを擁するオープンソースモデル/データセットの拠点。"
        }
      },
      {
        "name": "Allen AI (AI2)",
        "region": "intl",
        "url": "https://allenai.org/",
        "desc": {
          "en": "Non-profit AI research institute (OLMo, Tulu, etc.).",
          "es": "Instituto de investigación IA sin fines de lucro (OLMo, Tulu, etc.).",
          "zh-Hant": "非營利 AI 研究機構(OLMo、Tulu 等)。",
          "ja": "非営利の AI 研究機関(OLMo、Tulu など)。"
        }
      },
      {
        "name": "中国科学院自动化研究所",
        "region": "cn",
        "url": "http://www.ia.cas.cn/",
        "desc": {
          "en": "National-level automation and AI research institute.",
          "es": "Instituto nacional de investigación en automatización e IA.",
          "zh-Hant": "國家級自動化與人工智慧研究機構。",
          "ja": "国家レベルの自動化・AI 研究機関。"
        }
      },
      {
        "name": "北京大学人工智能研究院",
        "region": "cn",
        "url": "http://www.ai.pku.edu.cn/",
        "desc": {
          "en": "One of China's earliest AI research labs.",
          "es": "Uno de los primeros laboratorios de IA de China.",
          "zh-Hant": "中國最早開展人工智慧研究的機構之一。",
          "ja": "中国で最も早く AI 研究を開始した機関の一つ。"
        }
      },
      {
        "name": "清华大学人工智能研究院",
        "region": "cn",
        "url": "https://ml.cs.tsinghua.edu.cn/thuai/#/",
        "desc": {
          "en": "Tsinghua University's AI research institute.",
          "es": "Instituto de IA de la Universidad de Tsinghua.",
          "zh-Hant": "清華大學成立的人工智慧研究機構。",
          "ja": "清華大学が設立した AI 研究機関。"
        }
      },
      {
        "name": "复旦大学人工智能研究院",
        "region": "cn",
        "url": "https://ai3.fudan.edu.cn/",
        "desc": {
          "en": "Fudan University's AI innovation and industry institute.",
          "es": "Instituto de innovación e industria de IA de la Universidad de Fudan.",
          "zh-Hant": "人工智慧創新與產業研究院。",
          "ja": "AI 創新・産業研究院。"
        }
      },
      {
        "name": "上海交通大学人工智能研究院",
        "region": "cn",
        "url": "https://ai.sjtu.edu.cn/",
        "desc": {
          "en": "Ministry of Education key lab on AI.",
          "es": "Laboratorio clave de IA del Ministerio de Educación.",
          "zh-Hant": "教育部人工智慧重點實驗室。",
          "ja": "教育部の AI 重点实验室。"
        }
      },
      {
        "name": "北京通用人工智能研究院",
        "region": "cn",
        "url": "https://www.mybigai.ac.cn/",
        "desc": {
          "en": "Non-profit new R&D institute supported by the Ministry of Science and Technology.",
          "es": "Nuevo instituto I+D sin fines de lucro apoyado por el Ministerio de Ciencia y Tecnología.",
          "zh-Hant": "科技部支援的非營利新型研發機構。",
          "ja": "科学技術部支援の非営利新型 R&D 機関。"
        }
      },
      {
        "name": "腾讯 AI Lab",
        "region": "cn",
        "url": "https://ai.tencent.com/ailab/zh/index",
        "desc": {
          "en": "Tencent's AI research lab.",
          "es": "Laboratorio IA de Tencent.",
          "zh-Hant": "騰訊旗下人工智慧研究實驗室。",
          "ja": "Tencent の AI 研究ラボ。"
        }
      },
      {
        "name": "达摩院",
        "region": "cn",
        "url": "https://damo.alibaba.com/",
        "desc": {
          "en": "Alibaba's global research institute.",
          "es": "Instituto de investigación global de Alibaba.",
          "zh-Hant": "阿里巴巴旗下全球性研究院。",
          "ja": "Alibaba 傘下のグローバル研究機関。"
        }
      },
      {
        "name": "北京智源人工智能研究院",
        "region": "cn",
        "url": "https://www.baai.ac.cn/",
        "desc": {
          "en": "Systems-level, innovation-driven AI research institute.",
          "es": "Instituto de investigación IA impulsado por innovación a nivel sistémico.",
          "zh-Hant": "系統型創新驅動的人工智慧研究院。",
          "ja": "システム型イノベーション駆動の AI 研究院。"
        }
      },
      {
        "name": "360 智脑",
        "region": "cn",
        "url": "https://ai.360.cn/",
        "desc": {
          "en": "360's AI models and platform.",
          "es": "Modelos y plataforma IA de 360.",
          "zh-Hant": "360 推出的人工智慧技術與大模型。",
          "ja": "360 の AI モデルとプラットフォーム。"
        }
      },
      {
        "name": "网易伏羲",
        "region": "cn",
        "url": "https://fuxi.163.com/",
        "desc": {
          "en": "NetEase's robotics and AI research platform.",
          "es": "Plataforma de robótica e IA de NetEase.",
          "zh-Hant": "網易旗下的機器人與 AI 研究平台。",
          "ja": "NetEase のロボット・AI 研究プラットフォーム。"
        }
      },
      {
        "name": "HiAI",
        "region": "cn",
        "url": "https://developer.huawei.com/consumer/cn/hiai/",
        "desc": {
          "en": "Huawei's AI technology open platform.",
          "es": "Plataforma abierta de tecnología IA de Huawei.",
          "zh-Hant": "華為人工智慧技術開放平台。",
          "ja": "Huawei の AI 技術オープンプラットフォーム。"
        }
      }
    ]
  },
  {
    "id": "blogger",
    "name": {
      "en": "AIGC Creators",
      "es": "Creadores AIGC",
      "zh-Hant": "AIGC 達人",
      "ja": "AIGC クリエイター"
    },
    "tools": [
      {
        "name": "Simon (白日梦)",
        "region": "intl",
        "url": "https://weibo.com/u/1948301550",
        "desc": {
          "en": "Cross-disciplinary AI/architecture/art researcher.",
          "es": "Investigador interdisciplinario de IA, arquitectura y arte.",
          "zh-Hant": "AI / 建築 / 藝術跨領域研究者。",
          "ja": "AI・建築・アートを横断する研究者。"
        }
      },
      {
        "name": "Simon_阿文",
        "region": "cn",
        "url": "https://weibo.com/u/1757693565",
        "desc": {
          "en": "Tech influencer focused on AI tool recommendations.",
          "es": "Influencer tech centrado en recomendaciones de herramientas IA.",
          "zh-Hant": "專注 AI 工具推薦的科技博主。",
          "ja": "AI ツール紹介を得意とするテックブロガー。"
        }
      },
      {
        "name": "木遥",
        "region": "cn",
        "url": "https://weibo.com/u/1644684112",
        "desc": {
          "en": "Long-time AIGC knowledge sharer.",
          "es": "Compartidor de conocimiento AIGC desde hace tiempo.",
          "zh-Hant": "長期分享 AIGC 知識的博主。",
          "ja": "長年にわたり AIGC 知識を共有するブロガー。"
        }
      },
      {
        "name": "宝玉 xp",
        "region": "cn",
        "url": "https://weibo.com/u/1727858283",
        "desc": {
          "en": "AIGC content creator and tech translator.",
          "es": "Creador de contenido AIGC y traductor técnico.",
          "zh-Hant": "AIGC 領域內容創作者與技術譯者。",
          "ja": "AIGC コンテンツ制作者・技術翻訳者。"
        }
      },
      {
        "name": "海辛 Hyacinth",
        "region": "cn",
        "url": "https://weibo.com/u/1309158107",
        "desc": {
          "en": "AIGC enthusiast and experimental film director.",
          "es": "Entusiasta de AIGC y directora de cine experimental.",
          "zh-Hant": "AIGC 愛好者,實驗電影導演。",
          "ja": "AIGC 爱好家、実験映画監督。"
        }
      },
      {
        "name": "互联网的那点事",
        "region": "cn",
        "url": "https://weibo.com/u/1627825392",
        "desc": {
          "en": "Internet and AIGC industry observer.",
          "es": "Observador de la industria de internet y AIGC.",
          "zh-Hant": "關注網際網路與 AIGC 產業的觀察者。",
          "ja": "インターネットと AIGC 業界のオプザーバー。"
        }
      },
      {
        "name": "Barret 李靖",
        "region": "cn",
        "url": "https://weibo.com/u/1812166904",
        "desc": {
          "en": "AIGC explorer at Alibaba.",
          "es": "Explorador de AIGC en Alibaba.",
          "zh-Hant": "AIGC 探索者。",
          "ja": "AIGC 探検家。"
        }
      },
      {
        "name": "量子位",
        "region": "cn",
        "url": "https://weibo.com/u/6105753431",
        "desc": {
          "en": "Media outlet focused on AI and frontier tech.",
          "es": "Medio centrado en IA y tecnología de frontera.",
          "zh-Hant": "關注人工智慧與前沿科技的媒體。",
          "ja": "AI とフロンティア技術に注目するメディア。"
        }
      },
      {
        "name": "刘群",
        "region": "cn",
        "url": "https://weibo.com/u/1917491813",
        "desc": {
          "en": "Machine translation research expert.",
          "es": "Experto en investigación de traducción automática.",
          "zh-Hant": "機器翻譯領域研究者。",
          "ja": "機械翻訳分野の研究者。"
        }
      },
      {
        "name": "陈怡然（杜克大学）",
        "region": "cn",
        "url": "https://weibo.com/2199733231",
        "desc": {
          "en": "Duke professor of electrical and computer engineering.",
          "es": "Profesor de ingeniería eléctrica e informática en Duke.",
          "zh-Hant": "杜克大學電子與計算機工程系教授。",
          "ja": "Duke 大学の電気・计算机工学教授。"
        }
      },
      {
        "name": "拉面 daybreak",
        "region": "cn",
        "url": "https://weibo.com/u/1646432771",
        "desc": {
          "en": "AIGC explorer, illustrator and toy designer.",
          "es": "Explorador de AIGC, ilustrador y diseñador de juguetes.",
          "zh-Hant": "AIGC 探索者,插畫師與玩具設計師。",
          "ja": "AIGC 探検家、イラストレーター・玩具デザイナー。"
        }
      }
    ]
  },
  {
    "id": "collection",
    "name": {
      "en": "AI Tool Collections",
      "es": "Colecciones de herramientas IA",
      "zh-Hant": "AI 工具合集",
      "ja": "AI ツール集"
    },
    "tools": [
      {
        "name": "TopAI",
        "region": "intl",
        "url": "https://topai.tools/",
        "desc": {
          "en": "Discover the best new AI tools.",
          "es": "Descubre las mejores herramientas IA nuevas.",
          "zh-Hant": "發現最新最好的 AI 工具。",
          "ja": "最新かつ最良の AI ツールを発見。"
        }
      },
      {
        "name": "PowerfulAI",
        "region": "intl",
        "url": "https://www.powerfulai.tools/",
        "desc": {
          "en": "Daily-updated global AI tool directory.",
          "es": "Directorio global de herramientas IA actualizado a diario.",
          "zh-Hant": "每日更新的全球 AI 工具目錄。",
          "ja": "毎日更新のグローバル AI ツールディレクトリ。"
        }
      },
      {
        "name": "Toolscout",
        "region": "intl",
        "url": "https://toolscout.ai/",
        "desc": {
          "en": "Daily-updated AI tool discovery site.",
          "es": "Sitio de descubrimiento de herramientas IA actualizado a diario.",
          "zh-Hant": "每日更新的 AI 工具發現站。",
          "ja": "毎日更新の AI ツール発見サイト。"
        }
      },
      {
        "name": "SaaS AI Tools",
        "region": "intl",
        "url": "https://saasaitools.com/",
        "desc": {
          "en": "Daily AI news and tool aggregation.",
          "es": "Agregación diaria de noticias y herramientas IA.",
          "zh-Hant": "每日 AI 資訊與工具聚合。",
          "ja": "毎日の AI ニュースとツール集約。"
        }
      },
      {
        "name": "Stackradar",
        "region": "intl",
        "url": "https://www.stackradar.co/",
        "desc": {
          "en": "Curated list of the best internet tech tools.",
          "es": "Lista curada de las mejores herramientas técnicas de internet.",
          "zh-Hant": "精選網際網路優質技術工具。",
          "ja": "インターネット上の優良技術ツールを厳選。"
        }
      },
      {
        "name": "Toolfolio",
        "region": "intl",
        "url": "https://toolfolio.io/",
        "desc": {
          "en": "Curated collection of popular tools.",
          "es": "Colección curada de herramientas populares.",
          "zh-Hant": "精選熱門工具集合站。",
          "ja": "厳選のツール集サイト。"
        }
      }
    ]
  },
  {
    "id": "more",
    "name": {
      "en": "Explore More",
      "es": "Explorar más",
      "zh-Hant": "探索更多",
      "ja": "さらに探す"
    },
    "tools": [
      {
        "name": "OpenGPT",
        "region": "intl",
        "url": "https://open-gpt.app/",
        "desc": {
          "en": "Huge library of ChatGPT apps; create your own in seconds.",
          "es": "Enorme biblioteca de apps ChatGPT; crea la tuya en segundos.",
          "zh-Hant": "海量 ChatGPT 應用,幾秒鐘建立自己的小工具。",
          "ja": "膨大な ChatGPT アプリ、秒で自作可能。"
        }
      },
      {
        "name": "Synthesia",
        "region": "intl",
        "url": "https://www.synthesia.io/",
        "desc": {
          "en": "Create your own AI avatar and voice videos.",
          "es": "Crea tu propio avatar IA y videos con voz.",
          "zh-Hant": "建立自己的 AI 數位人與語音影片。",
          "ja": "自分の AI アバター・ボイス動画を作成。"
        }
      },
      {
        "name": "Tabnine",
        "region": "intl",
        "url": "https://www.tabnine.com/",
        "desc": {
          "en": "AI code completion assistant.",
          "es": "Asistente IA de autocompletado de código.",
          "zh-Hant": "AI 程式碼編寫助手。",
          "ja": "AI コード補完アシスタント。"
        }
      },
      {
        "name": "AI 帮个忙",
        "region": "cn",
        "url": "https://aibang.run/",
        "desc": {
          "en": "Collection of practical multi-purpose AI helpers.",
          "es": "Colección de asistentes IA prácticos multi-uso.",
          "zh-Hant": "集合多種實用 AI 小幫手的站點。",
          "ja": "実用的な AI ヘルパーを集約したサイト。"
        }
      },
      {
        "name": "Media.io",
        "region": "intl",
        "url": "https://www.media.io/",
        "desc": {
          "en": "Online media file AI processing toolbox.",
          "es": "Caja de herramientas IA online para archivos multimedia.",
          "zh-Hant": "線上媒體檔案 AI 處理工具箱。",
          "ja": "オンラインの AI メディア処理ツールボックス。"
        }
      }
    ]
  }
]

export const AI_TOOL_TOTAL = AI_TOOL_CATEGORIES.reduce(
  (sum, c) => sum + c.tools.length,
  0,
)

/** 从 URL 中提取便于展示的域名 */
export function toolHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** 取官网 favicon 作为品牌 icon（sz=128 保证清晰度）。 */
export function toolLogo(url: string): string {
  const host = toolHostname(url)
  return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
}

/**
 * English-only brand names for CN tools. Used by `displayName()` to keep
 * brand names clean in any locale — falls back to `nameLocalized.en`,
 * then `name`.
 */
const CN_TOOL_NAME_EN: Record<string, string> = {
  // AI Art / Image / Video
  "即梦 Jimeng": "Jimeng",
  "豆包 Doubao": "Doubao",
  "稿定 AI Gaoding": "Gaoding",
  "AI 星踪岛": "AI Xingzong",
  "liblib哩布哩布": "Liblib",
  "无界 AI": "Wujie AI",
  "星流 AI": "Xingliu AI",
  "腾讯元宝": "Tencent Yuanbao",
  "美图 AI 开放平台": "Meitu AI Platform",
  "美图云修": "Meitu Cloud Editor",
  "清图": "Qingtu",
  "字体家 AI 神笔": "Zitijia Magic Pen",
  "标小智": "LogoSC",
  "蝉妈妈": "Chanmama",
  "网易天音": "NetEase Tianyin",
  "剪映专业版": "CapCut",
  "腾讯智影": "Tencent Zenvideo",

  // AI Chat / Coding / Agent
  "扣子 Coze": "Coze",
  "星辰 Agent": "iFlytek Agent",
  "DeepSeek": "DeepSeek",
  "文心一言": "Wenxin Yiyan",
  "通义千问": "Tongyi Qianwen",
  "Kimi": "Kimi",
  "腾讯 AI Lab": "Tencent AI Lab",
  "达摩院": "DAMO Academy",
  "360 智脑": "360 Brain",
  "网易伏羲": "NetEase Fuxi",
  "HiAI": "HiAI",

  // AI Writing
  "秘塔 AI 搜索": "Metaso",
  "秘塔写作猫": "Xiezuocat",
  "火山写作": "Writingo",
  "据意查句": "WantQuotes",
  "Effidit": "Effidit",
  "爱改写": "Aigaixie",
  "新华妙笔": "Xinhua Miaobi",
  "悉语": "Xiyu",
  "爱创作": "Aichuangzuo",
  "字语未来": "GetGetAI",

  // AI Translate
  "秘塔 AI 翻译": "Metaso Translate",
  "TranSmart": "TranSmart",
  "有道翻译": "Youdao Translate",
  "阿里翻译": "Alibaba Translate",
  "讯飞智能翻译": "iFlytek Translate",
  "百度翻译": "Baidu Translate",
  "彩云小译": "Caiyun Translate",
  "搜狗翻译": "Sogou Translate",
  "Lufe AI": "Lufe AI",

  // AI Image Tools (non-art)
  "Arc Lab": "Arc Lab",
  "PicWish": "PicWish",
  "BgSub": "BgSub",
  "像素蛋糕": "Pixcake",
  "AIDesign": "AIDesign",
  "ImageCreator": "ImageCreator",

  // Office / Productivity
  "酷表 ChatExcel": "ChatExcel",
  "阿里云 AI 学习路线": "Alibaba Cloud AI Path",
  "AI 大课堂": "AI Daxuetang",

  // Research Labs
  "中国科学院自动化研究所": "CAS Institute of Automation",
  "北京大学人工智能研究院": "Peking University AI Institute",
  "清华大学人工智能研究院": "Tsinghua AI Institute",
  "复旦大学人工智能研究院": "Fudan AI Institute",
  "上海交通大学人工智能研究院": "SJTU AI Institute",
  "北京通用人工智能研究院": "BIGAI",
  "北京智源人工智能研究院": "BAAI",

  // Bloggers / KOLs
  "Simon_阿文": "Simon Awen",
  "木遥": "Mu Yao",
  "宝玉 xp": "Baoyu",
  "海辛 Hyacinth": "Hyacinth",
  "互联网的那点事": "Internet Things",
  "Barret 李靖": "Barret Li Jing",
  "量子位": "QbitAI",
  "刘群": "Liu Qun",
  "陈怡然（杜克大学）": "Chen Yiran (Duke)",
  "拉面 daybreak": "Lamian",
  "AI 帮个忙": "AI Bangmang",

  // Skill sites
  "Skillstore": "Skillstore",
  "SkillHub": "SkillHub",
  "Skillbox": "Skillbox",

  // TTS
  "TTSMaker": "TTSMaker",
}

/**
 * Returns the brand name to render for the active locale.
 * Priority: nameLocalized[locale] → nameLocalized.en → CN_TOOL_NAME_EN[name] → name.
 * Guarantees users never see a mixed Chinese/English brand string.
 */
export function displayName(tool: AiTool, locale: Locale): string {
  if (tool.nameLocalized?.[locale]) return tool.nameLocalized[locale]
  if (tool.nameLocalized?.en) return tool.nameLocalized.en
  if (tool.region === "cn" && CN_TOOL_NAME_EN[tool.name]) {
    return CN_TOOL_NAME_EN[tool.name]
  }
  return tool.name
}
