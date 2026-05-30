from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

import os
import base64

from email.mime.text import MIMEText

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send"
]


def get_gmail_service():

    creds = None

    if os.path.exists("token.json"):

        creds = Credentials.from_authorized_user_file(
            "token.json",
            SCOPES
        )

    if creds and creds.expired and creds.refresh_token:

        creds.refresh(Request())

        with open("token.json", "w") as token:
            token.write(creds.to_json())

    if not creds or not creds.valid:

        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json",
            SCOPES
        )

        creds = flow.run_local_server(
            port=0
        )

        with open("token.json", "w") as token:
            token.write(
                creds.to_json()
            )

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

    return results.get(
        "messages",
        []
    )


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

    payload = message.get(
        "payload",
        {}
    )

    headers = payload.get(
        "headers",
        []
    )

    subject = ""
    sender = ""

    for header in headers:

        if header["name"] == "Subject":
            subject = header["value"]

        elif header["name"] == "From":
            sender = header["value"]

    body = ""

    if "parts" in payload:

        for part in payload["parts"]:

            if (
                part.get("mimeType")
                == "text/plain"
            ):

                data = (
                    part["body"]
                    .get("data")
                )

                if data:

                    body = (
                        base64
                        .urlsafe_b64decode(
                            data
                        )
                        .decode(
                            "utf-8",
                            errors="ignore"
                        )
                    )

                    break

    else:

        data = (
            payload
            .get("body", {})
            .get("data")
        )

        if data:

            body = (
                base64
                .urlsafe_b64decode(
                    data
                )
                .decode(
                    "utf-8",
                    errors="ignore"
                )
            )

    return {
        "id": message_id,
        "subject": subject,
        "sender": sender,
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
            metadataHeaders=[
                "Subject",
                "From"
            ]
        )
        .execute()
    )

    headers = (
        msg["payload"]
        .get(
            "headers",
            []
        )
    )

    subject = "No Subject"
    sender = "Unknown"

    for header in headers:

        if (
            header["name"]
            == "Subject"
        ):
            subject = (
                header["value"]
            )

        elif (
            header["name"]
            == "From"
        ):
            sender = (
                header["value"]
            )

    return {
        "id": message_id,
        "subject": subject,
        "sender": sender
    }


def get_recent_email_previews():

    emails = get_recent_emails()

    previews = []

    for email in emails:

        previews.append(
            get_email_preview(
                email["id"]
            )
        )

    return previews


def send_email(
    to: str,
    subject: str,
    body: str
):

    service = get_gmail_service()

    message = MIMEText(body)

    message["to"] = to
    message["subject"] = subject

    raw = (
        base64
        .urlsafe_b64encode(
            message.as_bytes()
        )
        .decode()
    )

    sent_message = (
        service.users()
        .messages()
        .send(
            userId="me",
            body={
                "raw": raw
            }
        )
        .execute()
    )

    return sent_message