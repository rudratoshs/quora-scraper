// ============================================================
// QUORA HINDI PRO - SMART AUTO-ANSWER SYSTEM
// ============================================================

// State Management
let allData = [];
let selectedQuestions = [];
let isScrapingActive = false;
let isAnsweringActive = false;
let currentAnswerIndex = 0;
let answeredToday = 0;

// Answer Style Templates
const ANSWER_STYLES = {
  expert: {
    name: "Expert",
    tone: "authoritative and knowledgeable",
    structure: "fact-based with evidence",
    hooks: [
      "As someone who has studied this extensively...",
      "Based on my experience in this field...",
      "The research clearly shows that...",
      "Let me share the professional perspective...",
    ],
  },
  friendly: {
    name: "Friendly",
    tone: "warm, approachable and conversational",
    structure: "personal anecdotes and relatable examples",
    hooks: [
      "Great question! I've wondered about this too...",
      "I totally get where you're coming from...",
      "This is something many people ask, and honestly...",
      "Let me share what worked for me...",
    ],
  },
  storyteller: {
    name: "Storyteller",
    tone: "engaging and narrative-driven",
    structure: "story format with lessons learned",
    hooks: [
      "Let me tell you a story that changed my perspective...",
      "A few years ago, I faced the exact same situation...",
      "Picture this scenario...",
      "Here's something that happened to me...",
    ],
  },
  practical: {
    name: "Practical",
    tone: "direct and action-oriented",
    structure: "step-by-step with actionable tips",
    hooks: [
      "Here's exactly what you need to do...",
      "I'll give you a simple framework...",
      "Follow these proven steps...",
      "The practical solution is...",
    ],
  },
};

// CTA Templates
const CTA_TEMPLATES = {
  hindi: [
    "अगर यह जानकारी उपयोगी लगी, तो कृपया upvote करें और follow करें! 🙏",
    "आपके upvote से और लोगों तक यह जानकारी पहुंचेगी। धन्यवाद! 💫",
    "अगर कोई सवाल हो तो comment में जरूर पूछें! Follow करें और जुड़े रहें। ✨",
    "यह जवाब पसंद आया? Upvote करें और अपने दोस्तों के साथ share करें! 🚀",
  ],
  english: [
    "If you found this helpful, please upvote and follow for more! 🙏",
    "Your upvote helps others find this answer. Thanks! 💫",
    "Have questions? Drop a comment! Follow for more insights. ✨",
    "Liked this answer? Upvote and share with friends! 🚀",
  ],
  hinglish: [
    "Helpful laga? Please upvote करें और follow करें! 🙏",
    "Aapka upvote aur logon tak ye info pahunchayega! 💫",
    "Koi sawaal ho to comment karo! Follow karo for more! ✨",
    "Pasand aaya? Upvote karo aur share karo! 🚀",
  ],
};

// DOM Elements
const elements = {};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  initTabs();
  loadSavedData();
  attachEventListeners();
  updateApiStatus();
});

// Cache DOM elements
function cacheElements() {
  // Tabs
  elements.tabs = document.querySelectorAll(".tab");
  elements.tabContents = document.querySelectorAll(".tab-content");

  // Scrape
  elements.pageCount = document.getElementById("pageCount");
  elements.scrollDelay = document.getElementById("scrollDelay");
  elements.autoScroll = document.getElementById("autoScroll");
  elements.btnScrape = document.getElementById("btnScrape");
  elements.btnStop = document.getElementById("btnStop");
  elements.btnClear = document.getElementById("btnClear");
  elements.progressContainer = document.getElementById("progressContainer");
  elements.progressFill = document.getElementById("progressFill");
  elements.progressText = document.getElementById("progressText");
  elements.totalQuestions = document.getElementById("totalQuestions");
  elements.highPotential = document.getElementById("highPotential");
  elements.unansweredCount = document.getElementById("unansweredCount");
  elements.answeredCount = document.getElementById("answeredCount");
  elements.statusMessage = document.getElementById("statusMessage");

  // Analyze
  elements.minEngagement = document.getElementById("minEngagement");
  elements.minEngagementValue = document.getElementById("minEngagementValue");
  elements.minFollowersFilter = document.getElementById("minFollowersFilter");
  elements.maxFollowersFilter = document.getElementById("maxFollowersFilter");
  elements.preferUnanswered = document.getElementById("preferUnanswered");
  elements.preferHindi = document.getElementById("preferHindi");
  elements.avoidCompetitive = document.getElementById("avoidCompetitive");
  elements.btnAnalyze = document.getElementById("btnAnalyze");
  elements.questionQueue = document.getElementById("questionQueue");
  elements.selectTop5 = document.getElementById("selectTop5");
  elements.selectTop10 = document.getElementById("selectTop10");

  // Answer
  elements.answerCount = document.getElementById("answerCount");
  elements.minDelay = document.getElementById("minDelay");
  elements.maxDelay = document.getElementById("maxDelay");
  elements.answerStyleSelect = document.getElementById("answerStyleSelect");
  elements.answerLength = document.getElementById("answerLength");
  elements.includeHook = document.getElementById("includeHook");
  elements.includeCTA = document.getElementById("includeCTA");
  elements.includeEmoji = document.getElementById("includeEmoji");
  elements.seoOptimize = document.getElementById("seoOptimize");
  elements.btnStartAnswering = document.getElementById("btnStartAnswering");
  elements.btnStopAnswering = document.getElementById("btnStopAnswering");
  elements.btnPreviewAnswer = document.getElementById("btnPreviewAnswer");
  elements.answerProgressContainer = document.getElementById(
    "answerProgressContainer"
  );
  elements.answerProgressFill = document.getElementById("answerProgressFill");
  elements.answerProgressText = document.getElementById("answerProgressText");
  elements.answerPreview = document.getElementById("answerPreview");
  elements.liveLog = document.getElementById("liveLog");

  // Settings
  elements.apiKey = document.getElementById("apiKey");
  elements.toggleApiKey = document.getElementById("toggleApiKey");
  elements.geminiModel = document.getElementById("geminiModel");
  elements.btnSaveApi = document.getElementById("btnSaveApi");
  elements.btnTestApi = document.getElementById("btnTestApi");
  elements.authorName = document.getElementById("authorName");
  elements.authorExpertise = document.getElementById("authorExpertise");
  elements.authorBio = document.getElementById("authorBio");
  elements.humanTyping = document.getElementById("humanTyping");
  elements.randomPauses = document.getElementById("randomPauses");
  elements.varyLength = document.getElementById("varyLength");
  elements.dailyLimit = document.getElementById("dailyLimit");
  elements.exportFormat = document.getElementById("exportFormat");
  elements.btnExport = document.getElementById("btnExport");
  elements.apiStatus = document.getElementById("apiStatus");
}

// Tab functionality
function initTabs() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;

      elements.tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      elements.tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `tab-${tabId}`) {
          content.classList.add("active");
        }
      });
    });
  });
}

// Load saved data
function loadSavedData() {
  chrome.storage.local.get(
    [
      "scrapedData",
      "apiKey",
      "geminiModel",
      "authorName",
      "authorExpertise",
      "authorBio",
      "answeredToday",
      "lastAnswerDate",
      "settings",
    ],
    (result) => {
      if (result.scrapedData) {
        allData = result.scrapedData;
        updateStats();
      }

      if (result.apiKey) {
        elements.apiKey.value = result.apiKey;
      }

      if (result.geminiModel) {
        elements.geminiModel.value = result.geminiModel;
      }

      if (result.authorName) elements.authorName.value = result.authorName;
      if (result.authorExpertise)
        elements.authorExpertise.value = result.authorExpertise;
      if (result.authorBio) elements.authorBio.value = result.authorBio;

      // Reset daily counter if new day
      const today = new Date().toDateString();
      if (result.lastAnswerDate !== today) {
        answeredToday = 0;
        chrome.storage.local.set({ answeredToday: 0, lastAnswerDate: today });
      } else {
        answeredToday = result.answeredToday || 0;
      }

      updateApiStatus();
    }
  );
}

// Attach event listeners
function attachEventListeners() {
  // Scrape tab
  elements.btnScrape.addEventListener("click", startScraping);
  elements.btnStop.addEventListener("click", stopScraping);
  elements.btnClear.addEventListener("click", clearData);

  // Analyze tab
  elements.minEngagement.addEventListener("input", () => {
    elements.minEngagementValue.textContent = elements.minEngagement.value;
  });
  elements.btnAnalyze.addEventListener("click", analyzeQuestions);
  elements.selectTop5.addEventListener("click", () => selectTopQuestions(5));
  elements.selectTop10.addEventListener("click", () => selectTopQuestions(10));

  // Answer tab
  elements.answerStyleSelect
    .querySelectorAll(".template-option")
    .forEach((opt) => {
      opt.addEventListener("click", () => {
        elements.answerStyleSelect
          .querySelectorAll(".template-option")
          .forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });
  elements.btnStartAnswering.addEventListener("click", startAnswering);
  elements.btnStopAnswering.addEventListener("click", stopAnswering);
  elements.btnPreviewAnswer.addEventListener("click", previewAnswer);

  // Settings tab
  elements.toggleApiKey.addEventListener("click", () => {
    const type = elements.apiKey.type === "password" ? "text" : "password";
    elements.apiKey.type = type;
    elements.toggleApiKey.textContent = type === "password" ? "👁️" : "🙈";
  });
  elements.btnSaveApi.addEventListener("click", saveApiSettings);
  elements.btnTestApi.addEventListener("click", testApi);
  elements.btnExport.addEventListener("click", exportData);
}

// Update API status badge
function updateApiStatus() {
  chrome.storage.local.get(["apiKey"], (result) => {
    if (result.apiKey) {
      elements.apiStatus.textContent = "API Ready";
      elements.apiStatus.className = "status-badge";
    } else {
      elements.apiStatus.textContent = "API Not Set";
      elements.apiStatus.className = "status-badge warning";
    }
  });
}

// ==================== SCRAPING ====================

async function startScraping() {
  const pageCount = parseInt(elements.pageCount.value) || 3;
  const scrollDelay = parseInt(elements.scrollDelay.value) || 2000;
  const autoScroll = elements.autoScroll.checked;

  isScrapingActive = true;
  updateScrapeUI(true);

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.url.includes("quora.com")) {
      showStatus("कृपया Quora पेज पर जाएं!", "error");
      updateScrapeUI(false);
      return;
    }

    for (let page = 1; page <= pageCount && isScrapingActive; page++) {
      updateProgress(
        ((page - 1) / pageCount) * 100,
        `पेज ${page}/${pageCount} स्क्रैप हो रहा है...`
      );

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeQuoraPage,
      });

      if (results && results[0] && results[0].result) {
        const newItems = results[0].result;

        newItems.forEach((item) => {
          // Calculate engagement potential
          item.engagementPotential = calculateEngagementPotential(item);

          if (!allData.some((existing) => existing.url === item.url)) {
            allData.push(item);
          }
        });

        saveData();
        updateStats();
      }

      if (autoScroll && page < pageCount && isScrapingActive) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: scrollPage,
        });
        await new Promise((resolve) => setTimeout(resolve, scrollDelay));
      }
    }

    if (isScrapingActive) {
      updateProgress(100, "पूर्ण!");
      showStatus(`${allData.length} प्रश्न स्क्रैप किए!`, "success");
    }
  } catch (error) {
    console.error("Scraping error:", error);
    showStatus("Error: " + error.message, "error");
  }

  isScrapingActive = false;
  updateScrapeUI(false);
}

// Scrape function (injected into page)
function scrapeQuoraPage() {
  const items = [];

  document
    .querySelectorAll("div.q-box.qu-borderBottom")
    .forEach((block, index) => {
      const titleEl = block.querySelector("a.puppeteer_test_link");
      if (!titleEl) return;

      const title = titleEl.innerText.trim();
      const url = titleEl.href;

      if (!title || url.includes("/search?")) return;

      // Extract all data
      let answers = 0;
      block.querySelectorAll("a, span").forEach((el) => {
        const txt = el.innerText.trim();
        const m = txt.match(/^(\d+)\s*(answers?|जवाब|उत्तर)$/i);
        if (m) answers = parseInt(m[1]);
      });

      let followers = 0;
      const followBtn = [...block.querySelectorAll("button")].find((b) =>
        /follow|फॉलो|अनुसरण/i.test(b.innerText)
      );
      if (followBtn) {
        const nums = followBtn.innerText.match(/(\d+)/g);
        if (nums) followers = parseInt(nums[nums.length - 1]);
      }

      // Language detection
      const hindiChars = (title.match(/[\u0900-\u097F]/g) || []).length;
      const englishChars = (title.match(/[a-zA-Z]/g) || []).length;
      const totalChars = hindiChars + englishChars;

      let language = "other";
      let hindiPercentage = 0;
      if (totalChars > 0) {
        hindiPercentage = Math.round((hindiChars / totalChars) * 100);
        language =
          hindiChars > englishChars
            ? englishChars > 0
              ? "hinglish"
              : "hindi"
            : "english";
      }

      // Question type
      const questionWords = [
        "क्या",
        "कैसे",
        "क्यों",
        "कब",
        "कौन",
        "कहाँ",
        "what",
        "how",
        "why",
        "when",
        "who",
        "where",
      ];
      const titleLower = title.toLowerCase();
      const questionType =
        questionWords.find((w) => titleLower.includes(w)) || "other";

      items.push({
        title,
        url,
        answers,
        followers,
        language,
        hindiPercentage,
        questionType,
        wordCount: title.split(/\s+/).length,
        isAnswered: answers > 0,
        scrapedAt: new Date().toISOString(),
      });
    });

  return items;
}

function scrollPage() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// Calculate engagement potential (0-100)
function calculateEngagementPotential(item) {
  let score = 50; // Base score

  // Followers boost (more followers = more visibility)
  if (item.followers >= 10) score += 20;
  else if (item.followers >= 5) score += 15;
  else if (item.followers >= 2) score += 10;
  else if (item.followers >= 1) score += 5;

  // Unanswered questions = opportunity
  if (item.answers === 0) score += 25;
  else if (item.answers <= 3) score += 15;
  else if (item.answers <= 5) score += 5;
  else if (item.answers >= 10) score -= 15; // Too competitive

  // Hindi/Hinglish preference (less competition)
  if (item.language === "hindi") score += 10;
  else if (item.language === "hinglish") score += 5;

  // Question type bonus
  if (["कैसे", "how", "क्यों", "why"].includes(item.questionType)) {
    score += 10; // How/Why questions get more engagement
  }

  // Word count (not too short, not too long)
  if (item.wordCount >= 5 && item.wordCount <= 15) score += 5;

  return Math.min(100, Math.max(0, score));
}

function stopScraping() {
  isScrapingActive = false;
  showStatus("स्क्रैपिंग रोकी गई", "info");
  updateScrapeUI(false);
}

function clearData() {
  if (confirm("सभी डेटा हटाएं?")) {
    allData = [];
    selectedQuestions = [];
    chrome.storage.local.remove("scrapedData");
    updateStats();
    renderQuestionQueue();
    showStatus("डेटा साफ़ किया गया", "success");
  }
}

function saveData() {
  chrome.storage.local.set({ scrapedData: allData });
}

function updateStats() {
  elements.totalQuestions.textContent = allData.length;
  elements.highPotential.textContent = allData.filter(
    (q) => q.engagementPotential >= 70
  ).length;
  elements.unansweredCount.textContent = allData.filter(
    (q) => !q.isAnswered
  ).length;
  elements.answeredCount.textContent = allData.filter(
    (q) => q.isAnswered
  ).length;
}

function updateScrapeUI(isScraping) {
  elements.btnScrape.disabled = isScraping;
  elements.btnStop.disabled = !isScraping;
  elements.progressContainer.style.display = isScraping ? "block" : "none";

  elements.btnScrape.innerHTML = isScraping
    ? '<div class="loader"></div><span>स्क्रैपिंग...</span>'
    : "<span>🚀 स्क्रैप शुरू करें</span>";
}

function updateProgress(percent, text) {
  elements.progressFill.style.width = `${percent}%`;
  elements.progressText.textContent = text;
}

function showStatus(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message status-${type}`;
  elements.statusMessage.style.display = "block";
  setTimeout(() => {
    elements.statusMessage.style.display = "none";
  }, 3000);
}

// ==================== ANALYZE ====================

function analyzeQuestions() {
  const minEngagement = parseInt(elements.minEngagement.value) || 0;
  const minFollowers = parseInt(elements.minFollowersFilter.value) || 0;
  const maxFollowers = parseInt(elements.maxFollowersFilter.value) || 1000;
  const preferUnanswered = elements.preferUnanswered.checked;
  const preferHindi = elements.preferHindi.checked;
  const avoidCompetitive = elements.avoidCompetitive.checked;

  let filtered = allData.filter((q) => {
    if (q.engagementPotential < minEngagement) return false;
    if (q.followers < minFollowers || q.followers > maxFollowers) return false;
    if (avoidCompetitive && q.answers > 10) return false;
    return true;
  });

  // Sort by engagement potential
  filtered.sort((a, b) => {
    let scoreA = a.engagementPotential;
    let scoreB = b.engagementPotential;

    if (preferUnanswered) {
      if (!a.isAnswered) scoreA += 20;
      if (!b.isAnswered) scoreB += 20;
    }

    if (preferHindi) {
      if (a.language === "hindi" || a.language === "hinglish") scoreA += 10;
      if (b.language === "hindi" || b.language === "hinglish") scoreB += 10;
    }

    return scoreB - scoreA;
  });

  selectedQuestions = filtered.slice(0, 20);
  renderQuestionQueue();

  showStatus(`${selectedQuestions.length} प्रश्न मिले!`, "success");
}

function renderQuestionQueue() {
  if (selectedQuestions.length === 0) {
    elements.questionQueue.innerHTML = `
      <div style="text-align: center; color: #888; padding: 20px;">
        पहले विश्लेषण करें / Analyze first
      </div>
    `;
    return;
  }

  elements.questionQueue.innerHTML = selectedQuestions
    .map((q, i) => {
      const scoreClass =
        q.engagementPotential >= 70
          ? "score-high"
          : q.engagementPotential >= 50
          ? "score-medium"
          : "score-low";

      return `
      <div class="queue-item pending" data-index="${i}">
        <div class="queue-title">${i + 1}. ${q.title}</div>
        <div class="queue-meta">
          <span>📝 ${q.answers} | 👥 ${q.followers} | 🔤 ${q.language}</span>
          <span class="score-badge ${scoreClass}">${
        q.engagementPotential
      }%</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function selectTopQuestions(count) {
  analyzeQuestions();
  selectedQuestions = selectedQuestions.slice(0, count);
  renderQuestionQueue();
}

// ==================== ANSWER GENERATION ====================

async function generateAnswer(question) {
  return new Promise(async (resolve, reject) => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      reject(new Error("API key not set"));
      return;
    }

    const model = elements.geminiModel.value || "gemini-2.5-flash";
    const style = getSelectedStyle();
    const length = elements.answerLength.value;
    const includeHook = elements.includeHook.checked;
    const includeCTA = elements.includeCTA.checked;
    const includeEmoji = elements.includeEmoji.checked;
    const seoOptimize = elements.seoOptimize.checked;

    const authorName = elements.authorName.value || "";
    const authorExpertise = elements.authorExpertise.value || "";

    // Build smart prompt
    const prompt = buildSmartPrompt(question, {
      style,
      length,
      includeHook,
      includeCTA,
      includeEmoji,
      seoOptimize,
      authorName,
      authorExpertise,
    });

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]) {
        const answer = data.candidates[0].content.parts[0].text;
        resolve(answer);
      } else {
        reject(new Error(data.error?.message || "Failed to generate answer"));
      }
    } catch (error) {
      reject(error);
    }
  });
}

function buildSmartPrompt(question, options) {
  const {
    style,
    length,
    includeHook,
    includeCTA,
    includeEmoji,
    seoOptimize,
    authorName,
    authorExpertise,
  } = options;
  const styleConfig = ANSWER_STYLES[style];

  // Determine word count
  let wordCount = "200-300";
  if (length === "short") wordCount = "100-150";
  else if (length === "long") wordCount = "400-500";

  // Determine language
  let answerLanguage = "Hinglish (mix of Hindi and English)";
  if (question.language === "hindi")
    answerLanguage = "Hindi with some English terms where natural";
  else if (question.language === "english") answerLanguage = "English";

  // Build prompt
  let prompt = `You are writing an answer for Quora in ${answerLanguage}.

QUESTION: "${question.title}"

QUESTION ANALYSIS:
- Type: ${question.questionType}
- Current Answers: ${question.answers}
- Followers: ${question.followers}
- Language: ${question.language}

ANSWER REQUIREMENTS:
1. Length: ${wordCount} words
2. Tone: ${styleConfig.tone}
3. Structure: ${styleConfig.structure}
`;

  if (authorName || authorExpertise) {
    prompt += `4. Author Perspective: ${
      authorName ? `My name is ${authorName}.` : ""
    } ${authorExpertise ? `I am a ${authorExpertise}.` : ""}\n`;
  }

  if (includeHook) {
    const randomHook =
      styleConfig.hooks[Math.floor(Math.random() * styleConfig.hooks.length)];
    prompt += `\n5. START with an engaging hook similar to: "${randomHook}" (adapt to the question)\n`;
  }

  if (seoOptimize) {
    prompt += `\n6. SEO OPTIMIZATION:
   - Use natural keywords from the question
   - Include related terms people might search for
   - Structure with clear points for readability
   - Use formatting (bold, bullet points) where appropriate\n`;
  }

  if (includeEmoji) {
    prompt += `\n7. Include 3-5 relevant emojis naturally throughout the answer\n`;
  }

  if (includeCTA) {
    const ctaLang =
      question.language === "hindi"
        ? "hindi"
        : question.language === "hinglish"
        ? "hinglish"
        : "english";
    const randomCTA =
      CTA_TEMPLATES[ctaLang][
        Math.floor(Math.random() * CTA_TEMPLATES[ctaLang].length)
      ];
    prompt += `\n8. END with a call-to-action similar to: "${randomCTA}"\n`;
  }

  prompt += `
ENGAGEMENT STRATEGIES:
- Make the reader feel understood
- Provide unique value they won't find elsewhere
- Create curiosity to read till the end
- Encourage interaction (comments, follows)
- Be authentic and relatable

IMPORTANT:
- Write naturally, not like AI
- Vary sentence length
- Use personal experiences or examples
- Be specific, not generic
- Proofread for natural flow

Now write the answer:`;

  return prompt;
}

function getSelectedStyle() {
  const selected = elements.answerStyleSelect.querySelector(
    ".template-option.selected"
  );
  return selected ? selected.dataset.style : "expert";
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiKey"], (result) => {
      resolve(result.apiKey || null);
    });
  });
}

// ==================== AUTO ANSWERING ====================

async function startAnswering() {
  if (selectedQuestions.length === 0) {
    showStatus("पहले प्रश्न चुनें!", "error");
    return;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    showStatus("API key सेट करें!", "error");
    return;
  }

  const dailyLimit = parseInt(elements.dailyLimit.value) || 15;
  if (answeredToday >= dailyLimit) {
    showStatus(`आज की limit (${dailyLimit}) पूरी हो गई!`, "warning");
    return;
  }

  const answerCount = Math.min(
    parseInt(elements.answerCount.value) || 5,
    selectedQuestions.length,
    dailyLimit - answeredToday
  );

  isAnsweringActive = true;
  currentAnswerIndex = 0;
  updateAnswerUI(true);

  addLog("🚀 Auto-answer started...", "info");

  for (let i = 0; i < answerCount && isAnsweringActive; i++) {
    const question = selectedQuestions[i];

    try {
      // Update queue UI
      updateQueueItemStatus(i, "processing");
      addLog(`📝 Generating answer for Q${i + 1}...`, "info");

      // Generate answer
      const answer = await generateAnswer(question);

      addLog(`✅ Answer generated for Q${i + 1}`, "success");

      // Open question page and post answer
      await postAnswer(question, answer);

      updateQueueItemStatus(i, "completed");
      answeredToday++;
      chrome.storage.local.set({
        answeredToday,
        lastAnswerDate: new Date().toDateString(),
      });

      // Update progress
      updateAnswerProgress(i + 1, answerCount);

      // Random delay before next answer
      if (i < answerCount - 1 && isAnsweringActive) {
        const minDelay = parseInt(elements.minDelay.value) || 60;
        const maxDelay = parseInt(elements.maxDelay.value) || 180;
        const delay = randomBetween(minDelay, maxDelay);

        addLog(`⏳ Waiting ${delay}s before next answer...`, "warning");

        for (let s = delay; s > 0 && isAnsweringActive; s--) {
          elements.answerProgressText.textContent = `${
            i + 1
          }/${answerCount} पूर्ण | Next in ${s}s`;
          await sleep(1000);
        }
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, "error");
      updateQueueItemStatus(i, "failed");
    }
  }

  isAnsweringActive = false;
  updateAnswerUI(false);
  addLog("🎉 Auto-answer completed!", "success");
}

async function postAnswer(question, answer) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Navigate to question page
      await chrome.tabs.update(tab.id, { url: question.url });

      // Wait for page to load
      await sleep(3000);

      // Type answer with human-like behavior
      if (elements.humanTyping.checked) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: typeAnswerHuman,
          args: [answer, elements.randomPauses.checked],
        });
      } else {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: typeAnswerFast,
          args: [answer],
        });
      }

      addLog(
        `📤 Answer posted to: ${question.title.substring(0, 30)}...`,
        "success"
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Type answer with human-like speed (injected function)
function typeAnswerHuman(answer, randomPauses) {
  return new Promise((resolve) => {
    // Find answer input
    const answerBtn =
      document.querySelector('button[class*="Answer"]') ||
      [...document.querySelectorAll("button")].find(
        (b) => b.innerText.includes("Answer") || b.innerText.includes("जवाब")
      );

    if (answerBtn) {
      answerBtn.click();
    }

    setTimeout(() => {
      const editor =
        document.querySelector('[contenteditable="true"]') ||
        document.querySelector(".doc");

      if (editor) {
        // Clear existing content
        editor.innerHTML = "";

        // Type character by character
        let index = 0;
        const chars = answer.split("");

        const typeNext = () => {
          if (index < chars.length) {
            editor.innerHTML += chars[index];
            index++;

            // Random typing speed (30-100ms per char)
            let delay = Math.random() * 70 + 30;

            // Pause at punctuation
            if (
              randomPauses &&
              [".", "!", "?", "।"].includes(chars[index - 1])
            ) {
              delay += Math.random() * 500 + 200;
            }

            setTimeout(typeNext, delay);
          } else {
            // Trigger input event
            editor.dispatchEvent(new Event("input", { bubbles: true }));
            resolve();
          }
        };

        typeNext();
      } else {
        resolve();
      }
    }, 2000);
  });
}

// Fast typing (injected function)
function typeAnswerFast(answer) {
  return new Promise((resolve) => {
    const answerBtn =
      document.querySelector('button[class*="Answer"]') ||
      [...document.querySelectorAll("button")].find(
        (b) => b.innerText.includes("Answer") || b.innerText.includes("जवाब")
      );

    if (answerBtn) {
      answerBtn.click();
    }

    setTimeout(() => {
      const editor =
        document.querySelector('[contenteditable="true"]') ||
        document.querySelector(".doc");

      if (editor) {
        editor.innerHTML = answer;
        editor.dispatchEvent(new Event("input", { bubbles: true }));
      }

      resolve();
    }, 2000);
  });
}

function stopAnswering() {
  isAnsweringActive = false;
  addLog("⏹️ Stopping...", "warning");
  updateAnswerUI(false);
}

async function previewAnswer() {
  if (selectedQuestions.length === 0) {
    showStatus("पहले प्रश्न चुनें!", "error");
    return;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    showStatus("API key सेट करें!", "error");
    return;
  }

  elements.answerPreview.style.display = "block";
  elements.answerPreview.textContent = "Generating preview...";

  try {
    const answer = await generateAnswer(selectedQuestions[0]);
    addLog('answer',answer)
    elements.answerPreview.textContent = answer;
    addLog("👁️ Preview generated", "success");
  } catch (error) {
    elements.answerPreview.textContent = "Error: " + error.message;
    addLog("❌ Preview failed: " + error.message, "error");
    addLog("error",error)
  }
}

function updateAnswerUI(isActive) {
  elements.btnStartAnswering.disabled = isActive;
  elements.btnStopAnswering.disabled = !isActive;
  elements.answerProgressContainer.style.display = isActive ? "block" : "none";

  elements.btnStartAnswering.innerHTML = isActive
    ? '<div class="loader"></div><span>Processing...</span>'
    : "<span>▶️ आंसर शुरू करें</span>";
}

function updateAnswerProgress(current, total) {
  const percent = (current / total) * 100;
  elements.answerProgressFill.style.width = `${percent}%`;
  elements.answerProgressText.textContent = `${current}/${total} आंसर पूर्ण`;
}

function updateQueueItemStatus(index, status) {
  const item = elements.questionQueue.querySelector(`[data-index="${index}"]`);
  if (item) {
    item.className = `queue-item ${status}`;
  }
}

function addLog(message, type = "info") {
  const log = document.createElement("div");
  log.className = `log-entry ${type}`;
  log.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  elements.liveLog.appendChild(log);
  elements.liveLog.scrollTop = elements.liveLog.scrollHeight;

  // Keep only last 50 logs
  while (elements.liveLog.children.length > 50) {
    elements.liveLog.removeChild(elements.liveLog.firstChild);
  }
}

// ==================== SETTINGS ====================

function saveApiSettings() {
  const apiKey = elements.apiKey.value.trim();
  const model = elements.geminiModel.value;
  const authorName = elements.authorName.value.trim();
  const authorExpertise = elements.authorExpertise.value.trim();
  const authorBio = elements.authorBio.value.trim();

  chrome.storage.local.set(
    {
      apiKey,
      geminiModel: model,
      authorName,
      authorExpertise,
      authorBio,
    },
    () => {
      showStatus("Settings saved!", "success");
      updateApiStatus();
    }
  );
}

async function testApi() {
  const apiKey = elements.apiKey.value.trim();
  if (!apiKey) {
    showStatus("Enter API key first!", "error");
    return;
  }

  elements.btnTestApi.disabled = true;
  elements.btnTestApi.innerHTML = '<div class="loader"></div> Testing...';

  try {
    const response = await fetch(
      // Updated to the active 2.5 Flash model
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "API working!" in Hindi' }] }],
        }),
      }
    );

    const data = await response.json();

    if (data.candidates) {
      showStatus("✅ API working!", "success");
    } else {
      showStatus(
        "❌ API error: " + (data.error?.message || "Unknown"),
        "error"
      );
    }
  } catch (error) {
    showStatus("❌ Connection failed", "error");
  }

  elements.btnTestApi.disabled = false;
  elements.btnTestApi.innerHTML = "<span>🧪 API टेस्ट करें</span>";
}

function exportData() {
  const format = elements.exportFormat.value;
  const data = {
    questions: allData,
    selected: selectedQuestions,
    stats: {
      total: allData.length,
      answered: answeredToday,
      exported: new Date().toISOString(),
    },
  };

  let content, mimeType, extension;

  if (format === "json") {
    content = JSON.stringify(data, null, 2);
    mimeType = "application/json";
    extension = "json";
  } else {
    // CSV
    const headers = [
      "title",
      "url",
      "answers",
      "followers",
      "language",
      "engagementPotential",
    ];
    const rows = allData.map((q) =>
      headers
        .map((h) => `"${String(q[h] || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    content = [headers.join(","), ...rows].join("\n");
    mimeType = "text/csv";
    extension = "csv";
  }

  const blob = new Blob(["\ufeff" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: `quora_pro_${new Date().toISOString().slice(0, 10)}.${extension}`,
    saveAs: true,
  });
}

// ==================== UTILITIES ====================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
