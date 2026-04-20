---
title: "Python Web Scraping"
category: python
tags: [python, scraping, beautifulsoup, selenium, playwright]
sources: [raw/python/web_scrape.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Python Web Scraping

Web scraping involves programmatically extracting data from websites. This guide covers everything from static HTML parsing to automated browser interaction for dynamic SPAs.

## ⚖️ Responsible Scraping
Before starting any project, ensure you are scraping ethically and legally:
- **robots.txt**: Always check `website.com/robots.txt` for crawl permissions.
- **Rate Limiting**: Throttling requests to avoid overloading the site's server.
- **Terms of Service**: Review the site's ToS for scraping restrictions.

---

## 🛠️ Basic Scraping (Static HTML)

Best for pages where content is delivered directly in the initial HTML response.

### Core Tools
- **lxml**: Fast, high-performance XML and HTML parser.
- **Beautiful Soup (bs4)**: Feature-rich library for navigating and searching the HTML tree.

```bash
pip install lxml bs4 requests
```

### Common Patterns
```python
import requests, bs4

response = requests.get("https://example.com")
soup = bs4.BeautifulSoup(response.text, "lxml")

# Select by tag, ID, or class
title = soup.title.text
items = soup.select(".item-class") # All items with this class
container = soup.select("#main-id") # Item with this ID

# Nested selection
sub_items = soup.select("div > span") # Direct children
```

---

## 🤖 Advanced Scraping (Dynamic Content)

Required for modern JavaScript-heavy websites (React, Vue, SPAs) where content is loaded dynamically.

### 🔌 Selenium
Automates real browsers (Chrome, Firefox) to simulate user actions like clicks and scrolls.

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("https://example.com")

# Explicit Wait for dynamic elements
wait = WebDriverWait(driver, 10)
element = wait.until(EC.presence_of_element_located((By.ID, "loaded-content")))

print(driver.title)
driver.quit()
```

### 🎭 Playwright
A modern automation library with built-in auto-waiting, context isolation, and native support for Chromium, Firefox, and WebKit.

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://example.com")
    
    # Auto-waits for elements
    page.fill("#username", "myUser")
    page.click("button[type=submit]")
    
    # Take a screenshot of the final state
    page.screenshot(path="result.png")
    browser.close()
```

## 📝 Utility Comparison

| Feature | BeautifulSoup | Selenium | Playwright |
| :--- | :--- | :--- | :--- |
| **Speed** | ⚡ Extremely Fast | 🐢 Slow (Browser overhead) | 🚀 Fast |
| **JS Support** | ❌ No | ✅ Full | ✅ Full |
| **Auto-Wait** | ❌ No | ⚠️ Manual (Explicit) | ✅ Native |
| **Complexity** | Simple | Moderate | Moderate/Higher |
