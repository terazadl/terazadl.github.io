---
title: Is Bitcoin Digital Gold?
date: 2026-07-30 12:00:00
description: An empirical test of whether Bitcoin has behaved like gold in purchasing power, inflation sensitivity, equity stress, market resemblance, and portfolio use.
categories:
  - Money & Markets
tags:
  - Bitcoin
  - quantitative research
  - digital gold
lang: en
---

<span hidden data-article-language="EN"></span>

<div class="abstract">
  <span class="abstract-label">Abstract</span>
  Bitcoin produced exceptional long-horizon real returns from 2015 through July 2026, but its observed market behavior was not consistently gold-like. Its inflation sensitivity was statistically inconclusive, it lost heavily during the worst equity-market days, and its rolling return relationship was usually closer to QQQ than GLD. “Digital gold” is therefore more defensible as a scarcity and long-run appreciation narrative than as a description of defensive market behavior.
</div>

## 中文摘要

这份研究没有把“数字黄金”当成一句非真即假的口号，而是拆成五个可以检验的问题：购买力、通胀敏感性、股市压力期表现、与黄金或纳斯达克的相似度，以及在投资组合中能否替代黄金。

2015 年至 2026 年 7 月的数据表明，比特币的长期实际回报非常强，但它并没有稳定表现出黄金式的防御属性。通胀敏感性结论并不显著；在标普 500 表现最差的 5% 交易日里，比特币平均下跌 2.61%，而 GLD 平均上涨 0.12%；24 个月滚动相关性也通常更接近 QQQ，而不是 GLD。因此，“数字黄金”更适合描述稀缺性与长期升值叙事，不能直接等同于避险资产。

## Research design

The label “digital gold” contains several distinct claims. I test five:

1. **Purchasing power:** Were rolling three- and five-year inflation-adjusted returns positive?
2. **Inflation sensitivity:** Did Bitcoin respond positively to an explicit monthly inflation-shock proxy?
3. **Safe-haven behavior:** How did Bitcoin behave on the worst 5% of SPY trading days?
4. **Market resemblance:** Were Bitcoin’s rolling correlations and factor exposures closer to GLD or QQQ?
5. **Portfolio substitution:** Did a trailing-risk-matched Bitcoin sleeve behave like a 10% GLD allocation?

The daily sample contains 2,906 shared trading-day returns from 5 January 2015 through 27 July 2026. The monthly macro sample contains 136 complete observations through June 2026.

## 1. Long-run purchasing power was strong

Bitcoin’s retrospective purchasing-power result is the strongest evidence for the digital-gold narrative. In the sample, 98.7% of rolling five-year windows ended with a positive inflation-adjusted return.

![Rolling three- and five-year inflation-adjusted returns for Bitcoin, GLD, and QQQ](/images/digital-gold-real-returns.png)

That result needs an important qualification: a positive five-year endpoint can coexist with an extreme interim loss. Bitcoin’s annualized volatility was 66.0% and its maximum drawdown was −83.0%, versus 16.1% annualized volatility for GLD.

## 2. Inflation sensitivity was inconclusive

The monthly regression uses CPI inflation minus its lagged trailing mean as a transparent inflation-shock proxy, with controls for equities, real yields, and the US dollar.

![Estimated monthly asset sensitivity to the inflation-shock proxy with confidence intervals](/images/digital-gold-inflation-sensitivity.png)

Bitcoin’s estimated coefficient was positive, but the Newey–West 95% confidence interval included zero by a wide margin. This sample therefore does not establish that Bitcoin was a reliable short-horizon inflation hedge.

## 3. Bitcoin did not act as a safe haven during equity stress

On the worst 5% of SPY trading days, Bitcoin’s mean return was −2.61%; GLD’s was +0.12%. Bitcoin’s stress beta to SPY was 1.66.

![Bitcoin, GLD, and QQQ performance on the worst 5 percent of SPY trading days](/images/digital-gold-safe-haven.png)

This is the clearest rejection of a strong safe-haven interpretation. During the equity stress events observed in this sample, Bitcoin amplified rather than offset portfolio losses.

## 4. Its market fingerprint was closer to QQQ

The median 24-month rolling correlation was 0.131 for BTC–GLD and 0.339 for BTC–QQQ. Bitcoin was closer to GLD in only 27.0% of rolling windows.

![Bitcoin rolling correlations with GLD and QQQ](/images/digital-gold-rolling-similarity.png)

Standardized factor exposures tell a similar story: Bitcoin’s market fingerprint was not consistently gold-like.

![Standardized monthly factor exposures for Bitcoin, GLD, and QQQ](/images/digital-gold-factor-fingerprints.png)

## 5. A risk-matched Bitcoin sleeve was not a simple gold substitute

To avoid comparing an extremely volatile Bitcoin allocation with a much lower-risk gold allocation, the portfolio test scales the Bitcoin sleeve using trailing 36-month volatility and shifts the weight by one month. The median Bitcoin weight was only 1.85%.

![Growth of SPY, SPY with a 10 percent GLD sleeve, and SPY with a risk-matched Bitcoin sleeve](/images/digital-gold-risk-matched-portfolios.png)

The historical Sharpe ratios were 0.868 for SPY, 0.944 for the 10% GLD sleeve, and 0.877 for the risk-matched Bitcoin sleeve. This is descriptive evidence, not a forward-looking allocation recommendation.

## Verdict

The evidence supports a deliberately narrow conclusion:

- **Supported:** Bitcoin delivered exceptional long-horizon real appreciation over this sample.
- **Not established:** Bitcoin was a reliable short-horizon inflation hedge.
- **Not supported:** Bitcoin consistently protected investors during equity-market stress.
- **Mostly not supported:** Bitcoin behaved like gold in its rolling market relationships.

Calling Bitcoin “digital gold” may remain useful as a description of engineered scarcity, portability, and a monetary aspiration. It is much less accurate as a summary of how the asset actually traded between 2015 and July 2026.

The complete executed notebook, source code, and validation report are available in the [GitHub research folder](https://github.com/terazadl/terazadl.github.io/tree/hexo-src/research/bitcoin-digital-gold). This is educational research, not investment advice.
