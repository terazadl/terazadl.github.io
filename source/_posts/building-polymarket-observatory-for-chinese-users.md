---
title: Building a Read-Only Polymarket Observatory for Chinese Users
date: 2026-08-12 16:30:00
description: A small product case study in turning public prediction-market data into a clear, auditable, Beijing-time monitoring service without turning probabilities into false certainty.
categories:
  - AI & Industry
tags:
  - Polymarket
  - prediction markets
  - automation
  - Python
  - product design
lang: en
---

<span hidden data-article-language="EN"></span>

<div class="abstract">
  <span class="abstract-label">Abstract</span>
  Prediction markets can make an event’s implied odds visible, but a bare probability is often a poor notification product. I built Polymarket Observatory, a read-only monitor for Chinese-speaking users that screens public markets for quality, shows complete mutually exclusive outcomes, separates a market’s belief from the source that resolves the event, and sends a daily Beijing-time digest with restrained anomaly alerts. This note documents the product choices behind it—not as trading software, but as a small experiment in auditable information design.
</div>

![A sample Polymarket Observatory share card. It shows a Strait of Hormuz risk probability and the complete distribution for a Federal Reserve decision.](/images/event-radar-latest.png)

## The problem is not retrieving a number

Prediction-market pages are good at answering a narrow question: *what is the market pricing right now?* They are less good at the recurring task that many people actually have: *tell me when this event is worth paying attention to, without making me monitor a dashboard all day.*

That difference matters. A notification that says “the probability of a Federal Reserve rate cut is 2%” can be technically accurate yet cognitively misleading. The reader immediately asks: 2% compared with what? Is the market pricing no change? A hike? Does the contract have enough liquidity to trust its price? And, when the meeting ends, who determines the outcome?

I built **Polymarket Observatory** to make those questions explicit. It is a small, read-only monitoring system for Chinese-speaking users. It reads selected public Polymarket markets through the [Gamma API](https://docs.polymarket.com/api-reference/introduction), generates a Beijing-time daily briefing, and uses [ServerChan](https://sct.ftqq.com/docs/getting-started/faq/) to deliver concise WeChat notifications. Market selection is currently an explicit watchlist decision rather than an automatic discovery or ranking system.

The product is deliberately not a trading tool. It does not connect a wallet, request signatures, store an API trading credential, or place an order. The aim is much humbler: turn public market information into a calmer and more inspectable monitoring habit.

## Start with decisions, not with a dashboard

The first version tracks two very different kinds of event:

1. **Strait of Hormuz shipping risk.** The market asks whether traffic returns to normal before a stated deadline.
2. **The September 2026 FOMC decision.** The market represents several possible changes to the policy rate.

Those choices forced two useful product rules.

First, **a market price is an expectation, not an observed fact**. For Hormuz, the market provides the probability, while the relevant observed metric comes from [IMF PortWatch](https://portwatch.imf.org/), which uses AIS data to monitor ports and strategic maritime passages. For the Federal Reserve, Polymarket supplies the distribution before the meeting; the post-meeting [FOMC statement and calendar](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm) determine what actually happened.

Second, the interface must show **the full decision space**. The Fed message shows five mutually exclusive outcomes—cut by at least 50 basis points, cut 25 basis points, unchanged, hike 25 basis points, or hike by at least 50 basis points—and also groups them into cut / unchanged / hike. The components are normalized to a full 100% distribution after passing quality checks.

This is not cosmetic. A single outcome is easy to over-read as a recommendation or a forecast of certainty. A complete distribution lets the user see the uncertainty that is actually being priced.

## Market selection is a data-quality decision

“Use Polymarket data” is not specific enough. A subject can have multiple related contracts, and an apparently precise price can be based on a wide spread or thin liquidity. The system therefore does not treat every listed market as equally informative.

For every selected contract, the monitor reads the best bid and best ask when available, computes their midpoint, and checks event-level quality thresholds:

- minimum liquidity of US$50,000;
- maximum bid–ask spread of 5 percentage points;
- for a multi-outcome decision, a raw component total between 90% and 110% before normalization.

Liquidity and spread are aggregated across the component markets that make up an event. If order-book quotes are unavailable, the monitor falls back to the public outcome price; that is a degraded data path and should be treated as less informative than a quoted bid/ask midpoint. If a quality gate fails, the report says so rather than presenting a false sense of precision. That is particularly important for a public alert: users usually see the notification without the surrounding market page or order book.

The same principle explains why I did not simply combine every prediction market into a single headline number. A second venue can be useful as a validation signal when the contract definitions are genuinely comparable. But blindly averaging two markets hides differences in resolution rules, liquidity, user base, and timing. The observable product has one primary market source and names it. Cross-market comparison is a separate analytical exercise, not a way to manufacture confidence.

## Notifications should be rare enough to retain meaning

The runner is configured to be invoked every 15 minutes by an external scheduler, but it does not notify every 15 minutes. That would turn a probability feed into noise. Instead, it has two layers:

| Moment | What the user receives |
| --- | --- |
| 08:00 Beijing time | A complete daily digest: current probability or distribution, timestamp, source links, and the fact-resolution source. The internal report also records liquidity, spread, and data-quality reasons. |
| During the day | A short alert only when a material, confirmed condition occurs. |

The default immediate-alert conditions are a one-hour move of at least 5 percentage points, a 24-hour move of at least 10 points, a persistent crossing of 25%, 50%, or 75%, a persistent change in the leading outcome, a resolution-rule change, or market closure. Threshold crossings and leader changes require two consecutive samples. After an alert, the event enters a six-hour cooldown unless it moves another 5 points.

This design turns out to be less about clever thresholds than about respecting attention. The default statement is the morning digest; a real-time alert has to earn the interruption.

When an abnormal movement happens inside the morning window, it is folded into the daily digest instead of becoming a duplicate notification. The same result appears in the Markdown report, an HTML snapshot, and a portrait share card. That makes it easier to forward a result to a colleague without asking them to install the system.

## Localizing the operational details

The system runs on a computer in Japan, but its intended audience is in mainland China. That is why all customer-facing timestamps, digest schedules, and labels use **Beijing time (Asia/Shanghai)**, not the machine’s local time. A scheduler may run at 09:00 Japan time, for example, while the message correctly says 08:00 Beijing time.

The delivery channel is ServerChan, a service that can forward Markdown messages to WeChat. Its image support has one important practical constraint: images must live at a public URL rather than being embedded as local files or base64 data. The project can export an HTML page and a 1080×1350 PNG share card; public hosting and image links are optional configuration, and can be enabled separately from the read-only monitor. When enabled, the image URL is embedded in the daily message with a cache-busting timestamp. The result is both a notification and a linkable, visual snapshot.

The wording also stays careful. Each report labels the data source as Polymarket, includes a timestamp, distinguishes “market-implied probability” from “resolution source,” and carries a no-investment-advice disclaimer. Those are not legal decorations added at the end. They are the minimum context required for a probability to remain interpretable after it is forwarded.

## The implementation boundary is part of the product

The public repository contains the event watchlist, quality gates, notification logic, share-card export, and unit tests. It intentionally excludes runtime state, historical reports, exported data, and notification secrets. The test suite covers, among other things:

- normalization of mutually exclusive outcomes;
- confirmation before a threshold-crossing or leader-change alert;
- daily-digest timing in the Beijing-time window;
- a dry run that neither writes state nor sends a notification;
- the presence of data-source and disclaimer information in the public page.

These constraints make the project more reusable and more honest. Someone can inspect what is being monitored and why, run it in dry-run mode against live public data, and replace the events without inheriting my private data or credentials.

## What I learned

The most useful lesson from this project is that an automated monitor is partly an editorial system. It chooses which event deserves attention, which contract represents that event, which uncertainty has to remain visible, and what evidence resolves the question later.

The code is not complicated in the abstract. The more difficult work is refusing easy but misleading defaults: one-number reporting, raw prices without quality checks, instant alerts on every tick, timestamps in the operator’s timezone, and a probability label with no explanation of what would prove it right or wrong.

That is the standard I want this kind of tool to meet: read-only, source-linked, clear about uncertainty, and useful even to someone who never opens a prediction-market page.

The implementation is available in the public [event-probability-radar repository](https://github.com/terazadl/event-probability-radar). A live [Polymarket Observatory snapshot](https://terazadl.github.io/event-radar/) shows the current public output. It is an educational monitoring project, not investment or trading advice.
