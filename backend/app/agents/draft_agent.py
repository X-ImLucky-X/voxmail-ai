import json
import re
import ollama

from app.services.style_memory import (
    get_style_examples
)


# ── Fix 1: Same user context as triage_agent ──────────────────────────────────

USER_CONTEXT = """
The email owner is:

- Lakshya Kumar Singh
- Computer Science student
- Interested in AI
- Interested in Software Development
- Interested in Internships
- Interested in Job Opportunities
"""


# ── Fix 2: Clean email body (same as triage_agent) ────────────────────────────

def clean_email_body(body: str) -> str:
    body = re.sub(r"<[^>]+>", " ", body)
    body = re.sub(r"\s+", " ", body)
    return body[:2000]


def generate_replies(email_body: str):

    # Fix 2: Clean before passing to model
    email_body = clean_email_body(email_body)

    style_examples = get_style_examples()

    prompt = f"""
You are VoxMail AI.

{USER_CONTEXT}

Your task:

1. Determine whether the email requires a reply.
2. If a reply is NOT needed:
   - Set reply_needed to false.
   - Explain why.
   - Leave reply fields empty.
3. If a reply IS needed:
   - Generate three replies:
       - short_reply
       - professional_reply
       - detailed_reply

Important:

Emails that typically DO NOT need replies:

- Security notifications
- Login alerts
- Password reset confirmations
- Marketing emails
- Promotional emails
- Newsletters
- Social media notifications
- Automated system notifications
- Subscription receipts
- Order confirmations

Emails that typically DO need replies:

- Personal emails
- Recruiter emails
- Job opportunities
- Client communications
- Team communications
- Interview scheduling
- Academic discussions
- Requests for information
- Follow-ups

Writing Rules:

- Write as Lakshya Kumar Singh.
- Never use placeholders.
- Never use:
  [Your Name]
  [Company Name]
  [Your Position]

- Do not invent personal details.
- Do not invent job titles.
- Do not mention being an AI assistant.
- Keep replies natural.
- End naturally with:

Best regards,
Lakshya

Writing style examples:

{style_examples}

Incoming Email:

{email_body}

Return ONLY valid JSON.

{{
  "reply_needed": true,
  "reason": "",
  "short_reply": "",
  "professional_reply": "",
  "detailed_reply": ""
}}
"""

    try:

        print("\n========== EMAIL BODY ==========")
        print(email_body[:1000])
        print("================================\n")

        response = ollama.chat(
            model="qwen2.5:7b",
            format="json",
            messages=[
                # Fix 3: Added system prompt to prevent "I am an AI" responses
                {
                    "role": "system",
                    "content": """
You are an intelligent email reply assistant.

You must return ONLY valid JSON.

You must never explain yourself.

You must never say:
'I am an AI assistant'

You must never generate placeholders.

You must follow the requested schema exactly.
"""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        content = (
            response["message"]["content"]
        )

        print(
            "\n========== RAW MODEL OUTPUT =========="
        )
        print(content)
        print(
            "======================================\n"
        )

        parsed = json.loads(content)

        print(
            "\n========== PARSED JSON =========="
        )
        print(parsed)
        print(
            "=================================\n"
        )

        return {
            "reply_needed": parsed.get(
                "reply_needed",
                True
            ),

            "reason": parsed.get(
                "reason",
                ""
            ),

            "short_reply": parsed.get(
                "short_reply",
                ""
            ),

            "professional_reply": parsed.get(
                "professional_reply",
                ""
            ),

            "detailed_reply": parsed.get(
                "detailed_reply",
                ""
            )
        }

    except Exception as e:

        print(
            "Reply generation error:",
            e
        )

        return {
            "reply_needed": False,
            "reason":
                "Reply generation failed.",
            "short_reply": "",
            "professional_reply": "",
            "detailed_reply": ""
        }