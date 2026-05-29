import json
import os

EMAIL_FILE = "data/emails.json"


def get_style_context(email_body=None):

    if not os.path.exists(EMAIL_FILE):
        return ""

    try:
        with open(EMAIL_FILE, "r", encoding="utf-8") as f:
            emails = json.load(f)

        examples = [
            item["email"]
            for item in emails[:3]
            if "email" in item
        ]

        return "\n\n".join(examples)

    except Exception:
        return ""