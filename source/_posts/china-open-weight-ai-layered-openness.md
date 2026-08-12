---
title: "中国 AI 开源模式能持续吗？从旗舰开放到分层开源"
date: 2026-07-27 00:14:30
updated: 2026-07-27 00:14:30
slug: china-open-weight-ai-layered-openness
alias:
  - 2026/07/27/中国 AI 开源模式能持续吗？从旗舰开放到分层开源/index.html
description: 中国的开放权重 AI 模式在产业层面具备持续性，但更可能形成分层开放的均衡，而不是永久开放每一个前沿模型。
categories:
  - AI & Industry
tags:
  - AI
  - 开放权重
  - 中国科技
  - 商业模式
  - AI 政策
lang: zh
abstract_en: true
---

<div class="abstract" lang="en">
<span class="abstract-label">English abstract</span>

China’s open-weight AI strategy can remain sustainable at the industry level even when individual model developers struggle to capture profits. Releasing weights lowers adoption costs, expands developer ecosystems, stimulates demand for chips and cloud services, and increases the international reach of Chinese technical stacks. Those benefits, however, accrue to different actors than the laboratories paying frontier-model training and inference costs. This creates a structural gap between private returns and ecosystem returns. The most plausible equilibrium is therefore not permanent, simultaneous release of every frontier model, but layered openness: smaller and mature models remain broadly available, while the newest frontier systems become API-first, delayed-release, partner-limited, or subject to capability-based controls. DeepSeek V4, Qwen3.6 and Kimi K3 illustrate different points on this spectrum, from same-day weight release to product-level segmentation and infrastructure-constrained availability. Open weights also shift value capture toward cloud platforms, chips, enterprise distribution, proprietary data, and execution workflows. The key question is no longer whether China will remain “open” or turn “closed,” but which capabilities will be opened, when, under what license, who can operate them efficiently, and who captures the resulting value.
</div>

过去一年，中国模型公司把“开放”变成了一种竞争方式：它不只是技术社区的价值选择，也是一套同时作用于开发者分发、云算力需求、产业标准和国际影响力的策略。

但这也带来一个更难的问题：当训练和推理成本继续上升，最强模型还有可能一直免费开放吗？

我的判断是：**中国 AI 的开放模式在产业层面可以持续，但长期形态更可能是“分层开放”，而不是所有公司永久、同步、无差别地开放最新旗舰模型。**

<!-- more -->

## 先把“开源”说清楚

中文讨论习惯把公开模型权重统称为“开源”，但更准确的词是**开放权重（open weights）**。

按照 Open Source Initiative 的定义，真正的开源 AI 不只有最终权重，还应包含足以研究、修改和重建系统的数据说明，以及完整的训练和运行代码。多数商业模型并没有走到这一步。它们公开的是可下载、可微调、可私有部署的权重，而不是生产下一代模型的全部方法。

这个区别很重要，因为它解释了一个看似矛盾的现象：

> 公司可以开放模型的“产品”，同时把训练配方、数据工程、后训练能力、推理系统和团队知识留在内部。

开放权重因此不是“放弃护城河”，而是重新决定护城河放在哪里。

## 可持续性其实是三个不同的问题

讨论“中国 AI 开源模式能否持续”时，至少要拆成三层。

### 第一层：对整个产业是否划算？

答案偏向肯定。

开放权重降低了开发者试用、企业部署和二次开发的门槛。模型公司未必直接收到钱，但由此增加的算力、云服务、数据中心、企业软件和终端集成需求，会在更长的价值链上创造收入。它还可能让海外开发者更早适配中国的模型架构、推理框架与接口习惯。

所以，产业层面的账并不等于模型公司的利润表：

> **产业回报 = 模型服务收入 + 算力与云需求 + 应用扩散 + 生产率收益 + 标准与生态影响力。**

只要这些外溢收益足够大，政府、云厂商和产业资本就有理由继续支持开放，即使模型层本身的利润率并不高。

这也与政策方向一致。国务院 2025 年的“人工智能+”意见同时提出建设面向全球的开源生态、发展“模型即服务”和“智能体即服务”，并壮大长期资本、耐心资本和战略资本。国家发改委 2026 年 7 月发布的行动计划则进一步提出共建国际开源社区、共享通用大模型和基础工具。

### 第二层：对单个模型公司是否划算？

答案取决于它能不能把开放带来的采用量变成收入。

开放权重本身通常不收费，模型公司需要从别处完成商业闭环：

- 官方 API 和托管推理；
- 企业私有部署、运维与安全服务；
- Coding Agent、办公 Agent 等高频产品；
- 云平台、手机、汽车和其他终端的集成；
- 数据、评测、工具链和开发者服务；
- 产业股东带来的渠道与战略协同。

企业层面的账更严苛：

> **企业回报 = API、订阅与企业服务收入 + 生态带来的间接收益 − 训练和推理成本 − 被开放替代的潜在收入。**

开放最危险的地方也在这里：模型很受欢迎，不代表模型公司一定能挣钱。用户可能把权重部署在第三方云上，应用公司可能拿走最终客户，低价竞争还会压缩 API 毛利。

真正需要验证的不是下载量，而是**开放是否能提高付费服务的转化、留存和单位经济性**。

### 第三层：最新、最强模型是否也会一直开放？

这一层最不确定。

追赶阶段的公司很适合用开放权重换开发者、品牌和分发；但当模型接近全球前沿，权重本身的商业与战略价值都会提高。企业会更想先通过 API 收回研发成本，监管者也会更关注网络、生物、军事等高风险能力的不可逆扩散。

因此，“中国会不会继续开放”不是一个简单的是非题。更可能出现的是按模型规模、发布时间、能力风险和使用地域划分的连续谱。

| 模型层级 | 更可能的开放方式 |
|---|---|
| 小模型、基础组件、推理工具 | 充分开放，降低生态使用门槛 |
| 成熟旗舰模型 | 开放权重，允许广泛商业使用 |
| 最新前沿模型 | API 优先、延迟开放，或先向合作伙伴提供 |
| 高风险能力模型 | 能力评估、地域限制或受控部署 |

这就是所谓的 **N-1 开放**：最新一代先商业化或受控提供，下一代出现后再开放上一代。

## 三个案例，三种位置

### DeepSeek V4：同步开放仍然可行

DeepSeek 在 2026 年 4 月发布 V4 Preview 时，同日上线了 API、技术报告和开放权重。这说明，当公司把竞争优势放在训练效率、推理系统和快速迭代上时，旗舰模型同步开放仍然可以成为主动战略，而不只是被迫让利。

但它能否长期成立，仍要看低价 API 的规模、推理成本以及下一代研发投入能否形成闭环。

### Qwen3.6：分层开放已经出现

Qwen 在推出 Qwen3.6-Plus 后，开放了更小、更易部署的 Qwen3.6-35B-A3B，并同时提供 API 和可下载权重。

这是一种很自然的产品分层：大模型承担前沿能力和商业服务，小模型承担开发者扩散、端侧适配和生态覆盖。开放与闭源并不是公司层面的二选一，而可以是同一产品组合里的不同层。

### Kimi K3：开放承诺与开放完成是两回事

Kimi K3 已经通过网页、Agent 产品和 API 提供服务。官方披露它有 2.8 万亿总参数，建议使用 64 张以上加速卡组成的 supernode 部署；发布后需求又一度逼近现有算力上限，月之暗面暂停了新订阅。

这组事实提醒我们：**权重开放不等于推理便宜，也不等于供给充足。** 模型越大，越可能把价值从“能否获得权重”转移到“谁能高效运行它”。

还要区分发布口径和已完成的事实。Kimi 官方博客写的是完整权重将在 2026 年 7 月 27 日前发布；截至本文发布时（7 月 27 日 00:14，日本时间），Moonshot AI 的官方 Hugging Face 账号尚未列出 K3 权重。因此，本文把 K3 记为“API 已上线、权重承诺待验证”，而不是已经完成开放权重发布。

## 谁会获得开放带来的价值？

| 参与者 | 主要收益 | 主要成本或风险 | 可持续条件 |
|---|---|---|---|
| 模型公司 | 品牌、开发者、使用量、企业线索 | 训练与推理成本，API 被替代 | 能把采用量转成服务收入 |
| 芯片、云与数据中心 | 推理需求与基础设施利用率 | 大额资本开支、价格竞争 | 使用量增长快于单位价格下降 |
| 应用与企业软件 | 更低模型成本、私有部署、可定制 | 集成、安全、评测与获客 | 掌握数据、工作流和客户关系 |
| 国家与产业体系 | 技术扩散、生产率、标准影响力 | 补贴、治理与安全风险 | 全产业收益高于支持成本 |

这张表也给出一个投资上的提醒：**开放模型越成功，收益越不一定留在模型公司。**

更容易获得价值的，可能是拥有算力、电力、云渠道、企业客户、私有数据和执行闭环的公司；更容易被挤压的，则是只靠高价 API、排行榜成绩或简单套壳维持毛利的公司。

## 我的基准情景

未来三年，我认为最可能出现的不是全面开放或全面闭源，而是以下组合：

1. 小模型、基础组件和推理工具继续广泛开放；
2. 成熟旗舰模型仍会发布权重，但与 API 首发之间的时间差扩大；
3. 最新前沿模型先以 API 和官方 Agent 形式商业化；
4. 许可证、地域和高风险能力评估变得更重要；
5. 真正的竞争焦点从“是否开放”转向“开放什么、何时开放、谁能运行、谁能变现”。

这个判断可以被证伪。如果主要中国实验室持续多年同步开放最新旗舰，而 API 与企业收入又足以覆盖研发，说明完全同步开放比我预期的更稳固；反过来，如果时间差持续扩大、许可证收紧，或前沿权重开始受地域限制，分层开放就从预测变成制度。

## 接下来值得跟踪的指标

- 最新旗舰的 API 日期与权重日期相差多少；
- 权重许可证是否允许商业使用，是否增加规模或地域条款；
- 官方 API 与第三方部署的能力、延迟和成本是否一致；
- API、Agent 和企业服务能否形成可重复收入；
- 高峰期推理容量是否仍成为产品增长瓶颈；
- 中国与海外是否出现正式的前沿模型分级或采购限制；
- 开放模型带来的价值最终流向模型、云、芯片还是应用公司。

## 结论

中国 AI 的开放模式并不需要每一家模型公司都获得高利润，才能在产业层面持续。只要开放能扩大算力需求、应用渗透和技术生态，它就仍然具有战略价值。

但这不意味着最新、最强的模型会永远同步、无差别地开放。随着能力、成本和安全价值同时上升，**小模型充分开放、成熟旗舰开放权重、最新前沿模型延迟或受控开放**，更像一个稳定的长期均衡。

所以，真正的问题已经不是“中国 AI 会不会开源”，而是：

> **开放的边界由谁决定，开放产生的价值又由谁拿走？**

## Sources

- [Open Source Initiative：The Open Source AI Definition 1.0](https://opensource.org/ai/open-source-ai-definition)
- [国务院：《关于深入实施“人工智能+”行动的意见》](https://www.mee.gov.cn/zcwj/gwywj/202508/t20250827_1126207.shtml)
- [国家发展改革委：《人工智能合作发展行动计划》](https://www.ndrc.gov.cn/fggz/202607/t20260717_1406573_ext.html)
- [外交部：《人工智能全球治理行动计划》](https://www.mfa.gov.cn/web/ziliao_674904/1179_674909/202507/t20250726_11677803.shtml)
- [DeepSeek：V4 Preview Release](https://api-docs.deepseek.com/news/news260424/)
- [Qwen：Qwen3.6-35B-A3B — Agentic Coding Power, Now Open to All](https://qwen.ai/blog?id=qwen3.6-35b-a3b)
- [Kimi：Kimi K3 Tech Blog](https://www.kimi.com/ja/blog/kimi-k3)
- [Moonshot AI on Hugging Face](https://huggingface.co/moonshotai)
- [AP：Kimi K3 demand exceeded available capacity](https://apnews.com/article/kimi-k3-china-ai-model-us-4c66a2e0f557ce79d3cc2d769c9a6226)
