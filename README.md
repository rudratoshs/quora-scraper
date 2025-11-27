# 🚀 Quora Hindi Pro - Smart Scraper & AI Auto-Answer

A powerful Chrome extension for Hindi Quora that scrapes questions, analyzes engagement potential, and generates high-quality answers using Google's Gemini AI.

## ✨ Features

### 📥 Smart Scraping
- Multi-page scraping with auto-scroll
- Extracts: title, URL, answers, followers, language
- Automatic engagement potential scoring (0-100)
- Duplicate detection

### 📊 Intelligent Analysis
- Question scoring based on:
  - Follower count (visibility potential)
  - Answer count (competition level)
  - Language preference (Hindi/Hinglish/English)
  - Question type (How/Why questions get more engagement)
- Filter by engagement score, followers, answer count
- Prioritize unanswered questions

### ✍️ AI-Powered Answer Generation
- **4 Answer Styles:**
  - 👨‍🏫 Expert (authoritative, fact-based)
  - 😊 Friendly (warm, conversational)
  - 📖 Storyteller (narrative-driven)
  - 💡 Practical (action-oriented)

- **Smart Features:**
  - 🎣 Engaging hooks to capture attention
  - 📢 CTAs for upvotes, comments, follows
  - 😀 Natural emoji usage
  - 🔍 SEO optimization
  - Automatic language matching (Hindi/Hinglish/English)

### 🛡️ Anti-Detection
- Human-like typing speed
- Random delays between answers (60-180s configurable)
- Random pauses at punctuation
- Mouse movement simulation
- Daily answer limits
- Varied answer lengths

## 📥 Installation

1. Download and extract the extension folder
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the extension folder

## 🔑 Setup

### Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### Configure Extension
1. Click extension icon → Settings tab
2. Paste your API key
3. Click "Save API Key"
4. Click "Test API" to verify

## 🚀 Usage

### Step 1: Scrape Questions
1. Go to Hindi Quora (hi.quora.com)
2. Search for your topic (e.g., "health", "finance")
3. Click extension → Scrape tab
4. Set pages (3-5 recommended)
5. Click "स्क्रैप शुरू करें"

### Step 2: Analyze & Select
1. Go to Analyze tab
2. Set filters (min engagement, followers range)
3. Click "विश्लेषण करें"
4. Select top questions using "Top 5" or "Top 10" buttons

### Step 3: Generate & Post Answers
1. Go to Answer tab
2. Choose answer style
3. Set options (hooks, CTAs, emojis, SEO)
4. Click "Preview" to see sample answer
5. Click "आंसर शुरू करें" to start auto-answering

## 📊 Engagement Scoring

Questions are scored 0-100 based on:

| Factor | Score Impact |
|--------|-------------|
| 10+ followers | +20 |
| 5-9 followers | +15 |
| 2-4 followers | +10 |
| 0 answers (unanswered) | +25 |
| 1-3 answers | +15 |
| 10+ answers | -15 |
| Hindi language | +10 |
| Hinglish | +5 |
| How/Why question | +10 |

## ⚙️ Settings

### Answer Settings
- **Min/Max Delay**: Time between answers (seconds)
- **Answer Length**: Short/Medium/Long
- **Include Hook**: Start with engaging opener
- **Include CTA**: End with upvote/follow request
- **Include Emoji**: Natural emoji usage
- **SEO Optimize**: Keyword optimization

### Anti-Detection
- **Human Typing**: Simulates real typing speed
- **Random Pauses**: Pauses at punctuation
- **Vary Length**: ±20% length variation
- **Daily Limit**: Max answers per day

## ⚠️ Best Practices

1. **Start Slow**: Begin with 3-5 answers/day
2. **Quality First**: Preview answers before auto-posting
3. **Vary Styles**: Use different answer styles
4. **Target Wisely**: Focus on questions with 1-5 followers
5. **Avoid Competition**: Skip questions with 10+ answers
6. **Take Breaks**: Don't answer continuously

## 🔒 Privacy & Safety

- API key stored locally in Chrome
- No data sent to third parties
- All processing done client-side
- Answers are generated fresh each time

## 📁 Files

```
quora-pro-extension/
├── manifest.json      # Extension config
├── popup.html         # UI interface
├── popup.js           # Main logic
├── content.js         # Page interactions
├── background.js      # Service worker
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🐛 Troubleshooting

**API Error?**
- Check if API key is correct
- Verify Gemini API is enabled in Google Cloud
- Check API quota limits

**Not Scraping?**
- Refresh the Quora page
- Make sure you're on quora.com
- Check if page is fully loaded

**Answers Not Posting?**
- Extension needs active Quora tab
- Wait for page to load completely
- Check for Quora's answer editor

## 📜 Disclaimer

This tool is for educational purposes. Use responsibly and follow Quora's terms of service. Excessive automation may lead to account restrictions.

## 🆕 Version History

**v2.0.0** (Current)
- Complete rewrite with AI integration
- Gemini API support
- Smart engagement scoring
- 4 answer styles
- Anti-detection features
- Hindi/Hinglish/English support

---

Made with ❤️ for Hindi Quora creators
