# weeks/ · 期次袋目录

每期周报的工作文件放在以「该期截止日期」命名的子目录里。

## 目录结构

```
weeks/
└── YYYY-MM-DD/           ← 本期截止日（周日），如 2026-09-07
    ├── 00-briefing.md    ← W0：主编（你）拍板的 5 行
    ├── china.zh.draft.md ← W1：中国撰稿初稿
    ├── china.zh.flags.md ← W1：中国稿红旗清单
    ├── japan.zh.draft.md ← W1：日本撰稿初稿
    ├── compare.md        ← W2：中日对照表
    ├── brief.en.md       ← W2：英文 Executive Brief
    ├── radar-china.json  ← W1/W2：中国数据雷达
    ├── radar-japan.json  ← W1：日本数据雷达
    ├── visual/
    │   ├── radar-cn.html ← W3：中国雷达卡 HTML
    │   ├── radar-jp.html ← W3：日本雷达卡 HTML
    │   ├── charts-cn.html← W3：中国 ECharts 图表（生成器产出）
    │   ├── charts-jp.html← W3：日本 ECharts 图表（生成器产出）
    │   └── mainline.svg  ← W3：主线图（按需）
    ├── review-notes.md   ← W4：责任编辑审查报告
    └── FINAL/            ← W5：你终审通过后的定稿
        ├── china-weekly-YYYY-MM-DD.zh.md
        └── japan-weekly-YYYY-MM-DD.zh.md
```

## ECharts 交互图表

每期用生成器从 radar JSON 产出（不要手写）：

```bash
node bin/gen-weekly-charts.js weeks/YYYY-MM-DD
```

产出 `.weekly-chart` 容器（雷达蛛网 + 本期 vs 前值条形图），内含静态兜底表格。渲染由 `source/js/weekly-charts.js` 懒加载 ECharts 完成，仅在有图表的页面注入 loader；无 JS 时兜底表格保持可读。详见 `.agents/skills/weekly-visual/SKILL.md`。

## 00-briefing.md 模板

```markdown
# 本期简报 · YYYY-MM-DD

## 我的选题方向（来自财新阅读）
<!-- 你填这里。写你从财新读到的「问题意识和角度」，不是财新原文。
     Agent 用这些来定选题方向，然后自己找公开来源核验。-->

- 财新这期关注点：[你读到的核心问题，例如「财新在追地方债化解的执行落差」]
- 我想问的问题：[例如「这次清欠行动和2023年那次有什么不同？」]
- 需要 Agent 验证的方向：[例如「找统计局/财政部有没有公开的付款进度数据」]

（如果财新本期没有你想追的角度，写「无」即可，Agent 自行从公开源选题）

## 主编拍板（Agent 从这里开始读）

中国主线：[一句因果句，说清楚发生了什么 + 为什么]
日本主线：[一句因果句，对应政策三角哪条边在动]
对照一句：[中日共振或分化的核心张力]
本周三语策略：ZH全文×2 / EN brief / JA [日本:全文 | 中国:摘要]
可视化意向：仅雷达 / 雷达+主线图
```

## 规则

1. `FINAL/` 目录只有你终审通过后才创建
2. Agent 只写自己负责的文件，不覆盖他人的定稿
3. `FINAL/` 里的文件才能复制进 `source/_posts/`
4. 旧期次袋长期保留作为档案，不删除
