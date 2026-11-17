# LLM Voice Lab

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

- **Live App:** https://dannypratama.github.io/llm-voicelabs/
- **Repository:** https://github.com/dannypratama/llm-voicelabs

**LLM Voice Lab** is a zero-build static web app built for [Pollinations Quest #19180 (The LLM Voice)](https://github.com/pollinations/pollinations/issues/19180). It combines an instant, **0-Pollen browser-side forensic X-Ray** with an optional **Bring Your Own Pollen (BYOP)** voice humanizer powered by `gen.pollinations.ai`.

## What It Does

1. **0-Pollen Forensic X-Ray (100% Local in Browser):**
   - Computes an **LLM Voice Score (0–100)** as you type or switch presets—no API call required.
   - Highlights 5 structural tells inline: **slop clichés** (*delve, tapestry, crucial, foster, seamlessly*), **contrast frames** (*"not just X, it's Y"*), **triadic lists** (*"A, B, and C"*), **em-dash density**, and **throat-clearing openers** (*Importantly, Notably, Ultimately*).
   - Plots an **SVG Sentence Cadence Chart** showing word-count burstiness (coefficient of variation) so flat AI rhythm stands out against natural human prose.
2. **Optional BYOP Humanizer (Visitor's Own Pollen):**
   - Uses the official [`<polli-connect>`](https://github.com/pollinations/pollinations/blob/main/BRING_YOUR_OWN_POLLEN.md) drop-in OAuth flow (`@pollinations/ui`).
   - Calls `POST https://gen.pollinations.ai/v1/chat/completions` **only on manual button click**.
   - Guardrails: text-only, `1,200`-character input cap, `300`-token output cap, defaulting to lightweight `openai/gpt-5-nano` (`~0.0001 Pollen` per rewrite), then re-scores the rewrite locally at 0 extra Pollen.

## Setup & Free GitHub Pages Deploy

1. **Publishable App Key (`pk_...`):**
   - Configured in [`config.js`](./config.js) using a public Pollinations App Key (`pk_...`) from [`enter.pollinations.ai/keys?tab=app`](https://enter.pollinations.ai/keys?tab=app).
   - Registered Redirect URI: `https://dannypratama.github.io/llm-voicelabs/` (plus `http://localhost:4173/` for local preview if needed).
   - **Never** commit any private `sk_...` secret key or `.env` credentials.
2. **Hosted on GitHub Pages (Free):**
   - Pushed to `https://github.com/dannypratama/llm-voicelabs` on branch `main`.
   - In GitHub **Settings → Pages**, deploy from branch `main` root (`/`). All asset links use relative paths (`./`), so it works out of the box at `https://dannypratama.github.io/llm-voicelabs/`.

## Local Preview

```bash
npx serve .
# or
python -m http.server 4173
```

Then open `http://localhost:4173/`. The local X-Ray and presets work immediately at **0 Pollen**.

## Security & Privacy

- No secret keys (`sk_...`) are stored in this repository.
- User OAuth tokens issued via `<polli-connect>` remain in browser `sessionStorage` for the current tab only and are sent directly to `https://gen.pollinations.ai/v1/chat/completions`.
