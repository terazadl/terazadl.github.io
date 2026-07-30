"""Regime and event-window helpers for BTC–equity co-movement research."""

from collections.abc import Mapping
from typing import Union

import numpy as np
import pandas as pd


def correlation_and_beta(
    returns: pd.DataFrame,
    asset: str = "BTC",
    benchmark: str = "QQQ",
) -> pd.Series:
    """Calculate same-period correlation and OLS slope without an intercept."""

    sample = returns[[asset, benchmark]].dropna().astype(float)
    if len(sample) < 3:
        raise ValueError("At least three paired returns are required.")
    benchmark_variance = sample[benchmark].var(ddof=1)
    if benchmark_variance <= 0:
        raise ValueError("Benchmark returns must have positive variance.")
    return pd.Series(
        {
            "observations": int(len(sample)),
            "correlation": float(sample[asset].corr(sample[benchmark])),
            "beta": float(
                sample[[asset, benchmark]].cov().loc[asset, benchmark]
                / benchmark_variance
            ),
            "asset_annualized_volatility": float(
                sample[asset].std(ddof=1) * np.sqrt(252)
            ),
        }
    )


def matched_event_windows(
    returns: pd.DataFrame,
    event_date: Union[str, pd.Timestamp],
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Return equal-observation windows immediately before and after an event."""

    event_timestamp = pd.Timestamp(event_date)
    post_event = returns.loc[returns.index >= event_timestamp].copy()
    if post_event.empty:
        raise ValueError("No observations exist on or after the event date.")
    pre_event = returns.loc[returns.index < event_timestamp].tail(len(post_event)).copy()
    if len(pre_event) != len(post_event):
        raise ValueError("The pre-event history is too short for a matched window.")
    return pre_event, post_event


def rolling_beta(
    returns: pd.DataFrame,
    asset: str = "BTC",
    benchmark: str = "QQQ",
    window: int = 90,
) -> pd.Series:
    """Calculate a rolling covariance-to-variance beta."""

    if window < 3:
        raise ValueError("Rolling window must contain at least three observations.")
    sample = returns[[asset, benchmark]].dropna().astype(float)
    rolling_covariance = sample[asset].rolling(window).cov(sample[benchmark])
    rolling_variance = sample[benchmark].rolling(window).var()
    return rolling_covariance.div(rolling_variance).rename(
        f"{asset} beta to {benchmark}"
    )


def regime_statistics(
    returns: pd.DataFrame,
    masks: Mapping[str, pd.Series],
    asset: str = "BTC",
    benchmark: str = "QQQ",
) -> pd.DataFrame:
    """Summarize co-movement for named boolean regimes."""

    rows = []
    for regime, mask in masks.items():
        aligned_mask = mask.reindex(returns.index).fillna(False).astype(bool)
        statistics = correlation_and_beta(
            returns.loc[aligned_mask],
            asset=asset,
            benchmark=benchmark,
        )
        rows.append({"regime": regime, **statistics.to_dict()})
    return pd.DataFrame(rows).set_index("regime")


def _moving_block_sample(
    values: np.ndarray,
    rng: np.random.Generator,
    block_size: int,
) -> np.ndarray:
    """Resample paired rows in contiguous blocks and preserve sample length."""

    observations = len(values)
    if block_size < 1 or block_size > observations:
        raise ValueError("Block size must be between 1 and the sample length.")
    block_count = int(np.ceil(observations / block_size))
    starts = rng.integers(0, observations - block_size + 1, size=block_count)
    sampled = np.concatenate(
        [values[start : start + block_size] for start in starts],
        axis=0,
    )
    return sampled[:observations]


def block_bootstrap_correlation_difference(
    pre_event: pd.DataFrame,
    post_event: pd.DataFrame,
    asset: str = "BTC",
    benchmark: str = "QQQ",
    block_size: int = 20,
    simulations: int = 2_000,
    seed: int = 7,
) -> pd.Series:
    """Estimate uncertainty around post-minus-pre correlation with block resampling."""

    if simulations < 100:
        raise ValueError("Use at least 100 bootstrap simulations.")
    pre_values = pre_event[[asset, benchmark]].dropna().to_numpy(dtype=float)
    post_values = post_event[[asset, benchmark]].dropna().to_numpy(dtype=float)
    if min(len(pre_values), len(post_values)) < block_size:
        raise ValueError("Each event window must be at least one block long.")

    observed_pre = float(np.corrcoef(pre_values, rowvar=False)[0, 1])
    observed_post = float(np.corrcoef(post_values, rowvar=False)[0, 1])
    rng = np.random.default_rng(seed)
    differences = np.empty(simulations)

    for simulation in range(simulations):
        sampled_pre = _moving_block_sample(pre_values, rng, block_size)
        sampled_post = _moving_block_sample(post_values, rng, block_size)
        pre_correlation = np.corrcoef(sampled_pre, rowvar=False)[0, 1]
        post_correlation = np.corrcoef(sampled_post, rowvar=False)[0, 1]
        differences[simulation] = post_correlation - pre_correlation

    lower, upper = np.quantile(differences, [0.025, 0.975])
    return pd.Series(
        {
            "pre_event_correlation": observed_pre,
            "post_event_correlation": observed_post,
            "post_minus_pre": observed_post - observed_pre,
            "bootstrap_ci_2.5%": float(lower),
            "bootstrap_ci_97.5%": float(upper),
            "block_size": int(block_size),
            "simulations": int(simulations),
        }
    )
