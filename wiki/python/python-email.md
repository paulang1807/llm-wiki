---
title: "Python Email Automation"
category: python
tags: [python, email, smtp, imap, automation]
sources: [raw/python/mail.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Python Email Automation

Python's standard library provides `smtplib` for sending emails and `imaplib` for receiving them.

## 🔑 Pre-Requisites
Most modern providers (like Gmail) require specific security setups:
- **App Passwords**: Generate a 16-character app password in your Google Account security settings.
- **IMAP Enablement**: Ensure IMAP is enabled in your email client's settings.

---

## 📤 Sending Emails (`smtplib`)

The `smtplib` module uses the Simple Mail Transfer Protocol (SMTP).

### Using SMTP with TLS (Port 587)
```python
import smtplib, getpass

# 1. Connect
server = smtplib.SMTP('smtp.gmail.com', 587)
server.ehlo()

# 2. Encrypt
server.starttls()
server.ehlo()

# 3. Login
email = input("Email: ")
password = getpass.getpass("Password: ")
server.login(email, password)

# 4. Send
msg = f"Subject: Python Test\n\nHello from Python!"
server.sendmail(email, "recipient@example.com", msg)

server.quit()
```

### Using SMTP with SSL (Port 465)
Using the `with` statement automatically handles the `quit()` command.
```python
import smtplib, ssl

context = ssl.create_default_context()
with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
    server.login(email, password)
    server.sendmail(email, recipient, "Subject: SSL Test\n\nBody")
```

---

## 📥 Receiving Emails (`imaplib`)

The `imaplib` module uses the Internet Message Access Protocol (IMAP).

### Basic Fetch Pattern
```python
import imaplib, email

M = imaplib.IMAP4_SSL('imap.gmail.com')
M.login(user, password)
M.select("inbox")

# Search for specific subjects
typ, data = M.search(None, 'SUBJECT "Python Mail Test"')

# Fetch the first match (data[0])
result, email_data = M.fetch(data[0], "(RFC822)")
raw_email = email_data[0][1].decode('utf-8')

# Parse content
msg = email.message_from_string(raw_email)
for part in msg.walk():
    if part.get_content_type() == "text/plain":
        print(part.get_payload(decode=True))

M.close()
M.logout()
```

### 🔍 IMAP Folders
You can list all available folders (Labels in Gmail) using `M.list()`. Common targets:
- `"INBOX"`
- `"[Gmail]/Sent Mail"`
- `"[Gmail]/Spam"`
- `"[Gmail]/Trash"`
