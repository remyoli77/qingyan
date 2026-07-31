# 贡献指南 · Contribution Guide

感谢你对青砚项目的关注。无论是一处错字、一个动画细节，还是一整段朝代意境的打磨，我们都欢迎你的参与。

## 一、行为准则

参与本项目即代表你同意遵守 [Code of Conduct](./CODE_OF_CONDUCT.md)。请始终保持儒雅、尊重、建设性的交流态度——这与项目本身的气质一致。

## 二、开发环境准备

```bash
# 1. Fork 仓库后克隆到本地
git clone https://github.com/<你的用户名>/qingyan.git
cd qingyan

# 2. 安装依赖（需 Node.js 20+）
npm install

# 3. 启动 Web 开发模式（浏览器调试）
npm run dev

# 4. 启动桌面开发模式（Electron 壳 + Vite）
npm run dev:electron
```

开发模式下 Vite 默认运行在 `http://localhost:5173`，支持热更新。

## 三、项目结构

```
src/
├── components/   # 组件 · 卷轴/竹简/信笺/印章等国风构件
├── pages/        # 页面 · Home 首页 / Chat 对话页
├── store/        # 状态 · zustand · 主题/对话/设置
├── lib/          # 工具 · 知识库/RAG/LLM/环境音/应用就绪事件
├── data/         # 数据 · 功能特性/种子知识/对话模拟
└── index.css     # 全局样式 · 朝代主题变量
electron/         # Electron 主进程与预加载
.github/          # CI/CD 工作流与 Issue/PR 模板
```

## 四、开发约定

### 4.1 代码风格

- **TypeScript 严格模式**：所有新代码需通过 `npm run check` 类型检查
- **ESLint**：通过 `npm run lint`，规则见 `eslint.config.js`
- **命名**：组件 PascalCase，工具函数 camelCase，常量 UPPER_SNAKE_CASE
- **注释**：关键逻辑用中文行内注释，复杂函数用 JSDoc

### 4.2 主题与配色

项目以"墨、宣纸、朱砂、青碧、鎏金、赭石"为基本色，四朝（宋/明/秦/唐）各有主题色。新增 UI 元素时：

- 优先使用 `tailwind.config.js` 中已定义的颜色 token（如 `text-daiqing`、`bg-xuanzhi`）
- 朝代相关的动态色用 CSS 变量（如 `rgb(var(--c-daiqing-rgb))`），确保切朝代时自动适配
- 避免硬编码十六进制色值，破坏朝代切换的一致性

### 4.3 动画与音效

- 动画统一在 `tailwind.config.js` 的 `keyframes` + `animation` 中定义，缓动函数优先用 `cubic-bezier(0.22, 1, 0.36, 1)`
- 新增环境音通过 `src/lib/ambience.ts` 的 Web Audio 合成，不引入外部音频文件
- 动画与音效都应"儒雅而不张扬"——克制是本项目的审美底线

## 五、提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>
```

**type 取值**：

| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复缺陷 |
| `refactor` | 重构（无功能变化） |
| `style` | 样式/格式调整 |
| `docs` | 文档 |
| `anim` | 动画/动效 |
| `sound` | 音效 |
| `chore` | 构建/工具/依赖 |
| `ci` | CI 配置 |

示例：

```
feat(chat): 唐朝思考动画增加余烬上升效果
fix(scroll): 卷轴轴头在 textarea 增高时未居中
anim(dynasty): 朝代切换墨染过渡收势缓动调柔
docs: 补充贡献指南朝代配色章节
```

## 六、Pull Request 流程

1. **新建分支**：从 `main` 切出，命名 `feat/xxx`、`fix/xxx`、`anim/xxx`
2. **开发提交**：遵循上述提交规范，保持原子化提交
3. **自测**：
   - `npm run check` 类型检查通过
   - `npm run lint` 通过
   - `npm run build` 构建无报错
   - 视觉/交互改动需在 Web 与 Electron 两种模式下各验证一次
4. **提交 PR**：填写 PR 模板，关联相关 Issue
5. **Review**：维护者 review，可能提出修改建议
6. **合并**：squash merge 到 `main`

## 七、Issue 指引

提 Issue 前请先搜索是否已存在相同问题。

- **Bug 报告**：用 Bug 模板，附复现步骤、期望/实际表现、环境信息（OS、Node 版本、朝代主题）
- **功能建议**：用 Feature 模板，说明使用场景与期望效果，最好附参考图

## 八、朝代内容贡献

本项目最稀缺的不是代码，而是**有格调的朝代内容**——诗词典据、茶道书画、意境文案。如果你在某朝文化上有专长，欢迎贡献：

- 修正 `src/store/themeStore.ts` 中朝代 `promptHint` / `vibe` 的不准确表述
- 扩充 `src/data/seedKnowledge.ts` 的知识库种子
- 优化 `src/data/mockChat.ts` 的回信文风

提交时在 PR 中说明典据出处即可。

## 九、许可证

提交的代码将以 [MIT License](./LICENSE) 发布。提交即代表你同意该许可。

---

愿与诸君共研此砚，以代码续文脉。
