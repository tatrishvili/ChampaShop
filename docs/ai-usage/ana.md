# AI usage — Ana

| Date | Tool | What I asked | What I kept / modified / rejected, and why |
| ---- | ---- | ------------ | ------------------------------------------ |
| 2026-10-01 | Muse Spark (opencode) | Plan review of F4 promotions engine + file ownership to avoid conflicts | Kept the 8-scenario verification and the split (me: F2+F3+F4, teammate: F1+F5). Rejected case-sensitive category compare idea without normalization — added `.toLowerCase()` hardening later. |
| 2026-10-01 | Muse Spark (opencode) | Scaffold for cart store + product page respecting cookie 4Ko limit and SSR | Kept store shape (cookie stores only id+qty, details hydrated separately). Modified shipping-on-empty-cart: pure function returns 490, UI shows empty state with 0 shipping. |

> Rule: no tokens, passwords or `.env` content is ever pasted into an AI tool.
