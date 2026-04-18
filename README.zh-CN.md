# Power Tab

[English README](./README.md)

Power Tab 是一个 Chrome 扩展，用更低的操作成本完成标签页打开、复用与切换。

## 设计理念

Power Tab 把浏览器看作工作空间的一部分。

它围绕几条常见的日常使用习惯来设计：
- 先搜索，再打开；
- 先复用，再新开；
- 常用入口保持近手；
- 切换标签时尽量不打断上下文。

## 当前功能

- 在一个输入框里完成搜索、打开 URL、跳转已有标签页。
- 按站点聚合已打开标签页。
- 支持关闭单个标签、关闭整组，以及更快清理重复标签。
- 用 Quick Apps 固定高频站点。
- 支持 Quick Apps 拖拽排序。
- 通过快捷键触发 Quick Tab Switcher。

## 灵感来源

Power Tab 的一部分灵感来自 **@张咋啦（Zara）** 的 **tab-out** 项目：
- https://github.com/zarazhangrui/tab-out

这种影响主要体现在键盘驱动的标签切换方向上。Power Tab 在此基础上继续延展到了新标签页入口和日常浏览器工作流。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Chrome Extension Manifest V3
- pnpm

## 本地开发

安装依赖：

```bash
pnpm install
```

构建扩展：

```bash
pnpm build
```

常用脚本：

```bash
pnpm build
pnpm typecheck
pnpm test
```

在 Chrome 中加载：
1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 点击“加载已解压的扩展程序”
4. 根据你的工作流选择项目根目录或 `dist`

## 当前状态

Power Tab 目前已经具备可用的初版能力。

新标签页工作台、Quick Apps、已开标签复用和 Quick Tab Switcher 都已经可以使用。

## License / 许可

MIT
