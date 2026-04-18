# Power Tab

[中文说明 / Chinese README](./README.zh-CN.md)

Power Tab is a Chrome extension for opening, reusing, and switching tabs with less friction.

## Philosophy

Power Tab treats the browser as a workspace.

It is designed around a few daily habits:
- search before opening,
- reuse before duplicating,
- keep common destinations close,
- switch tabs without losing context.

## Features

- Search the web, open a URL, or jump to an existing tab from one input.
- Group open tabs by site.
- Close single tabs, close groups, and clear duplicate tabs faster.
- Keep frequently used destinations in Quick Apps.
- Reorder Quick Apps with drag and drop.
- Trigger Quick Tab Switcher with a keyboard shortcut.

## Inspiration

Power Tab is inspired in part by **@张咋啦（Zara）** and the **tab-out** project:
- https://github.com/zarazhangrui/tab-out

That influence is most visible in the keyboard-first tab switching direction. Power Tab extends it into a broader new-tab workflow shaped by everyday browsing habits.

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Chrome Extension Manifest V3
- pnpm

## Development

Install dependencies:

```bash
pnpm install
```

Build the extension:

```bash
pnpm build
```

Useful scripts:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Load in Chrome:
1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click **Load unpacked**
4. Select the project root or `dist`, depending on your workflow

## Status

Power Tab is in an early but usable stage.

Core new-tab flow, Quick Apps, open-tab reuse, and Quick Tab Switcher are available.

## License

MIT
