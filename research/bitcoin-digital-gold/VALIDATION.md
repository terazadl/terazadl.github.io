# Notebook 03 validation report

## Overall assessment: Share with caveats

The first draft is suitable for an exploratory GitHub portfolio project. It
executes top-to-bottom, the headline calculations have been independently
recomputed, and the conclusion distinguishes long-horizon appreciation from
gold-like defensive behavior.

It should not be presented as a definitive answer about Bitcoin's intrinsic or
monetary properties. The evidence supports a narrower statement about observed
USD market behavior from 2015 through July 2026.

## Question and methodology

The notebook tests whether Bitcoin behaved like gold along five dimensions:

1. rolling inflation-adjusted holding-period returns;
2. monthly sensitivity to an explicit inflation-shock proxy;
3. performance on the worst 5% of SPY trading days;
4. rolling correlation and standardized factor similarity versus GLD and QQQ;
5. historical portfolio behavior under comparable sleeve risk budgets.

The daily sample contains 2,906 returns on shared BTC, SPY, QQQ, and GLD
trading dates from 5 January 2015 through 27 July 2026. Monthly macro tests
contain 136 complete observations from February 2015 through June 2026.

## Data-quality assessment

- Market columns are present, positive where observed, sorted, and free of
  duplicate dates.
- VIX coverage is complete on all shared daily-return dates.
- The latest local macro observations are:
  - CPI: June 2026;
  - 10-year real yield: 27 July 2026;
  - broad dollar index: 24 July 2026.
- CPI is aligned at month-end before joining to returns. Daily macro series are
  reduced to month-end observations before differencing.
- Weekend BTC observations are excluded from daily cross-asset return tests,
  rather than being forward-filled.
- Raw snapshots are fixed locally for reproducibility and excluded from Git.

The main source limitation is quality rather than missingness: Yahoo Finance is
convenient but not institutional-grade, and daily BTC and ETF closing
conventions do not represent perfectly synchronized return intervals.

## Independent calculation spot-checks

Run:

```bash
python scripts/validate_digital_gold_analysis.py
```

Verified results:

- BTC annualized volatility: **66.00%**
- GLD annualized volatility: **16.08%**
- BTC maximum drawdown: **-83.04%**
- Positive BTC rolling five-year real-return windows: **98.70%**
- BTC inflation-shock coefficient: **+0.564 percentage points**
- Independent Newey-West interval for the same coefficient:
  **[-2.017, +3.144] percentage points**
- BTC mean return on the worst 5% of SPY days: **-2.608%**
- GLD mean return on those days: **+0.124%**
- BTC stress beta to SPY: **1.657**
- Median 24-month correlation:
  - BTC–GLD: **0.131**
  - BTC–QQQ: **0.339**
- Share of rolling windows in which BTC correlation was closer to GLD:
  **26.96%**
- Median lagged BTC sleeve weight: **1.846%**
- Portfolio Sharpe ratios:
  - SPY: **0.868**
  - 10% GLD sleeve: **0.944**
  - risk-matched BTC sleeve: **0.877**

The first valid BTC sleeve weight was separately reconstructed from the prior
36 monthly observations. This confirms that the one-month shift prevents
current-month volatility from entering the current-month weight.

## Issues found and treatment

1. **Medium — Inflation expectation is only proxied.** Monthly CPI inflation
   minus its lagged trailing mean is transparent but is not a professional
   survey-based inflation surprise. The notebook labels the result
   "inconclusive" and does not interpret it as proof that BTC can or cannot
   hedge every type of inflation.
2. **Medium — The sample is short and regime-dependent.** Bitcoin's history
   spans large changes in liquidity, market access, monetary policy, and
   investor composition. Rolling results are shown so the full-sample average
   is not treated as stable.
3. **Medium — Stress inference is descriptive.** Worst-SPY-day observations are
   selected mechanically, but the event bootstrap does not fully model
   volatility clustering. The conclusion is confined to the observed sample.
4. **Low — GLD is a proxy.** It reflects an investable gold exposure and fund
   costs, not physical bullion ownership.
5. **Low — Initial chart labels and titles needed revision.** Error-bar labels
   were explicitly anchored, zero lines were changed to neutral styling, and
   chart titles and captions now identify the plotted metric, date range, and
   uncertainty method.

## Visual review

- Time-series charts contain more than 100 monthly windows and use labeled zero
  references where interpretation depends on sign.
- Inflation and safe-haven charts show point estimates and uncertainty
  intervals rather than point estimates alone.
- Small multiples give BTC, GLD, and QQQ separate real-return scales, avoiding
  compression of the lower-volatility assets.
- The portfolio chart uses two non-neutral colors plus black, with no dual axis
  or truncated categorical scale.
- The factor heatmap uses a symmetric -1 to +1 scale and prints exact
  coefficients in every cell.

## Required caveats when sharing

- Historical appreciation is not the same as safe-haven behavior.
- A positive five-year real return can coexist with an extreme interim
  drawdown.
- Monthly inflation sensitivity may differ from long-horizon inflation
  protection.
- Correlation and regression do not establish causality.
- The portfolio comparison excludes fees, taxes, slippage, and custody costs.
- This is educational research, not investment advice.
