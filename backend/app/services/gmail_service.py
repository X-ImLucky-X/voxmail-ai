from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os
import base64

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly"
]


def get_gmail_service():

    creds = None

    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file(
            "token.json",
            SCOPES
        )

    if not creds:

        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json",
            SCOPES
        )

        creds = flow.run_local_server(port=0)

        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return build(
        "gmail",
        "v1",
        credentials=creds
    )


def get_recent_emails():

    service = get_gmail_service()

    results = (
        service.users()
        .messages()
        .list(
            userId="me",
            maxResults=10
        )
        .execute()
    )

    return results.get("messages", [])

def get_email_content(message_id):

    service = get_gmail_service()

    message = (
        service.users()
        .messages()
        .get(
            userId="me",
            id=message_id
        )
        .execute()
    )

    payload = message["payload"]

    headers = payload.get("headers", [])

    subject = ""

    for header in headers:
        if header["name"] == "Subject":
            subject = header["value"]

    body = ""

    if "parts" in payload:

        for part in payload["parts"]:

            if part["mimeType"] == "text/plain":

                data = part["body"].get("data")

                if data:

                    body = base64.urlsafe_b64decode(
                        data
                    ).decode("utf-8")

                    break

    return {
        "id": message_id,
        "subject": subject,
        "body": body
    }

def get_email_preview(message_id):

    service = get_gmail_service()

    msg = (
        service.users()
        .messages()
        .get(
            userId="me",
            id=message_id,
            format="metadata",
            metadataHeaders=["Subject", "From"]
        )
        .execute()
    )

    headers = msg["payload"]["headers"]

    subject = "No Subject"
    sender = "Unknown"

    for h in headers:
        if h["name"] == "Subject":
            subject = h["value"]

        if h["name"] == "From":
            sender = h["value"]

    return {
        "id": message_id,
        "subject": subject,
        "sender": sender
    }

def get_recent_email_previews():

    emails = get_recent_emails()

    return [
        get_email_preview(
            email["id"]
        )
        for email in emails
    ]