# Power Tab v1 技术架构草案

## 目标

为 Power Tab 提供一个可维护、可演进的 v1 架构，满足：

- Chrome 新标签页扩展形态
- 本地存储优先
- 搜索框优先复用已打开 tab
- Quick Apps 轻量可编辑
- Tab 管理区保留 Tab Out 的核心价值
- 为未来同步能力预留清晰边界

---

## 技术选型建议

### 推荐组合

- **TypeScript**
- **Vue 3**
- **Vite**
- **Chrome Extension Manifest V3**
- **chrome.storage.local** 作为 v1 持久化层
- **Vitest** 做纯逻辑测试
- **Vue Composition API + composables** 做轻量状态组织

### 为什么这样选

#### TypeScript
需要尽早把这些对象类型化：

- Tab 实体
- Quick App 实体
- 搜索候选项
- 设置项
- 存储结构

这样后面做搜索匹配、排序、存储迁移时会更稳。

#### Vue 3
页面虽然不大，但交互很多：

- 搜索输入和候选状态
- Quick Apps 编辑
- Tab 分组渲染
- 批量操作反馈

用 Vue Composition API 管 UI 状态会比原生 DOM 拼接更可维护，同时更符合当前项目的开发偏好。

#### Vite
适合快速搭建扩展前端，开发体验轻，构建简单。

#### Composition API / composables
如果不想引入额外全局状态管理，先用 composables + service 层就够了。
v1 不必急着引入 Pinia。

---

## 推荐目录结构

```text
power-tab/
  docs/
  src/
    app/
      App.vue
      routes/
      providers/
    components/
      search/
      quick-apps/
      tabs/
      layout/
      common/
    features/
      search/
        components/
        composables/
        services/
        search.types.ts
      quick-apps/
        components/
        composables/
        services/
        quick-apps.types.ts
      tabs/
        components/
        composables/
        services/
        tabs.types.ts
      settings/
        services/
        settings.types.ts
    domain/
      search/
        rankCandidates.ts
        classifyInput.ts
      tabs/
        groupTabs.ts
        matchOpenTabs.ts
        normalizeUrl.ts
      quick-apps/
        buildQuickAppIcon.ts
    infrastructure/
      chrome/
        chrome-tabs.ts
        chrome-storage.ts
      storage/
        local-storage-repo.ts
      icons/
        favicon.ts
    shared/
      types/
      utils/
      constants/
    entrypoints/
      newtab/
        main.ts
        index.html
      background/
        main.ts
  public/
  manifest.config.ts
  package.json
```

核心原则：

- **UI、领域逻辑、基础设施分层**
- chrome API 不直接散落在组件里
- 可测试逻辑放到 `domain/`
- 与浏览器交互的代码放到 `infrastructure/`

---

## 模块划分

## 1. Search 模块

职责：

- 接收用户输入
- 识别输入意图（URL / 域名 / 普通词）
- 获取 open tabs、quick apps、search action 候选
- 排序候选
- 执行默认动作

建议拆分：

- `classifyInput.ts`
  - 判断输入更像 URL、域名还是普通搜索词
- `matchOpenTabs.ts`
  - 用输入去匹配已打开 tab
- `rankCandidates.ts`
  - 统一排序 open tabs / quick apps / search action
- `search service`
  - 组织整个搜索流程

### 搜索模块的关键原则

- 候选分组是 UI 概念，不是排序概念
- 排序应先得到全局最佳候选，再做分组展示
- Enter 始终执行全局第一候选

---

## 2. Quick Apps 模块

职责：

- 读取和展示快捷入口
- 新增/编辑/删除/排序
- 打开目标 URL
- 处理 favicon 回退逻辑

建议拆分：

- `QuickAppsRepository`
  - 读写本地 quick apps 数据
- `buildQuickAppIcon.ts`
  - 决定图标 URL 或默认图标
- `quick-apps service`
  - 封装增删改排逻辑

### v1 Quick Apps 原则

- 数据结构尽量简单
- 不做分组
- 不做复杂权限和分享
- 不做远程同步

---

## 3. Tabs 模块

职责：

- 读取当前打开 tab
- 过滤真实网页 tab
- 域名分组
- landing pages 特殊分组
- 重复 tab 检测
- 单个关闭 / 整组关闭 / 去重 / 聚焦

建议拆分：

- `TabGateway`
  - 封装 `chrome.tabs` 操作
- `groupTabs.ts`
  - 纯函数：分组逻辑
- `normalizeUrl.ts`
  - 纯函数：URL 归一化
- `tabs service`
  - 把 browser 数据转成 UI 可消费结构

### 为什么这块要重点纯函数化

因为这部分最容易越写越乱。

尤其这些规则会越来越多：

- localhost 处理
- homepages 处理
- 重复项定义
- 自定义分组规则

如果不尽早抽纯函数，后面会很难维护。

---

## 4. Settings 模块

职责：

- 搜索引擎偏好
- 未来布局偏好
- 未来自定义规则

v1 只需要轻量实现，但应该独立出来，不要和 Quick Apps / Search 混写。

---

## 数据模型建议

## 1. QuickApp

```ts
export interface QuickApp {
  id: string;
  name: string;
  url: string;
  iconMode: 'favicon' | 'default';
  iconUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

说明：

- v1 虽然不支持自定义图标，但 `iconMode` 先留好
- `sortOrder` 保证排序稳定
- `createdAt/updatedAt` 为未来同步做准备

---

## 2. SearchEngineSetting

```ts
export interface SearchEngineSetting {
  defaultEngine: 'google' | 'bing' | 'duckduckgo';
}
```

后续如果想扩展到自定义模板再升级。

---

## 3. SearchCandidate

```ts
export type SearchCandidateType = 'open-tab' | 'quick-app' | 'search-action';

export interface SearchCandidate {
  id: string;
  type: SearchCandidateType;
  title: string;
  subtitle?: string;
  score: number;
  group: 'Open Tabs' | 'Quick Apps' | 'Search';
  payload: unknown;
}
```

说明：

- `group` 仅用于 UI 分组显示
- `score` 决定全局排序

---

## 4. TabEntity

```ts
export interface TabEntity {
  id: number;
  windowId: number;
  title: string;
  url: string;
  active: boolean;
  hostname: string;
  normalizedUrl: string;
}
```

这里建议把 `hostname` 和 `normalizedUrl` 作为转换后的字段，避免每次重复解析。

---

## 5. StorageSchema

```ts
export interface StorageSchema {
  quickApps: QuickApp[];
  settings: SearchEngineSetting;
}
```

v1 可以很小，但应该有统一入口。

---

## Repository / Gateway 边界

这是后面可维护性的关键。

### 建议定义这些接口

```ts
export interface QuickAppsRepository {
  list(): Promise<QuickApp[]>;
  create(input: Omit<QuickApp, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickApp>;
  update(id: string, patch: Partial<QuickApp>): Promise<QuickApp>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<SearchEngineSetting>;
  update(patch: Partial<SearchEngineSetting>): Promise<SearchEngineSetting>;
}

export interface TabGateway {
  listOpenTabs(): Promise<TabEntity[]>;
  focusTab(tabId: number, windowId: number): Promise<void>;
  openUrl(url: string): Promise<void>;
  closeTab(tabId: number): Promise<void>;
  closeTabs(tabIds: number[]): Promise<void>;
}
```

### 价值

这样未来切换实现时不需要动 UI：

- `chrome.storage.local` → remote API
- `chrome.tabs` → 同一套调用接口

---

## 本地存储策略

### v1 使用
- `chrome.storage.local`

### 存什么
- quick apps
- settings

### 不存什么
- open tabs 实时状态
- 搜索候选缓存（初版没必要）

### 为什么
open tabs 是运行时数据，应该每次实时读取，而不是持久化。

---

## favicon 策略

v1 采用简单方案：

1. 根据 quick app URL 推导 favicon 地址
2. 尝试加载 favicon
3. 失败则显示默认占位图标

### 注意
如果你使用第三方 favicon 服务，产品叙事上就不是绝对纯本地。
如果你想尽量克制，可以优先考虑：

- 直接尝试站点常见 favicon 路径
- 或接受 v1 用浏览器可访问 favicon 方案，后续再优化

这里实现可以先保持简单，不要过早复杂化。

---

## 搜索执行流建议

```text
用户输入
  -> classifyInput
  -> 拉取 open tabs
  -> 匹配 open tabs
  -> 读取 quick apps
  -> 生成 quick apps 候选
  -> 生成 search action
  -> rankCandidates
  -> UI 分组展示
  -> Enter 执行 score 最高候选
```

这个流程里最关键的是：

- 排序在前
- 分组展示在后

---

## 测试建议

v1 不需要一上来就做很多 E2E，但至少要测纯逻辑。

### 必测的纯函数

- `classifyInput`
- `normalizeUrl`
- `matchOpenTabs`
- `groupTabs`
- `rankCandidates`

### 为什么
这些规则一旦复杂，bug 会集中在这里。
而这些函数都很适合用 Vitest 做低成本测试。

---

## 背景脚本建议

建议保留一个轻量 background：

职责可以只有：

- badge 数量更新
- 未来需要时处理扩展生命周期事件

不要把业务逻辑塞进 background。
主业务仍然应在 new tab 页面完成。

---

## 为未来同步预留什么

虽然 v1 不做服务化，但建议预留这些点：

### 1. Repository 抽象
从一开始就不要让组件依赖 `chrome.storage.local`。

### 2. 数据字段
QuickApp 带：

- `id`
- `createdAt`
- `updatedAt`

### 3. 冲突敏感范围
未来最可能同步的是：

- quick apps
- settings

不是 open tabs。

---

## 不建议 v1 做的工程复杂化

以下这些先不要：

- 过早引入复杂状态机
- 过早抽象成插件系统
- 过早支持多种存储后端并行运行
- 过早实现离线同步队列
- 过早引入重型 UI 框架

v1 的目标不是“架构炫技”，而是：

> 结构清晰，规则可测，替换成本低。

---

## 推荐实施顺序

1. 搭扩展工程骨架（Vue 3 + TS + Vite + MV3）
2. 先做 Tabs 模块（最核心）
3. 做 Search 模块
4. 做 Quick Apps 模块
5. 做 Settings（搜索引擎切换）
6. 补纯函数测试
7. 最后做视觉 polish

---

## 一句话架构原则

> 用 Vue 管界面，用 service/repository 隔离浏览器能力，用纯函数承载规则。
