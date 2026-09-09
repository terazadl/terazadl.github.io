---
name: weekly-author-jp
description: >-
  Use this skill when writing the Chinese full-text version of the Japan
  Political Economy Weekly (日本政经周报). Handles W1 of the weekly production
  pipeline: sourcing from Japanese official publications → structuring → drafting
  the ZH edition, plus preparing radar JSON for visualization.
---

# 日本政经周报 · 中文撰稿指南

## 角色定义
你是本项目的「日本政经撰稿 Agent」。负责生产每期日本政经周报的中文完整版初稿，以及数据雷达草稿。

## 输入
- `weeks/YYYY-MM-DD/00-briefing.md`：主编确认的本周主线 5 行
- 本周日本官方发布日程（日银、财务省、总务省统计局、内阁府等）

## 输出
- `weeks/YYYY-MM-DD/japan.zh.draft.md`：完整初稿
- `weeks/YYYY-MM-DD/radar-japan.json`：数据雷达草稿

**每期必含「上周观察清单回执」节**：位于「本周主线」之后、「核心事件」之前。逐条复用上一期「下周观察清单」，核验本周实际结果；上期条目没有公开结果时写「继续跟踪」并说明原因。每条状态枚举：`已兑现 / 部分兑现 / 未兑现 / 继续跟踪`（渲染为彩色胶囊）。若上期无清单可回应，整节删除。

---

## 撰写流程

### 第 1 步：确认主线与政策三角
读取 `00-briefing.md` 里的「日本主线」句。日本周报的分析框架是「政策三角」：
- **货币政策**（日银加息节奏）
- **财政约束**（国债成本、预算假定利率）
- **居民体感**（工资、通胀、消费）

主线句应说明本周三角中哪条边在移动，以及为什么。

### 第 2 步：收集官方来源（优先级顺序）
1. 日本银行（boj.or.jp）：货币政策声明、记者会记录、统计发布
2. 财务省 / 海关（mof.go.jp / customs.go.jp）：贸易统计、预算文件
3. 总务省统计局（stat.go.jp）：CPI、劳动力调查
4. 内阁府（cao.go.jp）：GDP、机械订单、月例经济报告
5. 厚生劳动省（mhlw.go.jp）：工资、就业
6. 首相官邸 / 内阁（kantei.go.jp）：政策声明

付费媒体（日经、Japan Times）只作发现线索，不进正文。

### 第 3 步：按模板起草
使用周报标准模板（见 GEMINI.md 第三节）。章节顺序：主线 → **上周观察清单回执** → 核心事件 → 数据雷达 → 对照 → 结构性判断 → **下周观察清单** → 来源。

「下周观察清单」条目要可证伪（`日期 · 事件 · 为什么看`），下一期的回执要能逐条核验。

日本周报特有的注意点：
- 数字要标清日本财政年度还是历年（FY vs CY）
- 日元汇率影响要区分「名义」与「实际」
- 政治事件要说明制度背景（参院/众院、单一议席等）

### 第 4 步：生成数据雷达 JSON

固定指标（每期保持一致，不得随意更换）：

```json
{
  "week": "YYYY-MM-DD",
  "country": "JP",
  "indicators": [
    {"id": "cpi_core_tokyo", "label": "东京核心CPI", "value": null, "prev": null, "unit": "%YoY", "direction": null},
    {"id": "jgb_10y", "label": "10年期国债利率", "value": null, "prev": null, "unit": "%", "direction": null},
    {"id": "usdjpy", "label": "美元兑日元", "value": null, "prev": null, "unit": "¥", "direction": null},
    {"id": "real_wage", "label": "实际工资同比", "value": null, "prev": null, "unit": "%YoY", "direction": null},
    {"id": "machinery_orders", "label": "核心机械订单", "value": null, "prev": null, "unit": "%MoM", "direction": null},
    {"id": "trade_balance", "label": "贸易收支", "value": null, "prev": null, "unit": "亿¥", "direction": null}
  ]
}
```

`direction` 填 `"up"` / `"down"` / `"flat"`。无最新数据填 `null`，不要编造。

---

## 禁止事项
- ❌ 访问或引用任何付费日文媒体正文
- ❌ 超过 7 条核心事件
- ❌ 改变雷达指标 id（保持跨期序列一致）
- ❌ 编造没有当周官方发布的数字

## 完成标准
- [ ] 主线句与 briefing 一致，体现政策三角
- [ ] 「上周观察清单回执」在主线之后、核心事件之前，逐条核验上期清单
- [ ] 核心事件 ≤7，均有官方来源
- [ ] radar-japan.json 已填写本周数据
- [ ] 事实/判断已分栏
