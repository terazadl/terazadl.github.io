---
title: "Why I Built This Probability Observatory"
description: How a $20 bet, a habit of checking market probabilities, and a few friends led me to build a simpler way to follow events.
slug: why-i-built-this-probability-observatory-en
categories:
  - AI & Industry
tags:
  - Polymarket
  - prediction markets
  - probability observatory
lang: en
---

I first heard of Polymarket (PM) during the U.S. presidential election in November 2024.

I put $20 on Kamala Harris. Trump had presented himself as friendly to crypto, but I strongly disliked some of his policies. The bet was more of a statement than an investment. I lost the $20. After Trump won, crypto assets rallied.

Since then, I have developed a habit: when a major event is unfolding, I check the probabilities on PM. I have followed the direction of Federal Reserve policy, the prospects for the CLARITY Act, and whether the Strait of Hormuz would reopen this way.

It takes me back to my first years at work. To understand an issue, I would read one long analysis after another. I did the same before the last presidential election, following polling analysis from all sides. Much of it was thoughtful, but I often finished with another list of “on the one hand, on the other hand.”

Prediction markets gave me another kind of information feed. Instead of spending hours reading carefully hedged arguments, I could start with one number: how likely do people who have put real money on the line think this event is? Nassim Taleb’s phrase *skin in the game* comes to mind. A judgment carries a different weight when the person making it bears a cost for being wrong. Bettors have more of that exposure than someone writing a report.

So I used vibe coding to make an alert for changes in PM event probabilities. I used Fangtang Qiqiu’s [ServerChan](https://sct.ftqq.com/docs/getting-started/sendkey/) to send updates through WeChat, with five free messages a day. But I soon realized that even this required too much setup. For friends who do not enjoy tinkering, the configuration itself is a barrier. Several friends were interested in these events, and accessing PM’s original site from mainland China was difficult for them. That is why I built [radar.fintech101.org](https://radar.fintech101.org/).

The site is not a complete copy of PM. I select a smaller set of events, mainly for people interested in finance. You can open it and see the probabilities and how they have changed, without setting up your own alert service.

If you would also like to read fewer long analyses and take a quick look at how the market is betting, I hope you will visit.
