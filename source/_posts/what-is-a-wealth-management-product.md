---
title: 你买的理财产品到底是什么
date: '2026-01-18 22:00:00'
updated: '2026-02-11 17:23:45'
slug: what-is-a-wealth-management-product
alias:
  - 2026/01/18/你买的理财产品到底是什么/index.html
description: 从资产负债表和现金流出发，解释中国银行理财产品的底层资产、估值规则、流动性约束，以及收益背后的反馈回路。
categories:
  - Money & Markets
tags:
  - 银行
lang: zh
abstract_en: true
---

<div class="abstract" lang="en">
<span class="abstract-label">English abstract</span>

Chinese bank wealth-management products are often treated as higher-yielding deposits, but economically they are something else: a share in a portfolio of assets governed by a detailed set of liquidity, valuation, and redemption rules. This essay follows the money from subscription to investment and eventual redemption. It explains how bonds, interbank certificates of deposit, money-market instruments, and occasional risk assets generate returns; why rising yields reduce bond prices; and how market-value versus amortized-cost accounting changes the way volatility appears to investors. Two Bank of China product documents are used to show how apparently similar products can differ in maturity, redemption timing, fees, valuation, and the right to suspend withdrawals. The 2022 drawdown is presented as a feedback loop in which rising yields weakened net asset values, redemptions forced bond sales, and those sales intensified further losses. Lower interest rates can support current valuations while simultaneously reducing future reinvestment income. The practical lesson is that “fixed income” does not mean principal protection. Before buying, investors should be able to identify the underlying assets, duration, valuation method, redemption rules, fees, and historical drawdown—and should treat a smooth return line as presentation, not proof that risk is absent.
</div>

近三年，随着利率进一步下行，理财产品的收益率也跟着一层层往下走。很多人会出现一种很微妙的心态：

**理财产品让人看不太懂也就算了，利息还越来越低，越发觉得索然无味。**

但这恰恰是问题所在：当收益变薄、波动变显眼，“看不懂”不再只是一个体验问题，而会直接变成一个决策问题——你会更频繁地在“赎回/再买/换产品”之间摇摆，而每一次摇摆，都可能踩在净值的低点或规则的坑上。

<!-- more -->

图1：净值变化截图

<img src="/images/%E5%87%80%E5%80%BC%E5%8F%98%E5%8C%96%E5%9B%BE.jpeg" style="max-width:100%;" alt="净值变化图" />

笔者最近在学习 Zoltan Pozsar 关于美国影子银行的一系列论文。他有个很厉害的切入：不从宏观数据出发（GDP、CPI、货币政策口号），而是从更底层、更可操作的角度——**资金到底从哪里来、经过谁、以什么形式停留、出了事会在哪里断**——去拆解一套金融体系的运作。

这一下提醒了我：笔者刚毕业时在银行做过理财客户经理，完整经历了2018年资管新规带来的理财产品范式转换。最常被客户问到的问题是“这笔理财不会亏吧”，笔者当时只能回答“要相信国有银行，还是非常重视声誉”，不是因为不想讲清楚，而是鄙视的笔者自己也缺少一张能够把理财产品讲清楚的“结构图”。

于是笔者这次尝试把那个一直说不太清楚的问题重新捡起来：**在信息不完全透明的前提下，我们究竟还能通过什么方式，去揭开理财产品的“面纱”？**

这就是这一系列文章的初衷：**用资金流向图，把你买的理财到底是什么，说得比你的理财经理还清楚。**

## **一、先说结论：理财不是“存款Plus”，是“一篮子资产 + 一套规则”**

很多人（包括一些理财经理）都在有意无意地模糊一件事：**理财 ≠ 存款的高息版本。**

你在银行买理财，本质上买到的是两样东西：一篮子底层资产 + 一套运作规则。

### **1）一篮子底层资产**

常见底层资产包括：债券（国债、地方债、政金债、企业债等）、同业存单、回购/逆回购等货币市场工具，以及少量基金、可转债、权益类资产（不同产品差异很大）。部分产品还可能涉及非标类资产（取决于产品类型与监管要求）。

关键点是：**这些资产不是静止的。它们会涨会跌，会受利率、信用与流动性影响。**

为了不空谈，本文只用两只不同形态的中国银行的产品说明书做对照：

- 样本A：封闭式固收类。存续期明确、不可提前赎回，到期一次性分配；资产端以固定收益与货币市场工具为主，规则边界内可能涉及非标。
- 样本B：开放式。日常可申赎、T+1到账、申赎价格为1元；固定收益资产采用摊余成本法估值，并设置大额赎回情形下的暂停赎回安排。

你会发现：说明书能告诉你“资产大类”“比例约束”“风险边界”，但不一定像公募基金那样定期披露到“前十大持仓”的颗粒度。同时，部分理财会发布运行报告/投资运作报告披露资产配置甚至前十大资产；只是披露频率与颗粒度差异很大，有的产品有、有的产品没有。

### **2）一套运作规则**

规则决定你“能不能动”“怎么动”“遇到事会不会被卡住”。通常包括：能否赎回（封闭/定开/开放）、到账节奏（T+0/T+1/到期后）、估值与净值呈现方式（市值/摊余成本/混合）、费用、巨额赎回与是否可暂停赎回、信息披露方式等。

把两只样本的关键规则直接摆出来更直观：

- 样本A：存续期 **102天**；存续期内不办理赎回；到期一次性分配，本金及收益到期后 **2个工作日内到账**（到期日至到账日不计息）。
- 样本B：日常可申赎；T日赎回通常 **T+1到账**；发生大额赎回等情形可暂停当日赎回，下一交易日再继续受理（并有受理时间窗口）。

最关键的认知转变是：你买的不是“银行的承诺”，而是**一份资产组合的份额**。管理人按规则管理资产；**收益与风险来自资产本身**。合同也会明确：非保本浮动收益型，最不利情况下可能收益为零甚至本金损失。

## **二、一张图看懂：你的钱经历了什么？（个人视角）**

图2：个人买入—运作—赎回资金流图

<img src="/images/%E7%90%86%E8%B4%A2%E4%BA%A7%E5%93%81%E6%8A%95%E5%85%A5%E8%B5%8E%E5%9B%9E%E5%85%A8%E6%B5%81%E7%A8%8B.png" style="display:block;max-width:100%;height:auto;" alt="理财产品投入赎回全流程" />

看到这里，恐怕很多读者会问：利率为什么会影响债券？债券又怎么影响理财净值？这两个问题不讲透，后面的“破净”“回撤”“赎回潮”都会像玄学。

## **三、利率为什么会影响债券？**

债券是一串“未来现金流”（利息 + 到期本金）。债券价格就是把未来现金流按折现率折回到今天。

- 利率/收益率上升 → 折现率更高 → 债券价格下降
- 利率/收益率下降 → 折现率更低 → 债券价格上升

类比也很直观：你手里一张年息3%的债，如果市场新债能给到4%，你这张就不香了，想卖出去就得打折；反过来市场只能给2%，你这张3%就会更值钱。

债券价格对利率的敏感度，用“久期”可以做一个常用近似：

> 债券价格变化（%）≈ -久期 × 收益率变化（百分点）

例：久期2年，收益率上升0.5个百分点（50bp），价格大约下跌≈1%。这就是为什么固收平时稳，但遇到“短时间利率上行很快”的阶段，净值会出现肉眼可见的回撤。

## **四、债券又是如何影响理财产品净值的？**

你买的是份额。份额值多少钱，取决于底层资产现在值多少钱，以及这些资产产生了多少利息收入。

为什么有的净值波动更明显、有的更平滑？关键在于波动如何呈现：

- 市值/公允价值呈现更直观：债券价格一跌，净值更快回撤；债券一涨，净值更快上行。
- 摊余成本/混合估值更平滑：不每天把价格波动“摊给你看”，收益按规则计提，曲线更顺。样本B属于典型。

但请记住：**曲线更平滑≠底层没有风险**。风险只是更多在需要兑现、需要变现、或者遇到流动性压力时暴露出来。

## **五、2022年那一次究竟发生了什么？**

那次“破净”更像一次机制演示：债券—赎回—被动卖出的反馈回路。

1）利率短时间快速上行，债券价格下跌；

2）理财净值/收益转弱；

3）投资者赎回上升（把理财当存款替代的心理被击穿）；

4）管理人卖出债券换现金，被动卖出压低价格，净值更承压，赎回更强，循环放大。

读者需要记住的重点是：当你买的是债券组合，最怕的不是慢慢跌，而是“短时间利率上行 + 集体赎回触发被动卖出”。开放式产品里“暂停赎回”等条款，本质上是为了打断这条反馈链。

## **六、再上一层：理财放进更大的“资金闭环”（体系视角）**

图3：理财资金闭环

<img src="/images/%E7%90%86%E8%B4%A2%E4%BA%A7%E5%93%81%E5%A4%A7%E8%A7%86%E8%A7%92.png" style="display:block;max-width:100%;height:auto;" alt="理财产品大视角" />

压力反馈回路：

<img src="/images/%E7%90%86%E8%B4%A2%E4%BA%A7%E5%93%81%E5%8E%8B%E5%8A%9B%E5%8F%8D%E9%A6%88%E5%9B%9E%E8%B7%AF.png" style="display:block;max-width:100%;height:auto;" alt="理财产品压力反馈回路" />

## **七、现在理财“利息低”又是什么链路？**

更真实的链路是：底层资产能提供的收益率整体下来了。

1）再投资链路：旧债到期后只能买到更低收益的新债，组合“可持续收益”下台阶；

2）利差链路：信用溢价变薄，额外收益减少；

3）费用链路：收益薄时，费用与浮动管理费机制更显眼。

## **八、给读者一个判断指标：存款利率下行对理财净值是正向还是负向？**

关键：存款利率下行对理财有两条相反方向的影响，要分短期与长期看。

一句话结论：**利率下行往往托一把当下净值，但也会压一截未来收益。**

<img src="/images/%E5%88%A9%E7%8E%87%E5%BD%B1%E5%93%8D%E5%AF%B9%E7%85%A7%E8%A1%A8.png" style="display:block;max-width:100%;height:auto;" alt="利率影响对照表" />

3分钟判断法：看利率趋势（国债/政金债收益率上还是下）、看久期与资产结构、看规则（开放/封闭、是否可能暂停赎回）。

## **九、你买之前最好知道的5件事**

1）风险等级是分类，不是保本承诺；

2）固收+里的“+”千差万别；

3）现金管理的流动性体验差很多；

4）费用都体现在净值/收益里；

5）7日年化不等于长期收益承诺。

## **十、常见误解对照表**

<img src="/images/%E5%B8%B8%E8%A7%81%E8%AF%AF%E8%A7%A3%E5%AF%B9%E7%85%A7%E8%A1%A8.png" style="display:block;max-width:100%;height:auto;" alt="常见误解对照表" />

## **十一、3分钟自测：你真的了解自己的理财吗？**

基础级：主要投什么？赎回几天到账？历史最大回撤多少？

进阶级：费用合计多少？估值方法是什么？是否含权益/可转债/信用下沉？

**如果基础级三题答不上来：先别加仓。**

## **十二、写在最后：理财的本质是理解**

很多人抱怨理财越来越低，以为是银行变抠门。但更真实的情况是：市场利率与资产收益率在变化，理财只是把这种变化传导给了你。

真正的理财不是找到一个“永远不会亏、收益还高”的产品（不存在），而是：搞清楚买的是什么，理解收益从哪里来，接受合理波动，不要在最低点用情绪做交易。

# **附录：用两份中行说明书演示如何在3分钟内找到6字段**

<img src="/images/6%E5%AD%97%E6%AE%B5%E5%BF%AB%E9%80%9F%E5%AE%9A%E4%BD%8D%E8%A1%A8.png" style="display:block;max-width:100%;height:auto;" alt="6字段快速定位表" />

------------------------------------------------------------------------
