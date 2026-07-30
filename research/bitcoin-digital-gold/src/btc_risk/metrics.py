"""Risk, return, and portfolio calculations."""

from collections.abc import Mapping

import numpy as np
import pandas as pd


def _clean_returns(returns: pd.Series) -> pd.Series:
    clean = returns.dropna().astype(float)
    if clean.empty:
        raise ValueError("Return series has no valid observations.")
    if (clean <= -1).any():
        raise ValueError("Simple returns cannot be less than or equal to -100%.")
    return clean


def max_drawdown(returns: pd.Series) -> float:
    clean = _clean_returns(returns)
    wealth = (1 + clean).cumprod()
    drawdown = wealth.div(wealth.cummax()).sub(1)
    return float(drawdown.min())


def performance_summary(
    returns: pd.Series,
    periods_per_year: int,
) -> pd.Series:
    """Calculate a compact set of comparable performance and tail-risk metrics."""

    clean = _clean_returns(returns)
    growth = float((1 + clean).prod())
    years = clean.size / periods_per_year
    cagr = growth ** (1 / years) - 1 if growth > 0 and years > 0 else np.nan
    volatility = float(clean.std(ddof=1) * np.sqrt(periods_per_year))
    sharpe = (
        float(clean.mean() / clean.std(ddof=1) * np.sqrt(periods_per_year))
        if clean.std(ddof=1) > 0
        else np.nan
    )
    var_95 = float(clean.quantile(0.05))
    expected_shortfall_95 = float(clean.loc[clean <= var_95].mean())
    downside = clean.clip(upper=0)
    downside_deviation = float(
        np.sqrt(np.mean(np.square(downside))) * np.sqrt(periods_per_year)
    )

    return pd.Series(
        {
            "cagr": cagr,
            "annualized_volatility": volatility,
            "sharpe_rf_0": sharpe,
            "downside_deviation": downside_deviation,
            "max_drawdown": max_drawdown(clean),
            "var_95": var_95,
            "expected_shortfall_95": expected_shortfall_95,
            "positive_period_rate": float((clean > 0).mean()),
            "observations": int(clean.size),
        }
    )


def summary_table(
    returns: pd.DataFrame,
    periods_per_year: int,
) -> pd.DataFrame:
    summaries = {
        column: performance_summary(returns[column], periods_per_year)
        for column in returns.columns
    }
    return pd.DataFrame(summaries).T


def portfolio_returns(
    returns: pd.DataFrame,
    weights: Mapping[str, float],
) -> pd.Series:
    """Return the period returns of a portfolio rebalanced every observation."""

    weight_series = pd.Series(weights, dtype=float)
    if not np.isclose(weight_series.sum(), 1.0):
        raise ValueError("Portfolio weights must sum to 1.")
    missing_assets = sorted(set(weight_series.index) - set(returns.columns))
    if missing_assets:
        raise ValueError(f"Missing portfolio assets: {missing_assets}")
    return returns[weight_series.index].mul(weight_series, axis=1).sum(axis=1)
