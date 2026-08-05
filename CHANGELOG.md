# 更新日志 · Changelog

本格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [1.2.1] - 2026-08-04

工程化加固版本：补测试、修依赖漏洞、优化安全与加载性能。

### 新增

- **单元测试**：引入 vitest + fake-indexeddb，覆盖核心逻辑：
  - `sse.ts`：三家 LLM（OpenAI 兼容 / Anthropic / Gemini）流式增量与非流式全文解析、SSE 缓冲消费
  - `rag.ts`：蒸馏清洗 `distillAnswer`、典据引用判定 `filterCitedHits`
  - `huaxiaFilter.ts`：华夏相关性判定与标签提取
  - `markdownParser.ts`：frontmatter 解析、md ↔ KBEntry 互转
  - `knowledgeBase.ts`：检索排序、hits 自增、蒸馏合并、删除保护、统计（IndexedDB 实测）
  - `settingsStore.ts`：设置 v1→v2 迁移
- **CI 接入测试**：`.github/workflows/ci.yml` 增加 Test 步骤（typecheck + lint + test + build）。
- 脚本：`npm run test` / `npm run test:watch` / `npm run test:coverage`。

### 优化

- **抽取纯解析层 `src/lib/sse.ts`**：LLM 响应解析与 fetch 编排解耦，可单测、可复用。
- **Gemini 密钥改走请求头**：`x-goog-api-key` 替代 URL query，避免密钥进日志/Referrer。
- **路由懒加载**：Home / Chat 分包（React.lazy + Suspense），消除 >500kB 主包告警。
- **蒸馏落款清洗修正**：支持 `「青砚谨复」` / `〔青砚谨复〕` 尾部引号落款剥离。
- **清理死代码**：移除 Gemini 分支未使用的 `lastUser` 计算。

### 修复

- **欢迎界面 → 主界面过渡丢失**：首页品牌大字 / slogan / 远山入场动画原为随组件挂载即播放；路由懒加载分包后 Home 挂载提前，这些动画在开场遮罩之下播完，遮罩揭开时内容已是静态，观感上"过渡消失"。已改为与中下段 section 一致，等 `appReady`（开场结束）后再播放，恢复「时空穿越 → 品牌浮现 → 远山展开」的连贯过渡。

### 安全

- **electron 33 → 43**：修复 20+ 条已公开漏洞（use-after-free、注入等），33 已 EOL。
- **electron-builder 25 → 26.15.3**：修复 `tar`（critical）与 builder-util-runtime 链漏洞。
- `postcss` / `brace-expansion` 自动修复。
- 说明：`react-router` 7.18.1 的 RSC CSRF advisory（GHSA-qwww-vcr4-c8h2）仅影响 RSC/框架模式，本项目为 library 模式（HashRouter + 普通 Routes）不受影响，暂不升级 v8。

### 测试

- 本地全量验证：`npm run check` / `npm run lint` / `npm run test` / `npm run build` 全部通过。

## [1.2.0] - 2026-08-03

外接知识库实时关联版本。

### 新增

- **外接库实时关联**：替代原 external 导入导出，改为 Obsidian vault / Markdown 文件夹实时双向同步。
  - 主进程 IPC：`dialog:openDirectory`（选目录）、`fs:scanVault`（递归扫描 md + 检测 .obsidian 目录）、`fs:readFile`、`fs:writeMd`（按主题写 md 到 `vault/青砚典籍/{topic}/`）、`fs:exists`（启动校验）。
  - preload 暴露 `desktop.selectDirectory/scanVault/readFile/writeMd/exists`。
- **externalStore**（Zustand persist）：vault 配置（路径/名称/是否 Obsidian/mdCount/syncWrite）持久化到 localStorage。`connect`（选目录→扫描→自动配置→同步加载）、`disconnect`、`sync`（清旧+重扫+读 md→解析→入 external 库）、`writeToVault`（收入典籍同步写 md）、`clearExternal`、`setVaultSyncWrite`、`validateVaultOnBoot`（启动校验路径有效性）。
- **Markdown 解析器**：`parseMarkdown`（YAML frontmatter 子集解析）、`mdToEntry`（md→KBEntry，按关键词推断主题）、`entryToMd`（KBEntry→md，含 frontmatter）。
- **AI 触发关联指令**：chatStore `isExternalConnectIntent` 识别"关联 obsidian""扫描我的知识库""连接 vault"等指令，命中返回引导回复 + `triggerConnect` 标记。Chat 页监听 `triggerConnect` 自动切到典籍阁 tab 并触发关联流程。
- **LibraryScroll 外接库状态条**：已关联显示 vault 名 + Obsidian 标记 + 重新扫描 + 写入同步开关 + 断开；未关联显示「关联外接知识库」按钮。Web 模式降级提示需桌面版。
- **双向同步**：启动时 `validateVaultOnBoot` 校验路径有效性并自动同步；「收入典籍」时若开启写入同步则自动写 md 到 `vault/青砚典籍/{topic}/`。

### 修复

- **外接库语义错配**：原 external 库设计为导入导出（与 user 库重叠）· 改为实时关联 Obsidian vault，外接库成为独立的知识源（实时读取 + 写入同步）。

## [1.1.0] - 2026-08-03

典籍阁双层知识库 + 智能补库版本。

### 新增

- **双层知识库结构**：`KBEntry` 新增 `library` 字段（seed 预置只读 / user 用户累计可读写 / external 外接导入），`origin` 字段标记外接来源。DB v1→v2 自动迁移补 `library`。
  - `distillKB` 仅蒸馏 user 库 · seed/external 永不裁汰 · 保护预置与外接知识。
  - `queryKB` 加 `library` 过滤 + seed 库加权更高（可信度强）。
- **典籍阁 LibraryScroll 组件**：左栏 tab 切换「案头 / 典籍阁」，三库分览，按主题归目，搜索检索，导出 JSON 备份，导入恢复，删除条目（仅 user/external 可删，seed 不可删）。
- **compatible 模式智能补库**：首页飞书发问，若 `isHuaxiaRelated` 判定为华夏/四朝代相关且未命中库，回复下方显示克制「收入典籍」印章按钮，用户点击确认才入库；不点击不入库。已收入显示「已藏」小印。
  - `huaxiaFilter.ts`：四组关键词白名单（六事雅赏 / 四朝代典制 / 经史子集 / 雅物器物）+ `isHuaxiaRelated` + `matchedHuaxiaTags`。
- **知识库导入导出**：`exportLibrary` 导出 user+external 为 JSON；`importLibrary` 合并导入，同 question 跳过，跨设备统一标 user 库 manual 来源。
- **`confirmToKB`**：显式入库专用，入 user 库 manual 来源，与自动蒸馏的 llm 来源区分。
- **`removeEntry`**：删除条目，seed 不可删。
- **`kbStats` 加 `byLibrary`**：分库统计。

### 修复

- **compatible 模式典据语义错配**：`compatibleRag` 拿到大模型回复后过滤 kbHits，仅当回复实质引用了某条典据（≥8 字连续子串重叠或 question 核心词 ≥4 字命中）才作为 citations 回传。无实质引用时 `source` 标 `llm`，不显示无关典据卡片。
- **topic 模式正文重复标注典据**：删除正文末尾的 `〔典据〕` 文字标注，典据统一由下方「典籍所出」卡片展示。

## [1.0.1] - 2026-08-03

界面一致性、可访问性与国风细节打磨版本。无破坏性变更。

### 修复

- **修复 `.theme-qin` 选择器丢失的 P0 bug**：上轮编辑误删了秦朝主题块开头的 `.theme-qin {` 选择器，导致后续 CSS 变量裸露、秦朝主题完全失效。补回选择器。
- **AI 头像硬编码**：信笺（LetterPaper）原用硬编码 SVG 头像，改为新组件 `PersonaAvatar`，随 `agentPersona`（书童/文人/道长/馆员）切换。
- **心源区硬编码颜色**：`#8AA0A8` 改为 `rgb(var(--c-qingbi-light-rgb))`，随朝代自适应。
- **首页试问词固定宋韵**：改为从 `features.ts` 按当前朝代动态获取，切朝代自动换新。
- **对话页 lg 三栏过挤**：三栏布局阈值由 `lg` 提至 `xl`，`lg` 时右栏改为折叠 `<details>`，含行军图/手札 tab 切换。
- **过时注释**：`index.css` 与 `tailwind.config.js` 中"三朝"注释统一改为"四朝"，并补齐秦/唐配色说明。
- **开场动画不可跳过**：`index.html` 的"入境"印章改为 `<button>`，点击触发 `__BOOT_SKIPPED__` flag，`main.tsx` 据此 wait=0 立即进入移除流程。
- **低对比度文字**：多处 `text-qingbi/40`、`/45` 提升为 `/60`、`/65`，确保可读性。

### 新增

- **四朝专属暗纹背景**：`--dynasty-motif` CSS 变量驱动，宋·冰裂纹（哥窑开片）/明·缠枝莲（青花纹样）/秦·云纹瓦当（同心卷云）/唐·宝相花（团花卷草），极低 opacity 不喧宾夺主。
- **印章钤印动画**：`Seal` 新增 `stamp` prop，落款印章播放"按下-轻颤-落定"动画（`seal-stamp` keyframes），信笺收信完成时触发。
- **竹简纵向竹片 + 麻绳绳结**：`BambooSlip` 改为每 22px 一片的纵向竹片分隔 + 立体高光 + 上下麻绳横贯 + 绳结节点。
- **卷轴展开立体感**：`ScrollInput` 轴头固定两端，展开后加左右 inset 阴影模拟纸从轴上展开的卷曲。
- **落笔/收信可视动效**：`inkStretch`（用户落笔时竹简上下麻绳墨痕自左向右延展）+ `inkSettle`（AI 收信定稿时落款上方墨痕自中心向两侧铺开）。
- **DynastySwitcher hover 预览卡**：每个朝代小印 hover 时浮出"朝代名 + 意境短语"预览卡，CSS only，compact 模式不显示。
- **/chat 空状态「研墨以待」**：极端兜底场景（initConversation 异常时）显示砚台 + 墨锭简笔 SVG + 文案。
- **多宝阁移动端 2 列起步**：`TreasureGrid` 由 `grid-cols-1` 改为 `grid-cols-2`，移动端宫格不再过长。
- **`prefers-reduced-motion` 支持**：前庭敏感用户关闭位移/缩放/模糊动效，仅保留透明度终态。
- **键盘焦点可见性**：`:focus-visible` 全局朱砂描边，鼠标点击不显示，键盘 Tab 才显示。
- **应用就绪事件总线**：`appReady.ts` 解耦开场动画与页面入场逻辑，支持 HMR 热重载。

### 体验

- 卷轴底边落款（副标 + 朝代意境 + 印文）淡入显于底边，首屏留白至上。
- 首屏品牌大字 + slogan 随朝代变化，配 inkSpread 入场。

## [1.0.0] - 2025-07-29

首个开源版本。国风 AI 雅伴，四朝意境，墨韵为骨。

### 新增

- **四朝主题系统**：宋（青绿文人）/明（青花瓷韵）/秦（玄墨竹简）/唐（金碧辉煌），CSS 变量驱动全局配色与字体自适应
- **开场动画**：毛笔逐字书写朝代名句 + 钤印 + 时空穿越过渡
- **朝代切换**：墨染过渡——薄墨自右上角晕开覆屏，朝代字居中浮现，墨色褪去露出新朝代色
- **卷轴输入框**：双轴头横向卷轴造型，首页入场自中间向两侧缓缓展开
- **国风对话流**：竹简（用户消息）+ 信笺（AI 回信）+ 朱印落款
- **四朝思考动画**：宋研墨（墨锭绕砚+墨池渐深+涟漪）/明瀹茗（茶盏蒸汽+茶汤晃动+液面高光）/秦刻简（刻刀+木屑坠落+新刻笔痕）/唐煎茶（风炉火苗+余烬冉冉+蒸汽）
- **研思录**：思考链抽屉，记录 AI 推理过程
- **案头翰墨索引**：左侧对话主题导航
- **行军图/手札记忆**：右侧任务规划与对话记忆双面板切换
- **多宝阁**：朝代特色功能卡片网格
- **环境音系统**：Web Audio API 纯合成（零外部音频），朝代切换钟磬、卷轴展开纸摩擦、落笔/收信、四朝思考专属环境音，导航栏静音切换
- **知识库 RAG**：华夏典籍种子库 + 检索增强生成
- **桌面应用**：Electron 打包，支持 Windows（NSIS .exe）/macOS（DMG x64+arm64）/Linux（AppImage+deb）
- **应用就绪事件总线**：解耦开场动画与页面入场逻辑，支持 HMR 热重载

### 体验

- 路由切换墨韵入场（opacity + translateY + blur）
- 首页 section 滚动入场（IntersectionObserver 触发一次）
- 全局朱印式按钮、宣纸纹理底、青碧细线分隔

### 文档

- README 中英双语项目介绍
- CONTRIBUTING 贡献指南（含朝代内容贡献章节）
- CODE_OF_CONDUCT 行为准则
- GitHub Issue/PR 模板
- CI/CD 工作流（lint + 类型检查 + 多平台 Release 构建）
