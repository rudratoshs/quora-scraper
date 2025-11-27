// ============================================================
// QUORA HINDI PRO - CONTENT SCRIPT
// Handles page interactions and answer posting
// ============================================================

console.log('🚀 Quora Hindi Pro content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'scrape':
      sendResponse({ success: true, data: scrapeCurrentPage() });
      break;
      
    case 'scroll':
      scrollToBottom();
      sendResponse({ success: true });
      break;
      
    case 'postAnswer':
      postAnswerToPage(request.answer, request.options)
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // Keep channel open
      
    case 'getPageInfo':
      sendResponse({
        url: window.location.href,
        title: document.title,
        isQuora: window.location.hostname.includes('quora.com'),
        isQuestionPage: isQuestionPage()
      });
      break;
      
    case 'clickAnswerButton':
      clickAnswerButton();
      sendResponse({ success: true });
      break;
  }
  
  return true;
});

// Check if current page is a question page
function isQuestionPage() {
  const url = window.location.href;
  return url.includes('quora.com/') && 
         !url.includes('/search') && 
         !url.includes('/profile/') &&
         !url.includes('/topic/');
}

// Scrape questions from current page
function scrapeCurrentPage() {
  const items = [];
  
  document.querySelectorAll("div.q-box.qu-borderBottom").forEach((block, index) => {
    try {
      const titleEl = block.querySelector("a.puppeteer_test_link");
      if (!titleEl) return;
      
      const title = titleEl.innerText.trim();
      const url = titleEl.href;
      
      if (!title || url.includes('/search?')) return;
      
      // Answers
      let answers = 0;
      block.querySelectorAll("a, span").forEach(el => {
        const txt = el.innerText.trim();
        const m = txt.match(/^(\d+)\s*(answers?|जवाब|उत्तर)$/i);
        if (m) answers = parseInt(m[1]);
      });
      
      // Followers
      let followers = 0;
      const followBtn = [...block.querySelectorAll("button")].find(b => 
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
      
      let language = 'other';
      let hindiPercentage = 0;
      if (totalChars > 0) {
        hindiPercentage = Math.round((hindiChars / totalChars) * 100);
        language = hindiChars > englishChars ? (englishChars > 0 ? "hinglish" : "hindi") : "english";
      }
      
      // Question type
      const questionWords = ['क्या', 'कैसे', 'क्यों', 'कब', 'कौन', 'कहाँ', 'what', 'how', 'why', 'when', 'who', 'where'];
      const titleLower = title.toLowerCase();
      const questionType = questionWords.find(w => titleLower.includes(w)) || 'other';
      
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
        scrapedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Scrape error:', error);
    }
  });
  
  return items;
}

// Scroll to bottom
function scrollToBottom() {
  return new Promise((resolve) => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
    setTimeout(resolve, 1000);
  });
}

// Click the answer button
function clickAnswerButton() {
  // Try different selectors for answer button
  const selectors = [
    'button[class*="Answer"]',
    'button[aria-label*="Answer"]',
    '.AnswerButton',
    '[data-functional-selector="AnswerButton"]'
  ];
  
  for (const selector of selectors) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.click();
      return true;
    }
  }
  
  // Try finding by text
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    const text = btn.innerText.toLowerCase();
    if (text.includes('answer') || text.includes('जवाब') || text.includes('उत्तर')) {
      btn.click();
      return true;
    }
  }
  
  return false;
}

// Post answer to page
async function postAnswerToPage(answer, options = {}) {
  const { humanTyping = true, randomPauses = true } = options;
  
  // Step 1: Click answer button
  clickAnswerButton();
  await sleep(2000);
  
  // Step 2: Find editor
  const editor = findEditor();
  if (!editor) {
    throw new Error('Could not find answer editor');
  }
  
  // Step 3: Type answer
  if (humanTyping) {
    await typeHumanLike(editor, answer, randomPauses);
  } else {
    editor.innerHTML = formatAnswer(answer);
    triggerInputEvents(editor);
  }
  
  // Step 4: Wait before submit (let user review)
  await sleep(2000);
  
  return true;
}

// Find the answer editor
function findEditor() {
  const selectors = [
    '[contenteditable="true"]',
    '.doc[contenteditable]',
    '.DraftEditor-root',
    '[role="textbox"]',
    '.public-DraftEditor-content'
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  
  return null;
}

// Type with human-like behavior
async function typeHumanLike(editor, text, randomPauses) {
  // Clear editor
  editor.innerHTML = '';
  editor.focus();
  
  const words = text.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Type each character
    for (const char of word) {
      // Insert character
      document.execCommand('insertText', false, char);
      
      // Random delay between characters (20-80ms)
      await sleep(randomBetween(20, 80));
    }
    
    // Add space after word
    if (i < words.length - 1) {
      document.execCommand('insertText', false, ' ');
    }
    
    // Occasional pause after words
    if (randomPauses && Math.random() < 0.1) {
      await sleep(randomBetween(100, 300));
    }
    
    // Longer pause at sentence end
    if (randomPauses && /[.!?।]$/.test(word)) {
      await sleep(randomBetween(300, 800));
    }
  }
  
  triggerInputEvents(editor);
}

// Format answer with HTML
function formatAnswer(text) {
  // Convert markdown-like formatting
  let html = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph
  html = '<p>' + html + '</p>';
  
  return html;
}

// Trigger input events
function triggerInputEvents(element) {
  const events = ['input', 'change', 'keyup', 'keydown'];
  events.forEach(eventType => {
    element.dispatchEvent(new Event(eventType, { bubbles: true }));
  });
}

// Simulate mouse movement (anti-detection)
function simulateMouseMovement() {
  const x = randomBetween(100, window.innerWidth - 100);
  const y = randomBetween(100, window.innerHeight - 100);
  
  const event = new MouseEvent('mousemove', {
    clientX: x,
    clientY: y,
    bubbles: true
  });
  
  document.dispatchEvent(event);
}

// Utility: Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Random between
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add random mouse movements periodically (anti-detection)
setInterval(() => {
  if (Math.random() < 0.3) {
    simulateMouseMovement();
  }
}, 5000);

// Highlight extension is active (optional, can be removed)
function showExtensionBadge() {
  const badge = document.createElement('div');
  badge.id = 'quora-pro-badge';
  badge.innerHTML = '🚀 Pro Active';
  badge.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 11px;
    z-index: 99999;
    opacity: 0.7;
    transition: opacity 0.3s;
  `;
  badge.addEventListener('mouseenter', () => badge.style.opacity = '1');
  badge.addEventListener('mouseleave', () => badge.style.opacity = '0.7');
  
  // Remove after 5 seconds
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 5000);
}

// Show badge on load
if (document.readyState === 'complete') {
  showExtensionBadge();
} else {
  window.addEventListener('load', showExtensionBadge);
}
