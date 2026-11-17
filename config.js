/**
 * LLM Voice Lab — Public App Configuration
 *
 * SECURITY:
 * - Never put a private secret key (`sk_...`) or server credentials here.
 * - `appKey` is the public Pollinations Publishable App Key (`pk_...`)
 *   created at https://enter.pollinations.ai/keys?tab=app.
 * - Visitors sign in via <polli-connect> (BYOP) and spend only their own Pollen.
 */
window.LLM_VOICE_LAB_CONFIG = Object.freeze({
  appName: "LLM Voice Lab",
  // Public Pollinations Publishable App Key (safe for client-side BYOP OAuth):
  appKey: "pk_q2tAiPj0TtjC8pq7",
  // Suggested BYOP consent-screen defaults (kept tiny to protect visitor Pollen):
  budget: 1,
  expiry: 7,
  permissions: "usage",
  // Text-only Pollinations endpoint:
  apiEndpoint: "https://gen.pollinations.ai/v1/chat/completions",
  // Strict Pollen guardrails:
  maxInputChars: 1200,
  maxOutputTokens: 300,
  defaultModel: "openai/gpt-5-nano",
  // Active healthy free-tier text models (rates per token in Pollen from /v1/models):
  models: [
    {
      id: "openai/gpt-5-nano",
      label: "GPT-5 Nano (openai-fast — default)",
      promptPollenPerToken: 0.0000000375,
      completionPollenPerToken: 0.0000003
    },
    {
      id: "nvidia/nemotron-3.5-lightning",
      label: "Nemotron 3.5 Lightning (ultra-low cost)",
      promptPollenPerToken: 0.000000045,
      completionPollenPerToken: 0.000000165
    },
    {
      id: "openai/gpt-oss-20b",
      label: "GPT-OSS 20B (open weight)",
      promptPollenPerToken: 0.00000005,
      completionPollenPerToken: 0.00000018
    }
  ]
});
