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
    │   └── mainline.svg  ← W3：主线图（按需）
    ├── review-notes.md   ← W4：责任编辑审查报告
    └── FINAL/            ← W5：你终审通过后的定稿
        ├── china-weekly-YYYY-MM-DD.zh.md
        └── japan-weekly-YYYY-MM-DD.zh.md
```

## 00-briefing.md 模板

```markdown
# 本期简报 · YYYY-MM-DD

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
