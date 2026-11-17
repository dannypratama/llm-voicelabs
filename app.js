(() => {
  "use strict";

  const CFG = window.LLM_VOICE_LAB_CONFIG || {
    appKey: "YOUR_PUBLISHABLE_APP_KEY",
    budget: 1,
    expiry: 7,
    permissions: "usage",
    apiEndpoint: "https://gen.pollinations.ai/v1/chat/completions",
    maxInputChars: 1200,
    maxOutputTokens: 300,
    defaultModel: "openai/gpt-5-nano",
    models: [
      {
        id: "openai/gpt-5-nano",
        label: "GPT-5 Nano (openai-fast — default)",
        promptPollenPerToken: 0.0000000375,
        completionPollenPerToken: 0.0000003
      }
    ]
  };

  // Sample presets demonstrating high vs low LLM Voice scores (0 Pollen).
  const PRESETS = {
    corporate:
      "In today's fast-paced digital landscape, it's worth noting that modern teams must delve into holistic workflows—not merely to survive, but to truly thrive. This isn't just about automating tasks; it's about fostering a vibrant, seamless ecosystem of clarity, velocity, and resilience. Ultimately, adopting AI-native tooling serves as a crucial testament to an organization's commitment to unlocking unprecedented synergy across every realm.",
    linkedin:
      "Most founders think speed is about working harder. It's not about hustle—it's about alignment. Over the past quarter, I embarked on a journey to elevate our engineering cadence, and the results underscored a pivotal truth: great products require vision, discipline, and relentless focus. Importantly, when you seamlessly harness feedback loops, you turn uncertainty into a powerful game-changer.",
    tech:
      "Notably, the architecture leverages a cutting-edge, multifaceted pipeline designed to navigate the complexities of distributed inference. Rather than relying on brittle scripts, the runtime fosters deterministic execution, observability, and effortless scalability—ensuring teams can unlock robust performance without sacrificing developer ergonomics.",
    human:
      "Our deploy script broke twice on Tuesday. Both failures traced back to the same stale lockfile on the build server. I deleted the cache, pinned the Node minor version, and watched the third run go green in four minutes. Still ugly, but it ships."
  };

  const REGISTER_PROMPTS = {
    direct:
      "Rewrite the text in a direct, blunt human voice. Cut throat-clearing openers, eliminate AI buzzwords (delve, tapestry, crucial, foster, seamlessly, landscape), drop 'not just X, it's Y' contrast frames, and vary sentence length sharply. Keep facts intact. Output ONLY the rewritten prose.",
    fieldnote:
      "Rewrite the text like a grounded engineer's field note: specific, conversational, and concrete. Remove all LLM clichés, triadic lists, and em-dash theatrics. Mix short punchy sentences with natural observations. Output ONLY the rewritten prose.",
    drytech:
      "Rewrite the text in dry, plain technical prose. Strip every hype adjective, metaphor, and filler transition. State what happens concretely using active verbs. Output ONLY the rewritten prose.",
    editorial:
      "Rewrite the text as crisp editorial copy with an unmistakable human cadence: uneven sentence rhythm, concrete nouns, zero AI clichés or hedged openers. Preserve the core point. Output ONLY the rewritten prose."
  };

  const CLICHE_TERMS = [
    "in today's fast-paced",
    "today's fast-paced",
    "ever-evolving",
    "it's worth noting",
    "it is worth noting",
    "at the end of the day",
    "navigate the complexities",
    "double-edged sword",
    "serves as a",
    "stands as a",
    "game-changer",
    "game changer",
    "cutting-edge",
    "cutting edge",
    "embark on",
    "embarked on",
    "delve into",
    "delving into",
    "delve",
    "tapestry",
    "testament",
    "crucial",
    "pivotal",
    "multifaceted",
    "vibrant",
    "foster",
    "fostering",
    "fosters",
    "underscore",
    "underscores",
    "underscored",
    "realm",
    "landscape",
    "holistic",
    "synergy",
    "paradigm",
    "elevate",
    "unleash",
    "unlock",
    "unlocking",
    "harness",
    "seamlessly",
    "seamless",
    "transformative",
    "groundbreaking",
    "unprecedented",
    "reimagine",
    "poised to",
    "leverages",
    "leverage",
    "robust",
    "relentless"
  ];

  const HEDGE_OPENERS = [
    "importantly,",
    "notably,",
    "interestingly,",
    "significantly,",
    "ultimately,",
    "in conclusion,",
    "to summarize,",
    "in summary,",
    "overall,",
    "furthermore,",
    "moreover,",
    "additionally,",
    "let's dive in",
    "let us dive in",
    "let's explore"
  ];

  // DOM references
  const dom = {
    polliConnect: document.getElementById("polliConnect"),
    polliConnectWrap: document.getElementById("polliConnectWrap"),
    byopStatusPill: document.getElementById("byopStatusPill"),
    configNotice: document.getElementById("configNotice"),
    toggleSessionKeyBtn: document.getElementById("toggleSessionKeyBtn"),
    sessionKeyPanel: document.getElementById("sessionKeyPanel"),
    sessionKeyInput: document.getElementById("sessionKeyInput"),
    applySessionKeyBtn: document.getElementById("applySessionKeyBtn"),
    clearSessionKeyBtn: document.getElementById("clearSessionKeyBtn"),

    draftInput: document.getElementById("draftInput"),
    charCount: document.getElementById("charCount"),
    wordCount: document.getElementById("wordCount"),
    sentenceCount: document.getElementById("sentenceCount"),
    charMeterFill: document.getElementById("charMeterFill"),
    trimBtn: document.getElementById("trimBtn"),
    clearBtn: document.getElementById("clearBtn"),
    highlightedProse: document.getElementById("highlightedProse"),

    registerSelect: document.getElementById("registerSelect"),
    modelSelect: document.getElementById("modelSelect"),
    costEstimateBadge: document.getElementById("costEstimateBadge"),
    humanizeBtn: document.getElementById("humanizeBtn"),
    aiFeedback: document.getElementById("aiFeedback"),

    scoreArc: document.getElementById("scoreArc"),
    scoreValue: document.getElementById("scoreValue"),
    scoreVerdict: document.getElementById("scoreVerdict"),
    scoreExplain: document.getElementById("scoreExplain"),

    metricCliche: document.getElementById("metricCliche"),
    metricContrast: document.getElementById("metricContrast"),
    metricTriad: document.getElementById("metricTriad"),
    metricEmdash: document.getElementById("metricEmdash"),
    metricEmdashRaw: document.getElementById("metricEmdashRaw"),
    metricHedge: document.getElementById("metricHedge"),
    metricBurst: document.getElementById("metricBurst"),
    metricBurstNote: document.getElementById("metricBurstNote"),

    cadenceBadge: document.getElementById("cadenceBadge"),
    cadenceSvgHost: document.getElementById("cadenceSvgHost"),
    tellsList: document.getElementById("tellsList"),

    rewriteCard: document.getElementById("rewriteCard"),
    scoreDeltaBadge: document.getElementById("scoreDeltaBadge"),
    rewriteOutput: document.getElementById("rewriteOutput"),
    usageTelemetry: document.getElementById("usageTelemetry"),
    copyRewriteBtn: document.getElementById("copyRewriteBtn"),
    applyRewriteBtn: document.getElementById("applyRewriteBtn"),
    sessionSpend: document.getElementById("sessionSpend"),
    presetButtons: Array.from(document.querySelectorAll("[data-preset]"))
  };

  // Session-only state (never written to disk or localStorage)
  let manualSessionKey = null;
  let sessionPollenSpent = 0;
  let lastAnalysis = null;
  let lastRewriteText = "";
  let isCallingApi = false;

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function isValidPublishableKey(key) {
    return typeof key === "string" && /^pk_[A-Za-z0-9_-]{6,}$/.test(key.trim());
  }

  function getActiveApiKey() {
    if (manualSessionKey) return manualSessionKey;
    if (dom.polliConnect && dom.polliConnect.apiKey) return dom.polliConnect.apiKey;
    return null;
  }

  function updateByopStatus() {
    const oauthKey = dom.polliConnect ? dom.polliConnect.apiKey : null;
    const active = getActiveApiKey();

    if (oauthKey) {
      dom.byopStatusPill.textContent = "BYOP: Connected";
      dom.byopStatusPill.classList.add("is-connected");
    } else if (manualSessionKey) {
      dom.byopStatusPill.textContent = "BYOP: Session Key";
      dom.byopStatusPill.classList.add("is-connected");
    } else {
      dom.byopStatusPill.textContent = "BYOP: Not connected";
      dom.byopStatusPill.classList.remove("is-connected");
    }

    dom.humanizeBtn.disabled = isCallingApi || (!active && false);
  }

  function splitSentences(text) {
    const cleaned = text.trim();
    if (!cleaned) return [];
    // Protect common abbreviations and decimals from false splits.
    const masked = cleaned
      .replace(/\b(e\.g|i\.e|Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|U\.S|U\.K)\./gi, "$1<DOT>")
      .replace(/(\d)\.(\d)/g, "$1<DOT>$2");

    return masked
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.replace(/<DOT>/g, ".").trim())
      .filter((s) => s.length > 0 && /[a-zA-Z0-9]/.test(s));
  }

  function countWords(str) {
    const matches = str.match(/\b[\w'’-]+\b/g);
    return matches ? matches.length : 0;
  }

  function findRegexMatches(text, regex, type, label, reason) {
    const hits = [];
    let m;
    while ((m = regex.exec(text)) !== null) {
      if (m[0].length === 0) {
        regex.lastIndex += 1;
        continue;
      }
      hits.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        type,
        label,
        reason
      });
    }
    return hits;
  }

  /**
   * 100% local LLM Voice X-Ray analyzer (0 Pollen).
   */
  function analyzeLlmVoice(rawText) {
    const text = rawText || "";
    const words = countWords(text);
    const sentences = splitSentences(text);
    const sentenceLengths = sentences.map((s) => countWords(s)).filter((n) => n > 0);

    const hits = [];

    // 1. Cliché buzzwords
    const sortedCliches = [...CLICHE_TERMS].sort((a, b) => b.length - a.length);
    const clichePattern = new RegExp(
      `\\b(${sortedCliches.map(escapeRegex).join("|")})\\b`,
      "gi"
    );
    hits.push(
      ...findRegexMatches(
        text,
        clichePattern,
        "cliche",
        "LLM Cliché",
        "High-frequency AI vocabulary tell"
      )
    );

    // 2. Contrast frames ("not just X, it's Y", "isn't about X—it's about Y", "not merely X, but Y")
    const contrastPatterns = [
      /\b(?:it(?:'s| is)\s+)?not\s+(?:just|only|merely|simply|about)\b[^.!?\n]{1,65}?(?:—|--|,|;)\s*(?:it(?:'s| is)\s+|but\s+(?:also\s+)?(?:about\s+)?)/gi,
      /\brather than\b[^.!?\n]{2,55}?,\s*(?:it|this|the|they|we)\b/gi
    ];
    for (const pat of contrastPatterns) {
      hits.push(
        ...findRegexMatches(
          text,
          pat,
          "contrast",
          "Contrast Frame",
          "Classic 'not just X, it's Y' LLM rhetorical scaffold"
        )
      );
    }

    // 3. Triadic / three-part parallel lists ("A, B, and C")
    const triadRegex =
      /\b([a-zA-Z-]+(?:\s+[a-zA-Z-]+){0,2}),\s+([a-zA-Z-]+(?:\s+[a-zA-Z-]+){0,2}),\s+and\s+([a-zA-Z-]+(?:\s+[a-zA-Z-]+){0,2})\b/gi;
    hits.push(
      ...findRegexMatches(
        text,
        triadRegex,
        "triad",
        "Triadic List",
        "Three-part symmetrical list cadence common in RLHF prose"
      )
    );

    // 4. Em-dash density
    const emdashRegex = /—|--/g;
    hits.push(
      ...findRegexMatches(
        text,
        emdashRegex,
        "emdash",
        "Em-Dash",
        "Frequent em-dash pivots signal dramatic LLM pacing"
      )
    );

    // 5. Hedging / throat-clearing openers
    const hedgeRegex = new RegExp(
      `(?:^|[.!?\\n]\\s+)(${HEDGE_OPENERS.map(escapeRegex).join("|")})`,
      "gi"
    );
    let hm;
    while ((hm = hedgeRegex.exec(text)) !== null) {
      const phrase = hm[1];
      const offset = hm[0].length - phrase.length;
      hits.push({
        start: hm.index + offset,
        end: hm.index + offset + phrase.length,
        text: phrase,
        type: "hedge",
        label: "Throat-Clearer",
        reason: "Formulaic transitional filler opener"
      });
    }

    // Deduplicate overlapping spans (keep earlier / higher-priority span)
    const priority = { contrast: 1, cliche: 2, triad: 3, hedge: 4, emdash: 5 };
    hits.sort((a, b) => a.start - b.start || priority[a.type] - priority[b.type]);
    const cleanHits = [];
    let cursor = -1;
    for (const h of hits) {
      if (h.start >= cursor) {
        cleanHits.push(h);
        cursor = h.end;
      }
    }

    const counts = {
      cliche: cleanHits.filter((h) => h.type === "cliche").length,
      contrast: cleanHits.filter((h) => h.type === "contrast").length,
      triad: cleanHits.filter((h) => h.type === "triad").length,
      emdash: cleanHits.filter((h) => h.type === "emdash").length,
      hedge: cleanHits.filter((h) => h.type === "hedge").length
    };

    const emdashPer100 = words > 0 ? (counts.emdash / words) * 100 : 0;

    // 6. Sentence-length burstiness (Coefficient of Variation = stdDev / mean)
    let meanLen = 0;
    let stdDev = 0;
    let cv = 0;
    if (sentenceLengths.length > 0) {
      meanLen = sentenceLengths.reduce((acc, n) => acc + n, 0) / sentenceLengths.length;
      if (sentenceLengths.length >= 2 && meanLen > 0) {
        const variance =
          sentenceLengths.reduce((acc, n) => acc + Math.pow(n - meanLen, 2), 0) /
          sentenceLengths.length;
        stdDev = Math.sqrt(variance);
        cv = stdDev / meanLen;
      }
    }

    // Composite 0-100 LLM Voice Score
    let score = 0;
    if (words > 0) {
      const clicheRate = (counts.cliche / Math.max(words, 25)) * 100;
      const clichePts = Math.min(42, counts.cliche * 7 + clicheRate * 2.2);
      const contrastPts = Math.min(20, counts.contrast * 14);
      const triadPts = Math.min(14, counts.triad * 7);
      const emdashPts = Math.min(12, Math.max(0, emdashPer100 - 0.8) * 4.5);
      const hedgePts = Math.min(12, counts.hedge * 6);

      // Monotonous cadence penalty (when >= 3 sentences and CV < 0.35)
      let cadencePts = 0;
      if (sentenceLengths.length >= 3) {
        if (cv < 0.2) cadencePts = 14;
        else if (cv < 0.32) cadencePts = 8;
        else if (cv < 0.4) cadencePts = 3;
      }

      score = Math.round(
        Math.min(100, clichePts + contrastPts + triadPts + emdashPts + hedgePts + cadencePts)
      );
    }

    return {
      chars: text.length,
      words,
      sentences,
      sentenceLengths,
      meanLen,
      stdDev,
      cv,
      counts,
      emdashPer100,
      hits: cleanHits,
      score
    };
  }

  function renderHighlightedProse(text, hits) {
    if (!text.trim()) {
      dom.highlightedProse.innerHTML =
        '<span style="color:#8b8478">Highlighted tells will appear here as you type.</span>';
      return;
    }

    let html = "";
    let pos = 0;
    for (const h of hits) {
      if (h.start > pos) {
        html += escapeHtml(text.slice(pos, h.start));
      }
      html += `<mark class="tell-${h.type}" title="${escapeHtml(h.label)}: ${escapeHtml(
        h.reason
      )}">${escapeHtml(text.slice(h.start, h.end))}</mark>`;
      pos = h.end;
    }
    if (pos < text.length) {
      html += escapeHtml(text.slice(pos));
    }
    dom.highlightedProse.innerHTML = html;
  }

  function renderCadenceSvg(lengths, meanLen, cv) {
    if (!lengths.length) {
      dom.cadenceSvgHost.innerHTML =
        '<span style="font-size:0.82rem;color:#8b8478">Add at least 2 sentences to plot rhythm bars.</span>';
      dom.cadenceBadge.textContent = "—";
      dom.cadenceBadge.className = "pill pill-neutral";
      return;
    }

    const w = 500;
    const h = 96;
    const padX = 10;
    const padTop = 12;
    const padBottom = 18;
    const plotW = w - padX * 2;
    const plotH = h - padTop - padBottom;
    const maxVal = Math.max(28, ...lengths);
    const count = lengths.length;
    const slotW = plotW / count;
    const barW = Math.max(6, Math.min(28, slotW * 0.68));

    const meanY = padTop + plotH - (meanLen / maxVal) * plotH;

    const bars = lengths
      .map((len, idx) => {
        const barH = Math.max(4, (len / maxVal) * plotH);
        const x = padX + idx * slotW + (slotW - barW) / 2;
        const y = padTop + plotH - barH;
        let fill = "#2b8a3e"; // punchy/varied
        if (len >= 13 && len <= 23) fill = "#d97706"; // classic LLM medium band
        if (len > 23) fill = "#1971c2"; // long clause
        return `
          <g>
            <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(
          1
        )}" height="${barH.toFixed(1)}" rx="3" fill="${fill}" opacity="0.88">
              <title>Sentence ${idx + 1}: ${len} words</title>
            </rect>
            <text x="${(x + barW / 2).toFixed(1)}" y="${h - 4}" text-anchor="middle" font-size="9" fill="#5d584f" font-family="monospace">${len}</text>
          </g>`;
      })
      .join("");

    dom.cadenceSvgHost.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Sentence length cadence bar chart">
        <line x1="${padX}" y1="${meanY.toFixed(1)}" x2="${w - padX}" y2="${meanY.toFixed(
      1
    )}" stroke="#8b8478" stroke-width="1" stroke-dasharray="4 3" />
        <text x="${w - padX}" y="${Math.max(9, meanY - 3).toFixed(
      1
    )}" text-anchor="end" font-size="9" fill="#5d584f" font-family="monospace">avg ${meanLen.toFixed(
      1
    )}w</text>
        ${bars}
      </svg>`;

    if (lengths.length < 3) {
      dom.cadenceBadge.textContent = "Need 3+ sentences";
      dom.cadenceBadge.className = "pill pill-neutral";
    } else if (cv < 0.25) {
      dom.cadenceBadge.textContent = "Flat Metronome (AI-like)";
      dom.cadenceBadge.className = "pill";
      dom.cadenceBadge.style.background = "#fff3bf";
      dom.cadenceBadge.style.color = "#9c4221";
      dom.cadenceBadge.style.border = "1px solid #ffd43b";
    } else if (cv >= 0.42) {
      dom.cadenceBadge.textContent = "Dynamic Human Burstiness";
      dom.cadenceBadge.className = "pill pill-free";
      dom.cadenceBadge.style = "";
    } else {
      dom.cadenceBadge.textContent = "Moderate Cadence";
      dom.cadenceBadge.className = "pill pill-neutral";
      dom.cadenceBadge.style = "";
    }
  }

  function renderTellsList(hits, words, cv, sentenceCount) {
    if (!words) {
      dom.tellsList.innerHTML =
        '<li style="color:#8b8478">No text scanned yet. Pick a preset or paste prose.</li>';
      return;
    }

    const items = hits.slice(0, 14).map(
      (h) => `
      <li>
        <span><strong>"${escapeHtml(h.text)}"</strong> — <span style="color:#5d584f">${escapeHtml(
        h.reason
      )}</span></span>
        <span class="tell-tag tell-tag-${h.type}">${escapeHtml(h.label)}</span>
      </li>`
    );

    if (sentenceCount >= 3 && cv < 0.25) {
      items.push(`
        <li>
          <span><strong>Uniform sentence lengths (CV ${cv.toFixed(
            2
          )})</strong> — <span style="color:#5d584f">Every sentence lands near the same length.</span></span>
          <span class="tell-tag tell-tag-contrast">Metronome</span>
        </li>`);
    }

    if (!items.length) {
      dom.tellsList.innerHTML =
        '<li style="color:#2b8a3e;border-color:#b2f2bb;background:#ebfbee"><span><strong>Clean signal:</strong> Zero common LLM clichés, contrast frames, or formulaic openers detected.</span><span class="tell-tag tell-tag-hedge">Human</span></li>';
      return;
    }

    dom.tellsList.innerHTML = items.join("");
  }

  function updateScoreUI(analysis) {
    const { score, words, chars, sentences, counts, emdashPer100, cv, sentenceLengths, meanLen, hits } =
      analysis;

    // Score ring (circumference = 2 * pi * 50 = 314.16)
    const circ = 314.16;
    const offset = circ - (score / 100) * circ;
    dom.scoreArc.style.strokeDashoffset = offset.toFixed(2);

    let ringColor = "#2b8a3e";
    let verdict = "Crisp Human Voice";
    let explain = "Concrete phrasing with minimal AI fingerprints.";

    if (!words) {
      verdict = "Paste text to scan";
      explain =
        "Measures vocabulary slop, contrast-frame templates, triadic lists, em-dash density, throat-clearing openers, and sentence-length monotony.";
    } else if (score >= 75) {
      ringColor = "#c92a2a";
      verdict = "Heavy LLM Voice (High Slop)";
      explain =
        "Packed with characteristic AI buzzwords, contrast scaffolds, or symmetrical phrasing.";
    } else if (score >= 45) {
      ringColor = "#d9480f";
      verdict = "Noticeable AI Sheen";
      explain =
        "Readable, but multiple rhythmic or lexical tells give away a language-model draft.";
    } else if (score >= 20) {
      ringColor = "#d97706";
      verdict = "Mild LLM Hints";
      explain = "Mostly natural, with a few isolated clichés or predictable cadence patterns.";
    }

    dom.scoreArc.style.stroke = ringColor;
    dom.scoreValue.textContent = String(score);
    dom.scoreVerdict.textContent = verdict;
    dom.scoreExplain.textContent = explain;

    // Counters & character guardrail meter
    const limit = CFG.maxInputChars;
    dom.charCount.textContent = `${chars.toLocaleString()} / ${limit.toLocaleString()} chars (AI limit)`;
    dom.charCount.classList.toggle("over-limit", chars > limit);
    dom.trimBtn.classList.toggle("hidden", chars <= limit);

    dom.wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
    dom.sentenceCount.textContent = `${sentences.length} ${
      sentences.length === 1 ? "sentence" : "sentences"
    }`;

    const pct = Math.min(100, (chars / limit) * 100);
    dom.charMeterFill.style.width = `${pct.toFixed(1)}%`;
    dom.charMeterFill.classList.toggle("is-warn", chars > limit * 0.85 && chars <= limit);
    dom.charMeterFill.classList.toggle("is-over", chars > limit);

    // 6 metric cards
    dom.metricCliche.textContent = String(counts.cliche);
    dom.metricContrast.textContent = String(counts.contrast);
    dom.metricTriad.textContent = String(counts.triad);
    dom.metricEmdash.textContent = emdashPer100.toFixed(1);
    dom.metricEmdashRaw.textContent = `${counts.emdash} ${counts.emdash === 1 ? "dash" : "dashes"}`;
    dom.metricHedge.textContent = String(counts.hedge);
    dom.metricBurst.textContent = cv.toFixed(2);
    dom.metricBurstNote.textContent =
      sentenceLengths.length >= 3
        ? cv < 0.25
          ? "Low variance (flat)"
          : cv >= 0.42
          ? "Varied human rhythm"
          : "Moderate variance"
        : "Need 3+ sentences";

    renderHighlightedProse(dom.draftInput.value, hits);
    renderCadenceSvg(sentenceLengths, meanLen, cv);
    renderTellsList(hits, words, cv, sentences.length);
  }

  function runLocalScan() {
    lastAnalysis = analyzeLlmVoice(dom.draftInput.value);
    updateScoreUI(lastAnalysis);
    updateEstimatedCost();
  }

  function getSelectedModelMeta() {
    const id = dom.modelSelect.value;
    return CFG.models.find((m) => m.id === id) || CFG.models[0];
  }

  function updateEstimatedCost() {
    const model = getSelectedModelMeta();
    const chars = Math.min(dom.draftInput.value.length, CFG.maxInputChars);
    const estPromptTokens = Math.ceil(chars / 4) + 140;
    const estCompTokens = Math.min(CFG.maxOutputTokens, Math.max(80, Math.ceil(chars / 4)));
    const estPollen =
      estPromptTokens * model.promptPollenPerToken +
      estCompTokens * model.completionPollenPerToken;
    dom.costEstimateBadge.textContent = `Est. ~${estPollen.toFixed(5)} Pollen / click`;
  }

  function showAiFeedback(message, kind) {
    dom.aiFeedback.textContent = message;
    dom.aiFeedback.className = `ai-feedback is-${kind}`;
    dom.aiFeedback.classList.remove("hidden");
  }

  function clearAiFeedback() {
    dom.aiFeedback.classList.add("hidden");
  }

  async function handleHumanizeClick() {
    clearAiFeedback();

    const text = dom.draftInput.value.trim();
    if (!text) {
      showAiFeedback("Paste or choose a preset passage before calling Pollinations.", "error");
      return;
    }

    if (text.length > CFG.maxInputChars) {
      showAiFeedback(
        `Draft exceeds the ${CFG.maxInputChars}-char Pollen guard (${text.length} chars). Click "Trim to 1,200" first.`,
        "error"
      );
      return;
    }

    const token = getActiveApiKey();
    if (!token) {
      const hasValidAppKey = isValidPublishableKey(CFG.appKey);
      showAiFeedback(
        hasValidAppKey
          ? "Connect your Pollinations account via the Connect button (top right) to run AI humanization on your own Pollen."
          : "No BYOP session active yet. Add your pk_... key to config.js for <polli-connect>, or enter a temporary sk_... key under 'Local Key (Test)'.",
        "info"
      );
      return;
    }

    const model = getSelectedModelMeta();
    const registerKey = dom.registerSelect.value;
    const systemPrompt = REGISTER_PROMPTS[registerKey] || REGISTER_PROMPTS.direct;

    const flaggedPreview =
      lastAnalysis && lastAnalysis.hits.length
        ? `\n\nFlagged LLM tells to eliminate: ${[
            ...new Set(lastAnalysis.hits.map((h) => h.text))
          ]
            .slice(0, 10)
            .join(", ")}`
        : "";

    isCallingApi = true;
    dom.humanizeBtn.disabled = true;
    dom.humanizeBtn.textContent = "Rewriting…";

    try {
      const resp = await fetch(CFG.apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model.id,
          max_tokens: CFG.maxOutputTokens,
          temperature: 0.6,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${text}${flaggedPreview}` }
          ]
        })
      });

      if (!resp.ok) {
        let detail = "";
        try {
          const errBody = await resp.json();
          detail = errBody?.error?.message || errBody?.message || "";
        } catch {
          detail = resp.statusText;
        }
        throw new Error(`Pollinations API returned HTTP ${resp.status}${detail ? `: ${detail}` : ""}`);
      }

      const data = await resp.json();
      const rewritten = data?.choices?.[0]?.message?.content?.trim();
      if (!rewritten) {
        throw new Error("Empty completion returned by the model.");
      }

      const promptTok = Number(data?.usage?.prompt_tokens || 0);
      const compTok = Number(data?.usage?.completion_tokens || 0);
      const exactPollen =
        promptTok * model.promptPollenPerToken + compTok * model.completionPollenPerToken;
      sessionPollenSpent += exactPollen;
      dom.sessionSpend.textContent = `Session AI spend: ${sessionPollenSpent.toFixed(6)} Pollen`;

      // Re-scan the output locally at 0 Pollen to measure improvement
      const beforeScore = lastAnalysis ? lastAnalysis.score : 0;
      const afterAnalysis = analyzeLlmVoice(rewritten);
      const diff = afterAnalysis.score - beforeScore;
      const deltaLabel =
        diff <= 0
          ? `${beforeScore} → ${afterAnalysis.score} (${diff} AI score)`
          : `${beforeScore} → ${afterAnalysis.score} (+${diff})`;

      lastRewriteText = rewritten;
      dom.rewriteOutput.textContent = rewritten;
      dom.scoreDeltaBadge.textContent = deltaLabel;
      dom.usageTelemetry.textContent = `Model: ${model.id} · ${promptTok}+${compTok} tokens · ~${exactPollen.toFixed(
        6
      )} Pollen`;
      dom.rewriteCard.classList.remove("hidden");

      showAiFeedback("Rewritten via Pollinations BYOP and re-scored locally (0 extra Pollen).", "ok");
    } catch (err) {
      showAiFeedback(err.message || "Request failed.", "error");
    } finally {
      isCallingApi = false;
      dom.humanizeBtn.disabled = false;
      dom.humanizeBtn.textContent = "Humanize (BYOP)";
    }
  }

  function initConfigAndConnect() {
    // Populate model selector
    dom.modelSelect.innerHTML = CFG.models
      .map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.label)}</option>`)
      .join("");
    dom.modelSelect.value = CFG.defaultModel;

    // Configure <polli-connect> if a real pk_... key is present
    if (isValidPublishableKey(CFG.appKey)) {
      dom.polliConnect.setAttribute("app-key", CFG.appKey.trim());
      dom.polliConnect.setAttribute("budget", String(CFG.budget));
      dom.polliConnect.setAttribute("expiry", String(CFG.expiry));
      dom.polliConnect.setAttribute("permissions", CFG.permissions);
      dom.configNotice.classList.add("hidden");
      dom.polliConnectWrap.classList.remove("is-placeholder");
    } else {
      dom.configNotice.classList.remove("hidden");
      dom.polliConnectWrap.classList.add("is-placeholder");
      dom.polliConnectWrap.title =
        "Set your free pk_... key in config.js to enable one-click BYOP OAuth";
    }

    if (dom.polliConnect) {
      dom.polliConnect.addEventListener("change", () => {
        updateByopStatus();
      });
    }
  }

  function bindEvents() {
    dom.draftInput.addEventListener("input", () => {
      dom.presetButtons.forEach((b) => b.classList.remove("is-active"));
      runLocalScan();
    });

    dom.presetButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-preset");
        if (!PRESETS[key]) return;
        dom.presetButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        dom.draftInput.value = PRESETS[key];
        clearAiFeedback();
        runLocalScan();
      });
    });

    dom.trimBtn.addEventListener("click", () => {
      dom.draftInput.value = dom.draftInput.value.slice(0, CFG.maxInputChars);
      runLocalScan();
    });

    dom.clearBtn.addEventListener("click", () => {
      dom.draftInput.value = "";
      dom.presetButtons.forEach((b) => b.classList.remove("is-active"));
      clearAiFeedback();
      runLocalScan();
    });

    dom.modelSelect.addEventListener("change", updateEstimatedCost);
    dom.humanizeBtn.addEventListener("click", handleHumanizeClick);

    dom.toggleSessionKeyBtn.addEventListener("click", () => {
      const hidden = dom.sessionKeyPanel.classList.toggle("hidden");
      dom.toggleSessionKeyBtn.setAttribute("aria-expanded", String(!hidden));
    });

    dom.applySessionKeyBtn.addEventListener("click", () => {
      const val = dom.sessionKeyInput.value.trim();
      if (!val) return;
      manualSessionKey = val;
      dom.sessionKeyInput.value = "";
      dom.sessionKeyPanel.classList.add("hidden");
      dom.toggleSessionKeyBtn.setAttribute("aria-expanded", "false");
      updateByopStatus();
      showAiFeedback("Session key loaded in memory (never saved to disk).", "ok");
    });

    dom.clearSessionKeyBtn.addEventListener("click", () => {
      manualSessionKey = null;
      dom.sessionKeyInput.value = "";
      updateByopStatus();
      clearAiFeedback();
    });

    dom.copyRewriteBtn.addEventListener("click", async () => {
      if (!lastRewriteText) return;
      try {
        await navigator.clipboard.writeText(lastRewriteText);
        dom.copyRewriteBtn.textContent = "Copied!";
        setTimeout(() => {
          dom.copyRewriteBtn.textContent = "Copy Rewrite";
        }, 1400);
      } catch {
        showAiFeedback("Clipboard permission blocked; select and copy manually.", "info");
      }
    });

    dom.applyRewriteBtn.addEventListener("click", () => {
      if (!lastRewriteText) return;
      dom.draftInput.value = lastRewriteText;
      dom.presetButtons.forEach((b) => b.classList.remove("is-active"));
      runLocalScan();
    });
  }

  // Boot
  initConfigAndConnect();
  bindEvents();
  updateByopStatus();

  // Load initial AI Corporate Slop preset so first-time visitors see the X-Ray immediately at 0 Pollen.
  dom.draftInput.value = PRESETS.corporate;
  const defaultPresetBtn = dom.presetButtons.find((b) => b.dataset.preset === "corporate");
  if (defaultPresetBtn) defaultPresetBtn.classList.add("is-active");
  runLocalScan();
})();
