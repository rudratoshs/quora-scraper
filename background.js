// ============================================================
// QUORA HINDI PRO - BACKGROUND SERVICE WORKER
// ============================================================

console.log('🚀 Quora Hindi Pro background service worker loaded');

// State
let answerQueue = [];
let isProcessing = false;
let dailyStats = {
  date: new Date().toDateString(),
  answered: 0,
  generated: 0,
  errors: 0
};

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Quora Hindi Pro installed:', details.reason);
  
  // Set default settings
  chrome.storage.local.set({
    scrapedData: [],
    apiKey: '',
    geminiModel: 'gemini-2.5-flash',
    authorName: '',
    authorExpertise: '',
    authorBio: '',
    answeredToday: 0,
    lastAnswerDate: new Date().toDateString(),
    settings: {
      humanTyping: true,
      randomPauses: true,
      varyLength: true,
      dailyLimit: 15,
      minDelay: 60,
      maxDelay: 180
    }
  });
  
  // Create context menu
  createContextMenu();
});

// Create context menu for quick actions
function createContextMenu() {
  chrome.contextMenus.create({
    id: 'quoraProScrape',
    title: '📥 इस पेज को स्क्रैप करें',
    contexts: ['page'],
    documentUrlPatterns: ['*://*.quora.com/*']
  });
  
  chrome.contextMenus.create({
    id: 'quoraProAnalyze',
    title: '📊 प्रश्न विश्लेषण करें',
    contexts: ['link'],
    documentUrlPatterns: ['*://*.quora.com/*']
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'quoraProScrape') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: quickScrape
    });
  }
});

// Quick scrape function
function quickScrape() {
  const items = [];
  document.querySelectorAll("div.q-box.qu-borderBottom").forEach((block) => {
    const titleEl = block.querySelector("a.puppeteer_test_link");
    if (!titleEl) return;
    
    const title = titleEl.innerText.trim();
    const url = titleEl.href;
    if (!title || url.includes('/search?')) return;
    
    let answers = 0;
    block.querySelectorAll("a, span").forEach(el => {
      const m = el.innerText.match(/^(\d+)\s*(answers?|जवाब|उत्तर)$/i);
      if (m) answers = parseInt(m[1]);
    });
    
    items.push({ title, url, answers, scrapedAt: new Date().toISOString() });
  });
  
  chrome.storage.local.get(['scrapedData'], (result) => {
    const existing = result.scrapedData || [];
    const merged = [...existing];
    
    items.forEach(item => {
      if (!merged.some(e => e.url === item.url)) {
        merged.push(item);
      }
    });
    
    chrome.storage.local.set({ scrapedData: merged });
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '✅ स्क्रैप पूर्ण',
      message: `${items.length} नए प्रश्न जोड़े गए`
    });
  });
}

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'generateAnswer':
      generateAnswerWithGemini(request.question, request.options)
        .then(answer => sendResponse({ success: true, answer }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'getStats':
      sendResponse(dailyStats);
      break;
      
    case 'resetDailyStats':
      dailyStats = {
        date: new Date().toDateString(),
        answered: 0,
        generated: 0,
        errors: 0
      };
      sendResponse({ success: true });
      break;
      
    case 'addToQueue':
      answerQueue.push(request.question);
      sendResponse({ success: true, queueLength: answerQueue.length });
      break;
      
    case 'getQueue':
      sendResponse(answerQueue);
      break;
      
    case 'clearQueue':
      answerQueue = [];
      sendResponse({ success: true });
      break;
  }
  
  return true;
});

// Generate answer using Gemini API
async function generateAnswerWithGemini(question, options) {
  const { apiKey, model = 'gemini-2.5-flash' } = options;
  
  if (!apiKey) {
    throw new Error('API key not configured');
  }
  
  const prompt = buildPrompt(question, options);
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      dailyStats.errors++;
      throw new Error(data.error.message);
    }
    
    if (data.candidates && data.candidates[0]) {
      dailyStats.generated++;
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('No response generated');
    
  } catch (error) {
    dailyStats.errors++;
    throw error;
  }
}

// Build prompt for answer generation
function buildPrompt(question, options) {
  const { 
    style = 'expert',
    length = 'medium',
    includeHook = true,
    includeCTA = true,
    includeEmoji = true,
    seoOptimize = true,
    authorName = '',
    authorExpertise = ''
  } = options;
  
  let wordCount = '200-300';
  if (length === 'short') wordCount = '100-150';
  else if (length === 'long') wordCount = '400-500';
  
  let answerLanguage = 'Hinglish (Hindi + English mix)';
  if (question.language === 'hindi') answerLanguage = 'Hindi';
  else if (question.language === 'english') answerLanguage = 'English';
  
  return `Write a Quora answer in ${answerLanguage}.

QUESTION: "${question.title}"

REQUIREMENTS:
- ${wordCount} words
- Style: ${style} (${getStyleDescription(style)})
- ${includeHook ? 'Start with an engaging hook' : ''}
- ${includeCTA ? 'End with call-to-action for upvote/follow' : ''}
- ${includeEmoji ? 'Use 3-5 emojis' : 'No emojis'}
- ${seoOptimize ? 'SEO optimized with natural keywords' : ''}
- ${authorName ? `Author: ${authorName}` : ''}
- ${authorExpertise ? `Expertise: ${authorExpertise}` : ''}

Write naturally, not like AI. Be helpful and engaging.`;
}

function getStyleDescription(style) {
  const styles = {
    expert: 'authoritative, fact-based',
    friendly: 'warm, conversational',
    storyteller: 'narrative, engaging',
    practical: 'direct, actionable'
  };
  return styles[style] || 'balanced';
}

// Daily reset check
chrome.alarms.create('dailyReset', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    const today = new Date().toDateString();
    if (dailyStats.date !== today) {
      dailyStats = {
        date: today,
        answered: 0,
        generated: 0,
        errors: 0
      };
      
      chrome.storage.local.set({ 
        answeredToday: 0, 
        lastAnswerDate: today 
      });
    }
  }
});

// Tab update listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('quora.com')) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).catch(() => {}); // Ignore errors for already injected
  }
});
