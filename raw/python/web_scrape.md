!!! danger "Responsible Web Scraping"

    - Always check the website’s **robots.txt** file and terms of service before you start scraping 
        - Understand all applicable restrictions w.r.t scraping or frequency of requests
    - Sending too many requests at once can slow down the website and affect other users 
        - Use throttling and rate limiting
        - Use residential proxies for web scraping

## Basic Web Scraping
### Packages
- [lxml](https://lxml.de/)
    - Library or processing XML and HTML in python
- [Beautiful Soup](https://beautiful-soup-4.readthedocs.io/en/latest/)
    - Library for pulling data out of HTML and XML files

### Setup
```bash
pip install lxml
pip install bs4 # Beautiful Soup
```

### Grabbing HTML elements
!!! example "Usage"
    [Beautiful Soup HTML Tree Navigation](https://beautiful-soup-4.readthedocs.io/en/latest/#navigating-the-tree)
    ```python
    # Get web page html content
    response = requests.get("page_url")
    raw_html = response.text
    # This returns the html content for the webpage
    # similar to what we see on inspecting the webpage
    # The above content is returned as an unstructured string

    # Convert the unstructured string to a structured html content
    structured_html = bs4.BeautifulSoup(raw_html, "lxml")

    # Get all elements for a tag
    tag_elements = structured_html.tag_name
    tag_elements.contents
    # This returns a list of all occurences of the tag in the page

    # Get all elements for an id
    tag_elements = structured_html.select("#id_name")
    
    # Get all elements for a class
    # If the class name has a space, replace it with a dot in the select statement
    tag_elements = structured_html.select(".class_name")
    # Get attributes and children for each element
    for tag_element in tag_elements:
        tag_element.attrs
        tag_element.contents   # same as list(tag_element.children)

    # Get any elements named <tag2> that are within an element named <tag1>
    tag_elements = structured_html.select('tag1 tag2')

    # Get any elements named <tag2> that are directly within an element named <tag1>, with no other element in between
    tag_elements = structured_html.select('tag1 > tag2')

    # Get the content of the first occurence of the tag
    tag_content = tag_elements[0].getText()
    ```

??? abstract "Sample Code"
    ```python
    import requests
    import bs4
    import re

    response = requests.get("https://en.wikipedia.org/wiki/Sholay")
    raw_html = response.text

    structured_html = bs4.BeautifulSoup(raw_html, "lxml")
    tag_elements = structured_html.title
    # returns [<title>Sholay - Wikipedia</title>]

    tag_content = tag_elements.contents[0]
    # tag_elements[0].getText() and tag_elements[0].text also return the same result as above
    # returns 'Sholay - Wikipedia'

    # Get list of all items with class "mw-heading"
    class_elements = structured_html.select(".mw-heading")
    for textval in class_elements:
        print(textval.text)
    ```

## Advanced Web Scraping
Some of the newer and more dynamicand interactive websites built using technologies such as javascript require additional packages for scraping to work efficiently. Some of the commonly used packages are:

### [Selenium](https://www.selenium.dev/documentation/)

Enables automation of real browser actions and extract data from even the most dynamic sites and Single Page Application (SPA) frameworks.

- Requires a [WebDriver](https://www.selenium.dev/documentation/webdriver/) to interact with browsers. 

    - WebDrivers are specific to each browser (ChromeDriver for Google Chrome, GeckoDriver for Firefox, etc.)

#### Setup
```bash
pip install selenium
pip install webdriver-manager
```

- Download relevant WebDriver
- Ensure it is accessible through your system’s PATH
    - Alternatively, specify the WebDriver’s path directly in script

!!! example "Usage"
    ```python
    # Import the Required Libraries
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    # Imports needed to wait for content
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    # Service
    # Make sure to replace 'path/to/chromedriver' with the actual path to your ChromeDriver
    driver_path='path/to/chromedriver'
    if driver_path:
        service = Service(executable_path=driver_path)
    else:
        service = Service() 

    # Set up options
    options = Options()
    options.headless = True      # For headless browsing

    # Set Up the WebDriver
    driver = webdriver.Chrome(service=service, options=options)  # Or Firefox() Or Edge()

    # Open the Web Page
    driver.get("https://www.google.com")

    # Fill out search forms or click buttons
    search_box = driver.find_element(By.NAME, "search")
    search_box.send_keys("web scraping")
    search_box.submit()

    # Locate the input fields and submit button
    username = driver.find_element(By.NAME, 'username')
    password = driver.find_element(By.NAME, 'password')
    submit_button = driver.find_element(By.ID, 'submit')
    # Enter data into the form fields
    username.send_keys("myUsername")
    password.send_keys("myPassword")
    # Click the submit button
    submit_button.click()
    # Wait for the next page to load
    time.sleep(3)

    # Wait for Content to Load (if needed)
    wait = WebDriverWait(driver, 10)     # Explicit Wait
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "name-of-the-class")))     # Wait for specific class
    wait.until(EC.presence_of_element_located((By.ID, "id-of-the-element")))

    # For pages with scroll
    # Execute script to scroll to bottom
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")     
    # Alternately scroll down the page
    driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.END)

    # Interact with the Web Page
    print(driver.title)

    # Find elements by class name
    element1 = driver.find_elements(By.CLASS_NAME, 'name-of-the-class')
    for elements in element1:
        print(<element names>)

    # Handling pop ups - Find and close pop-ups
    try:
        close_button = driver.find_element(By.CLASS_NAME, "name-of-the-close-popup-class")
        close_button.click()
    except:
        pass  # No pop-up found

    # Handling an alert pop-up
    alert = driver.switch_to.alert
    alert.accept() # To accept the alert
    # alert.dismiss() # To dismiss the alert

    # Close the Browser
    driver.quit()
    ```

### [Playwright](https://playwright.dev)

Designed with modern web technologies in mind, offering better support for features like shadow DOM, web components etc. and supports Chromium, Firefox, and WebKit, giving more flexibility in testing across different browsers.

- Provides a consistent and intuitive API, making it easier to write and maintain scripts.
- Includes smarter built-in waiting mechanisms, which helps in dealing with dynamic content and avoiding flakiness

#### Setup
```bash
pip install playwright
```

!!! example "Usage"
    ```python
    # Import the Required Libraries
    from playwright.sync_api import sync_playwright

    with sync_playwright() as playwright:
        # Launch Chromium headless browser
        browser = playwright.firefox.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # Fill out a login form
        page.fill("#username", "myUsername")
        page.fill("#password", "myPassword")
        page.click("button[type=submit]")

        # Wait for navigation after login
        page.wait_for_navigation()

        ## Wait for a specific network response
        # page.wait_for_response(lambda response: "api/data" in response.url and response.status == 200)

        # Wait for content to load (if needed)
        page.wait_for_timeout(1000)     # explicit wait

        # Wait for a specific element to appear
        page.wait_for_selector("body")
        content = page.query_selector("body")
        body = content.inner_text()

        page.wait_for_selector("#id-of-the-element")
        element_content = page.inner_text("#id-of-the-element")

        # For pages with scroll
        # Execute script to scroll to bottom
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

        # Get full page content
        content = page.content()

        # Get title
        title = page.title()

        # Take screenshot and save to path
        page.screenshot(path="screenshot.png", full_page=True)
        browser.close()
    ```

## Code Snippets

- [Colab - Basic Scraping](https://colab.research.google.com/drive/1CyyIwlQ-3PRjC-eeV4ur58Lh6zcghVel#scrollTo=FqkazftJN7kP)
- [Colab - Advanced Scraping - Selenium](https://colab.research.google.com/drive/1CyyIwlQ-3PRjC-eeV4ur58Lh6zcghVel#scrollTo=EnAmEoGBRF7j)
- [Colab - Advanced Scraping - Playwright](https://colab.research.google.com/drive/1CyyIwlQ-3PRjC-eeV4ur58Lh6zcghVel#scrollTo=Z6VHtkyPsW_y)