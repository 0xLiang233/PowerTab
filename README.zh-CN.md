# Power Tab

[English README](./README.md)

![Power Tab 宣传图占位](./docs/assets/promo.png)

Power Tab 是一个 Chrome 扩展，把新标签页变成更实用的标签工作台。

它帮助你复用、切换、整理和稍后再看日常打开的页面，但不把浏览器变成复杂沉重的 workspace 系统。

## 它能做什么

- 优先复用已打开标签，减少重复页面。
- 按站点聚合当前窗口里的标签页，并让首页类标签更容易识别。
- 支持关闭单个标签、关闭整组、清理重复标签，以及关闭多余的 Power Tab 页面。
- 把标签保存到稍后读，之后再打开或移除。
- 自定义 Quick Apps，保存常用站点入口。
- Quick Apps 支持专门的管理模式：添加、编辑、删除、拖拽排序。
- 通过快捷键打开紧凑的 Quick Tab Switcher 覆盖层。
- 在切换器里用键盘搜索、移动、打开上一个标签、关闭标签。
- 本地缓存 favicon，让图标显示更稳定。
- 支持配置语言、视觉样式和标签切换能力。

## 产品心智

Power Tab 围绕一个简单工作流设计：

- **先复用**：如果命中已有标签，优先回到已有页面。
- **有意打开**：Quick Apps 像轻量应用启动器，点击后始终新开标签。
- **持续整理**：标签按站点聚合，清理成本更低。
- **不丢上下文地切换**：Quick Tab Switcher 覆盖在当前网页上，专注于快速选中目标标签。

## 核心区域

### 新标签页工作台

新标签页包含：

- Quick Apps；
- 当前标签分组；
- 重复标签清理；
- 稍后读；
- 设置。

### Quick Apps

Quick Apps 是常用站点入口。

支持：

- 添加 / 编辑 / 删除；
- 使用 favicon 或回退图标；
- 拖拽排序；
- 管理模式，避免普通使用时界面杂乱；
- 本地持久化。

Power Tab 现在不再内置默认快捷入口，新安装时 Quick Apps 为空。

### 当前标签管理

当前窗口的标签会按站点展示，方便快速扫描和清理：

- 跳转到已有标签；
- 关闭单个标签；
- 关闭整组标签；
- 关闭重复标签；
- 关闭多余的 Power Tab 页面。

### 稍后读

稍后读会把标签保存到本地，让你可以先从当前标签集合里清理掉，之后再回来查看。

### Quick Tab Switcher

Quick Tab Switcher 是一个键盘驱动的当前窗口标签切换覆盖层。

支持：

- 按标题、域名或 URL 搜索；
- 方向键和 Tab 切换高亮项；
- Enter 打开当前高亮标签；
- Shift+Enter 返回上一个标签；
- 在切换器里直接关闭标签；
- 固定尺寸覆盖层，内部滚动；
- 滚动不会穿透到背后的网页。

## 存储

Power Tab 使用 `chrome.storage.local` 保存用户数据：

- Quick Apps；
- 稍后读；
- favicon 缓存；
- 设置。

这些数据会在浏览器重启、扩展 reload 和扩展更新后保留。卸载扩展会清除这些本地数据。

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

运行检查：

```bash
pnpm typecheck
pnpm test
```

构建扩展：

```bash
pnpm build
```

在 Chrome 中加载：

1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 点击“加载已解压的扩展程序”
4. 选择生成后的 `dist` 目录

开发时建议使用扩展页里的“重新加载”，尽量不要卸载重装。卸载会清除 `chrome.storage.local` 中的数据。

## 常用脚本

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm version-sync
```

`pnpm build` 会先执行 `version-sync`，让 `public/manifest.json` 的版本和 `package.json` 保持一致。

## 当前状态

Power Tab 仍处于个人使用 / 早期迭代阶段，但核心流程已经可用：

- 新标签页工作台；
- 已开标签复用；
- Quick Apps；
- 稍后读；
- Quick Tab Switcher；
- 设置与本地持久化。

## License / 许可

MIT
