"""Independent spot checks for notebook 03."""

from pathlib import Path

import numpy as np
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MARKET_PATH = PROJECT_ROOT / "data" / "raw" / "market_prices_2015_2026.csv"
CPI_PATH = PROJECT_ROOT / "data" / "raw" / "fred_cpi_2014_2026.csv"
REAL_YIELD_PATH = (
    PROJECT_ROOT / "data" / "raw" / "fred_real_yield_2014_2026.csv"
)
DOLLAR_PATH = PROJECT_ROOT / "data" / "raw" / "fred_dollar_2014_2026.csv"


def read_fred(path: Path, column: str) -> pd.Series:
    frame = pd.read_csv(path, parse_dates=["observation_date"])
    values = pd.to_numeric(frame[column], errors="coerce")
    series = pd.Series(
        values.to_numpy(),
        index=pd.DatetimeIndex(frame["observation_date"]),
        name=column,
    ).dropna()
    assert series.index.is_monotonic_increasing
    assert not series.index.has_duplicates
    return series


def maximum_drawdown(returns: pd.Series) -> float:
    wealth = (1 + returns).cumprod()
    return float(wealth.div(wealth.cummax()).sub(1).min())


def annualized_sharpe(returns: pd.Series, periods_per_year: int) -> float:
    return float(
        returns.mean() / returns.std(ddof=1) * np.sqrt(periods_per_year)
    )


def newey_west_interval(
    y: np.ndarray,
    design: np.ndarray,
    coefficient_position: int,
    lags: int = 6,
) -> tuple[float, float, float]:
    """Return coefficient and a 95% Newey-West interval."""

    inverse_information = np.linalg.inv(design.T @ design)
    coefficients = inverse_information @ design.T @ y
    residuals = y - design @ coefficients

    score_covariance = np.zeros((design.shape[1], design.shape[1]))
    for time in range(len(y)):
        score = design[time] * residuals[time]
        score_covariance += np.outer(score, score)

    for lag in range(1, lags + 1):
        weight = 1 - lag / (lags + 1)
        lag_covariance = np.zeros_like(score_covariance)
        for time in range(lag, len(y)):
            current_score = design[time] * residuals[time]
            lagged_score = design[time - lag] * residuals[time - lag]
            lag_covariance += np.outer(current_score, lagged_score)
        score_covariance += weight * (lag_covariance + lag_covariance.T)

    covariance = inverse_information @ score_covariance @ inverse_information
    standard_error = float(np.sqrt(covariance[coefficient_position, coefficient_position]))
    estimate = float(coefficients[coefficient_position])
    return estimate, estimate - 1.96 * standard_error, estimate + 1.96 * standard_error


market = pd.read_csv(MARKET_PATH, parse_dates=["date"], index_col="date")
expected_columns = ["BTC", "SPY", "QQQ", "GLD", "VIX"]
assert market.columns.tolist() == expected_columns
assert market.index.is_monotonic_increasing
assert not market.index.has_duplicates
assert (market[expected_columns].dropna() > 0).all().all()

shared_prices = market[["BTC", "SPY", "QQQ", "GLD"]].dropna()
daily_returns = shared_prices.pct_change(fill_method=None).dropna()
assert len(shared_prices) == 2_907
assert len(daily_returns) == 2_906
assert daily_returns.index.min() == pd.Timestamp("2015-01-05")
assert daily_returns.index.max() == pd.Timestamp("2026-07-27")
assert market["VIX"].reindex(daily_returns.index).notna().all()

cpi = read_fred(CPI_PATH, "CPIAUCSL")
real_yield = read_fred(REAL_YIELD_PATH, "DFII10")
dollar = read_fred(DOLLAR_PATH, "DTWEXBGS")
assert cpi.index.max() == pd.Timestamp("2026-06-01")
assert real_yield.index.max() == pd.Timestamp("2026-07-27")
assert dollar.index.max() == pd.Timestamp("2026-07-24")
assert (cpi > 0).all()
assert (dollar > 0).all()
assert real_yield.between(-5, 10).all()

btc_volatility = daily_returns["BTC"].std(ddof=1) * np.sqrt(252)
gld_volatility = daily_returns["GLD"].std(ddof=1) * np.sqrt(252)
btc_drawdown = maximum_drawdown(daily_returns["BTC"])
assert np.isclose(btc_volatility, 0.6600, atol=0.0001)
assert np.isclose(gld_volatility, 0.1608, atol=0.0001)
assert np.isclose(btc_drawdown, -0.8304, atol=0.0001)

monthly_prices = shared_prices.resample("ME").last()
monthly_returns = monthly_prices.pct_change(fill_method=None)
cpi_monthly = cpi.copy()
cpi_monthly.index = cpi_monthly.index.to_period("M").to_timestamp("M")
monthly_inflation = cpi_monthly.pct_change(fill_method=None).rename(
    "monthly_inflation"
)
inflation_shock = (
    monthly_inflation
    - monthly_inflation.rolling(12, min_periods=12).mean().shift(1)
).rename("inflation_shock")
real_yield_change = (
    real_yield.resample("ME").last().diff().div(100).rename("real_yield_change")
)
dollar_return = (
    dollar.resample("ME").last().pct_change(fill_method=None).rename("dollar_return")
)

monthly_analysis = monthly_returns.join(
    pd.concat(
        [monthly_inflation, inflation_shock, real_yield_change, dollar_return],
        axis=1,
    ),
    how="inner",
).dropna()
assert len(monthly_analysis) == 136
assert monthly_analysis.index.min() == pd.Timestamp("2015-02-28")
assert monthly_analysis.index.max() == pd.Timestamp("2026-06-30")

real_monthly_returns = (
    (1 + monthly_returns[["BTC", "GLD", "QQQ"]])
    .div(1 + monthly_inflation, axis=0)
    .sub(1)
    .dropna()
)
btc_five_year_growth = (
    (1 + real_monthly_returns["BTC"])
    .rolling(60)
    .apply(np.prod, raw=True)
)
btc_positive_five_year_share = float((btc_five_year_growth.dropna() > 1).mean())
assert len(btc_five_year_growth.dropna()) == 77
assert np.isclose(btc_positive_five_year_share, 0.9870, atol=0.0001)

factor_names = ["SPY", "inflation_shock", "real_yield_change", "dollar_return"]
factor_frame = monthly_analysis[factor_names]
standardized_factors = (
    factor_frame - factor_frame.mean()
).div(factor_frame.std(ddof=1))
design = np.column_stack([np.ones(len(standardized_factors)), standardized_factors])
inflation_position = 1 + factor_names.index("inflation_shock")
btc_inflation_estimate, btc_inflation_lower, btc_inflation_upper = (
    newey_west_interval(
        monthly_analysis["BTC"].to_numpy(dtype=float),
        design,
        coefficient_position=inflation_position,
        lags=6,
    )
)
assert np.isclose(btc_inflation_estimate, 0.00564, atol=0.00001)
assert btc_inflation_lower < 0 < btc_inflation_upper

stress_cutoff = daily_returns["SPY"].quantile(0.05)
stress = daily_returns.loc[daily_returns["SPY"] <= stress_cutoff]
btc_stress_mean = float(stress["BTC"].mean())
gld_stress_mean = float(stress["GLD"].mean())
btc_stress_beta = float(
    stress[["BTC", "SPY"]].cov().loc["BTC", "SPY"]
    / stress["SPY"].var(ddof=1)
)
assert len(stress) == 146
assert np.isclose(btc_stress_mean, -0.02608, atol=0.00001)
assert np.isclose(gld_stress_mean, 0.00124, atol=0.00001)
assert np.isclose(btc_stress_beta, 1.6571, atol=0.0001)

rolling_similarity = pd.DataFrame({
    "BTC_GLD": monthly_returns["BTC"].rolling(24).corr(monthly_returns["GLD"]),
    "BTC_QQQ": monthly_returns["BTC"].rolling(24).corr(monthly_returns["QQQ"]),
}).dropna()
assert len(rolling_similarity) == 115
assert np.isclose(rolling_similarity["BTC_GLD"].median(), 0.131, atol=0.001)
assert np.isclose(rolling_similarity["BTC_QQQ"].median(), 0.339, atol=0.001)
assert np.isclose(
    (rolling_similarity["BTC_GLD"] > rolling_similarity["BTC_QQQ"]).mean(),
    0.26957,
    atol=0.0001,
)

portfolio_source = monthly_returns[["SPY", "GLD", "BTC"]].dropna()
btc_weight = (
    0.10
    * portfolio_source["GLD"].rolling(36).std()
    / portfolio_source["BTC"].rolling(36).std()
).clip(lower=0, upper=0.10).shift(1)
portfolio_returns = pd.DataFrame({
    "SPY": portfolio_source["SPY"],
    "GLD sleeve": 0.90 * portfolio_source["SPY"] + 0.10 * portfolio_source["GLD"],
    "BTC sleeve": (
        (1 - btc_weight) * portfolio_source["SPY"]
        + btc_weight * portfolio_source["BTC"]
    ),
}).dropna()
assert portfolio_returns.index.min() == pd.Timestamp("2018-02-28")
assert len(portfolio_returns) == 102

first_comparison_month = portfolio_returns.index[0]
first_position = portfolio_source.index.get_loc(first_comparison_month)
prior_history = portfolio_source.iloc[first_position - 36 : first_position]
independent_first_weight = (
    0.10
    * prior_history["GLD"].std(ddof=1)
    / prior_history["BTC"].std(ddof=1)
)
assert np.isclose(
    btc_weight.loc[first_comparison_month],
    independent_first_weight,
)
assert np.isclose(
    btc_weight.loc[portfolio_returns.index].median(),
    0.0184646,
    atol=0.0000001,
)

portfolio_sharpes = portfolio_returns.apply(
    annualized_sharpe,
    periods_per_year=12,
)
assert np.isclose(portfolio_sharpes["SPY"], 0.8681, atol=0.0001)
assert np.isclose(portfolio_sharpes["GLD sleeve"], 0.9435, atol=0.0001)
assert np.isclose(portfolio_sharpes["BTC sleeve"], 0.8774, atol=0.0001)

print("Notebook 03 validation checks passed.")
print(f"Shared daily returns: {len(daily_returns):,}")
print(f"Complete monthly macro observations: {len(monthly_analysis):,}")
print(
    "BTC inflation coefficient, Newey-West 95% interval: "
    f"{btc_inflation_estimate * 100:.3f}% "
    f"[{btc_inflation_lower * 100:.3f}%, {btc_inflation_upper * 100:.3f}%]"
)
print(f"BTC mean return on worst 5% SPY days: {btc_stress_mean * 100:.3f}%")
print(f"Median lagged BTC sleeve weight: {btc_weight.median() * 100:.3f}%")
