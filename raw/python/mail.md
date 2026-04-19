## Sending Mails using [smtplib](https://docs.python.org/3/library/smtplib.html#)
**Pre-Requisites**

- Configure email account as needed for use with python api calls
    - For gmail follow instructions [here](https://support.google.com/accounts/answer/185833?hl=en/)
- Find the smtp details for the mail client

!!! tip
    When specifying the port for creating the smtp object, if the msa port 587 results in an error, try using the smtps port 465. Port 587 uses TLS encryption

```python
import smtplib
import getpass

# Create SMTP object
server = smtplib.SMTP('smtp.gmail.com', 587)
# Establish connection
# Returns a tuple - If the first value in the tuple is 250
# it indicates a successful connection
server.ehlo()
# Returns (250, b'smtp.gmail.com at your service, [185.187.168.189]\nSIZE 35882577\n8BITMIME\nSTARTTLS\nENHANCEDSTATUSCODES\nPIPELINING\nCHUNKING\nSMTPUTF8')

# If using port 587, put connection in TLS mode
server.starttls()
# Returns (220, b'2.0.0 Ready to start TLS')

# Should call the ehlo method again after the starttls method
server.ehlo()
# Returns (250, b'smtp.gmail.com at your service, [185.187.168.189]\nSIZE 35882577\n8BITMIME\nAUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH\nENHANCEDSTATUSCODES\nPIPELINING\nCHUNKING\nSMTPUTF8')

# Get email and password
email = input("Enter your email: ")
password = getpass.getpass("Enter account password: ")

# Login
server.login(email, password)
# Returns (235, b'2.7.0 Accepted')

# Get message details
from_address = email
to_address = input("Enter the email of the recipient: ")
subject = input("Enter the subject: ")
message = input("Enter the message to send: ")
msg = "Subject: " + subject + '\n' + message

# Send email
server.sendmail(from_address,to_address,msg)
# Returns {}

server.quit()
```

??? abstract "Using WITH statement"
    When using the `WITH` statement, the SMTP QUIT command is issued automatically when the `WITH` statement exits
    ```python
    import smtplib
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(email, password)
        server.sendmail(from_address,to_address,msg)
    ```

??? abstract "Using SSL"
    - Using `SMTP_SSL()` initiates a TLS-encrypted connection 
    - Default context of ssl validates the host name and its certificates
        - Optimizes the security of the connection
    ```python
    import smtplib, ssl
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
        server.login(email, password)
        server.sendmail(from_address,to_address,msg)
    ```


## Receiving Mails with [imaplib](https://docs.python.org/3/library/imaplib.html#)

[IMAP Search Criteria Documentation](https://python-sage-imap.readthedocs.io/en/stable/getting_started/search.html)
```python
import imaplib
import email

# Create IMAP object
M = imaplib.IMAP4_SSL('imap.gmail.com')
# Login
M.login(email,password)
# Returns ('OK', [b'xxxxxxxxxxxx@gmail.com authenticated (Success)'])

M.list()
# Returns list of all folders and subfolders:
# b'(\\HasChildren) "/" "ParentFolder1"'
# b'(\\HasNoChildren) "/" "ParentFolder1/ChildFolder1"'
# b'(\\HasNoChildren) "/" "ParentFolder1/ChildFolder2"'
# b'(\\HasNoChildren) "/" "ParentFolder2"'
# b'(\\HasNoChildren) "/" "INBOX"'
# b'(\\HasChildren \\Noselect) "/" "[Gmail]"'
# b'(\\All \\HasNoChildren) "/" "[Gmail]/All Mail"'
# b'(\\Drafts \\HasNoChildren) "/" "[Gmail]/Drafts"'
# b'(\\HasNoChildren \\Important) "/" "[Gmail]/Important"'
# b'(\\HasNoChildren \\Sent) "/" "[Gmail]/Sent Mail"'
# b'(\\HasNoChildren \\Junk) "/" "[Gmail]/Spam"'
# b'(\\Flagged \\HasNoChildren) "/" "[Gmail]/Starred"'
# b'(\\HasNoChildren \\Trash) "/" "[Gmail]/Trash"'

# Select the folder to check for mail
M.select("inbox")
# Returns ('OK', [b'9285'])

# Search for the email
typ,data = M.search(None,'SUBJECT "Python Mail Test"')
typ
# Returns 'OK'
data
# Returns [b'9285']

# Fetch the search result
# RFC822 is the message format
# See https://datatracker.ietf.org/doc/html/rfc822.html
result, email_data = M.fetch(data[0],"(RFC822)")
raw_email = email_data[0][1]
raw_email
# Returns b'Bcc: xxxxxx@gmail.com\r\nReturn-Path: <xxxxxx@gmail.com>\r\nReceived: from 1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.ip6.arpa ([185.187.168.189])\r\n        by smtp.gmail.com with ESMTPSA id xxxx-yyyy.164.2024.11.27.19.03.01\r\n        for <xxxxxx@gmail.com>\r\n        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);\r\n        Wed, 27 Nov 2024 19:03:02 -0800 (PST)\r\nMessage-ID: <aaaa.bbbb.cccc.dddd.google.com>\r\nDate: Wed, 27 Nov 2024 19:03:02 -0800 (PST)\r\nFrom: xxxxxx@gmail.com\r\nSubject: Python Mail Test\r\n\r\nThis is a test\r\n'

# Set encoding and extract the email body
raw_email_string = raw_email.decode('utf-8')
email_message = email.message_from_string(raw_email_string)
for part in email_message.walk():
    if part.get_content_type() in ["text/plain","text/html"]:
        body = part.get_payload(decode=True)
        print(body)
# Returns
# Part: text/plain
# b'This is a test\r\n'

M.close()
# Returns ('OK', [b'Returned to authenticated state. (Success)'])
M.logout()
# Returns ('BYE', [b'LOGOUT Requested'])
```

??? abstract "Using WITH statement"
    When using the `WITH` statement, the IMAP4 LOGOUT command is issued automatically when the `WITH` statement exits
    ```python
    import imtplib
    with imaplib.IMAP4_SSL('imap.gmail.com') as M:
        M.login(email,password)
        M.select("inbox")
        typ,data = M.search(None,'SUBJECT "Python Mail Test"')
        result, email_data = M.fetch(data[0],"(RFC822)")
        raw_email = email_data[0][1]
        raw_email
    ```

*[msa]: Message Submission Agent
*[smtps]: Simple Mail Transfer Protocol Secure
*[TLS]: Transport Layer Security