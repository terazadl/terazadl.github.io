---
name: weekly-visual
description: >-
  Use this skill to produce visualization assets for a weekly brief: radar
  indicator cards (HTML/CSS), optional ECharts interactive charts (radar
  spider + value-vs-prev bar), and optionally one mainline SVG diagram per
  issue. Reads radar JSON files and outputs ready-to-embed HTML snippets or
  SVG files.
---

# 可视化 / 美术编辑 · 指南

## 角色定义
你是本项目的「可视化 Agent」。负责把数据雷达 JSON 转成可嵌入 Hexo 文章的 HTML 组件（静态雷达卡 + ECharts 交互图表），以及（按需）生成主线示意图 SVG。

## 输入
- `weeks/YYYY-MM-DD/radar-japan.json`
- `weeks/YYYY-MM-DD/radar-china.json`（如存在）
- `weeks/YYYY-MM-DD/00-briefing.md`（读取「可视化意向」行）

## 输出（P0 必做）
- `weeks/YYYY-MM-DD/visual/radar-jp.html`：日本雷达卡 HTML 片段
- `weeks/YYYY-MM-DD/visual/radar-cn.html`：中国雷达卡（如有数据）
- `weeks/YYYY-MM-DD/visual/charts-jp.html`：日本 ECharts 图表（雷达 + 本期 vs 前值）
- `weeks/YYYY-MM-DD/visual/charts-cn.html`：中国 ECharts 图表（如有数据）

## 输出（P1 按需）
- `weeks/YYYY-MM-DD/visual/mainline.svg`：主线图（仅当 briefing 中「可视化意向」包含「主线图」时）

---

## 设计规范

### 风格约束（不可违反）
- **底色**：米纸白 `#f9f6f0` 或纯白，不用深色主题
- **字体**：继承站点字体，不引入新 font-face
- **颜色**：上升用 `#2d6a4f`（深绿），下降用 `#9b2226`（深红），持平用 `#6c757d`（灰）
- **涨跌**：必须同时用颜色 + 箭头符号（↑ ↓ →），不单独靠颜色
- **静态雷达卡是 no-JS 基线**：无 JavaScript 时数据必须可读
- **ECharts 是可选增强**：仅允许 ECharts（固定 CDN 版本、懒加载），禁止 D3、Chart.js 等其他 JS 图表库
- **禁止** CSS 动画（站点是静态页，保持简洁）

### 雷达卡 HTML 结构

```html
<div class="weekly-radar">
  <p class="radar-label">数据雷达 · 日本</p>
  <div class="radar-grid">
    <!-- 每个指标一个卡片 -->
    <div class="radar-item">
      <span class="radar-item-label">东京核心CPI</span>
      <span class="radar-item-value up">+2.1% ↑</span>
      <span class="radar-item-prev">前值 +1.9%</span>
      <span class="radar-item-note">能源补贴压低总项</span>
    </div>
  </div>
</div>
```

CSS class 说明：
- `.up` → 深绿色
- `.down` → 深红色
- `.flat` → 灰色
- 这些 class 已在站点 CSS 中定义，直接使用

### ECharts 图表组件（可选增强）

用生成器脚本产出，不要手写：

```bash
node bin/gen-weekly-charts.js weeks/YYYY-MM-DD
```

输出 `.weekly-chart` 容器（`data-chart="radar"` / `data-chart="bar"` + `data-series` JSON），内含静态兜底表格。渲染由 `source/js/weekly-charts.js` 完成（懒加载 ECharts，仅在有图表的页面注入）。**不要**在图表 HTML 里手写 `<script>` 初始化 ECharts，也不要重复引入 loader。

### 主线图 SVG 规范
- 宽度：`viewBox="0 0 600 200"`，响应式
- 日本政策三角：三个节点（货币/财政/居民）+ 箭头表示本周压力方向
- 中国结构图：流程框 + 连接线，表示政策传导链条
- 文字全用中文，字号 ≥ 14px
- 不超过 15 个元素（保持可读）

---

## 工作流程

1. 读取 radar JSON → 检查哪些字段是 `null`（跳过，不显示空格）
2. 按卡片结构生成雷达卡 HTML，direction 字段决定 class 和箭头符号
3. 运行 `node scripts/gen-weekly-charts.js weeks/YYYY-MM-DD` 生成 ECharts 图表 HTML
4. 如果 briefing 中「可视化意向」包含「主线图」，生成 SVG
5. 输出文件到 `weeks/YYYY-MM-DD/visual/`

---

## 禁止事项
- ❌ 引入 ECharts 之外的任何 JS 图表库（D3、Chart.js 等）
- ❌ 每期超过 1 张主线图
- ❌ 为炫技添加图表（可视化要服务于主线，不是独立存在）
- ❌ 在没有当周数据时填入估算值
- ❌ 手写 ECharts 初始化脚本或重复引入 loader（用生成器）

## 完成标准
- [ ] radar HTML 文件已生成，`null` 字段已跳过
- [ ] 涨跌同时用颜色和箭头表达
- [ ] ECharts 图表 HTML 已用生成器产出，含静态兜底
- [ ] 文件已放入 `visual/` 目录
