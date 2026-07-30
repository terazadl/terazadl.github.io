"""Market-data loading and validation."""

from pathlib import Path

import pandas as pd
import yfinance as yf


TICKER_TO_ASSET = {
    "BTC-USD": "BTC",
    "SPY": "SPY",
    "QQQ": "QQQ",
    "GLD": "GLD",
    "^VIX": "VIX",
}
ASSET_COLUMNS = ["BTC", "SPY", "QQQ", "GLD"]
EXPECTED_COLUMNS = [*ASSET_COLUMNS, "VIX"]


def _validate_prices(prices: pd.DataFrame) -> None:
    missing_columns = sorted(set(EXPECTED_COLUMNS) - set(prices.columns))
    if missing_columns:
        raise ValueError(f"Missing expected columns: {missing_columns}")
    if prices.empty:
        raise ValueError("The market-price table is empty.")
    if not prices.index.is_monotonic_increasing:
        raise ValueError("Market-price dates are not sorted.")
    if prices.index.has_duplicates:
        raise ValueError("Market-price dates contain duplicates.")
    empty_columns = [column for column in EXPECTED_COLUMNS if prices[column].notna().sum() == 0]
    if empty_columns:
        raise ValueError(f"Columns contain no valid observations: {empty_columns}")
    if (prices[EXPECTED_COLUMNS].dropna() <= 0).any().any():
        raise ValueError("Market prices and VIX levels must be positive.")


def download_market_prices(start_date: str, end_date: str) -> pd.DataFrame:
    """Download adjusted closes from Yahoo Finance.

    `end_date` follows yfinance semantics and is exclusive.
    """

    downloaded = yf.download(
        tickers=list(TICKER_TO_ASSET),
        start=start_date,
        end=end_date,
        auto_adjust=True,
        actions=False,
        progress=False,
        group_by="column",
        threads=False,
        multi_level_index=True,
    )
    if downloaded.empty:
        raise RuntimeError("Yahoo Finance returned no observations.")
    if not isinstance(downloaded.columns, pd.MultiIndex):
        raise RuntimeError("Expected multi-level columns from yfinance.")
    if "Close" not in downloaded.columns.get_level_values(0):
        raise RuntimeError("Yahoo Finance response does not contain Close prices.")

    prices = downloaded["Close"].rename(columns=TICKER_TO_ASSET)
    prices.index = pd.to_datetime(prices.index).tz_localize(None)
    prices = prices.reindex(columns=EXPECTED_COLUMNS)
    prices = prices.sort_index().dropna(how="all")
    _validate_prices(prices)
    return prices


def load_market_prices(
    cache_path: Path,
    start_date: str,
    end_date: str,
    refresh: bool = False,
) -> pd.DataFrame:
    """Load a local snapshot when available; otherwise download and cache it."""

    cache_path = Path(cache_path)
    if cache_path.exists() and not refresh:
        prices = pd.read_csv(cache_path, parse_dates=["date"], index_col="date")
        prices = prices.reindex(columns=EXPECTED_COLUMNS)
        _validate_prices(prices)
        return prices

    yfinance_cache = cache_path.parent / ".yfinance-cache"
    yfinance_cache.mkdir(parents=True, exist_ok=True)
    yf.set_tz_cache_location(str(yfinance_cache))
    prices = download_market_prices(start_date=start_date, end_date=end_date)
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    prices.to_csv(cache_path, index_label="date")
    return prices


def market_data_quality(prices: pd.DataFrame) -> pd.DataFrame:
    """Return a compact, reader-facing coverage and missingness table."""

    rows = []
    for column in EXPECTED_COLUMNS:
        series = prices[column]
        observed = series.dropna()
        rows.append(
            {
                "asset": column,
                "first_observation": observed.index.min().date(),
                "last_observation": observed.index.max().date(),
                "observations": int(observed.size),
                "missing_values": int(series.isna().sum()),
                "missing_pct": float(series.isna().mean()),
            }
        )
    return pd.DataFrame(rows).set_index("asset")
