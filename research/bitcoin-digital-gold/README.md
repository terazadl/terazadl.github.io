# Is Bitcoin Digital Gold?

> In which observable market dimensions, if any, has Bitcoin behaved like gold for a USD investor since 2015?

This reproducible research project separates the “digital gold” label into five
empirical questions:

1. rolling inflation-adjusted holding-period returns;
2. monthly sensitivity to an explicit inflation-shock proxy;
3. performance on the worst 5% of SPY trading days;
4. rolling correlation and standardized factor similarity versus GLD and QQQ;
5. historical portfolio behavior under comparable sleeve risk budgets.

## Main result

Bitcoin produced strong retrospective purchasing-power growth, but the sample
does not show consistent gold-like defensive behavior. Inflation sensitivity is
inconclusive; Bitcoin losses were material during equity stress; and its rolling
market relationship was usually closer to QQQ than GLD.

This is a conditional statement about observed USD market behavior from January
2015 through July 2026, not a universal claim about Bitcoin’s intrinsic or
monetary properties.

## Repository structure

```text
bitcoin-digital-gold/
├── README.md
├── VALIDATION.md
├── requirements.txt
├── notebooks/
│   └── 03_is_bitcoin_digital_gold.ipynb
├── scripts/
│   ├── build_digital_gold_notebook.py
│   └── validate_digital_gold_analysis.py
├── src/
│   └── btc_risk/
└── data/
    ├── raw/
    └── processed/
```

The committed notebook includes its executed outputs. Raw market and FRED data
are downloaded for the documented fixed date range when local snapshots are not
present.

## Reproduce

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/build_digital_gold_notebook.py
python -m jupyter nbconvert \
  --to notebook \
  --execute notebooks/03_is_bitcoin_digital_gold.ipynb \
  --output 03_is_bitcoin_digital_gold.ipynb
python scripts/validate_digital_gold_analysis.py
```

See [VALIDATION.md](VALIDATION.md) for independent calculation checks, data
quality notes, and the caveats that should accompany the results.

This repository is an educational research project, not investment advice.
