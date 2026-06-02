import ollama
import json
import re
from app.utils.analysis_validator import (
    validate_analysis,
    normalize_priority
)


# ── Priority Rules ─────────────────────────────────────────────────────────────

PRIORITY_RULES = """
Priority must reflect the importance of the email to the user,
NOT the urgency of the marketing language.

HIGH PRIORITY EMAILS:

Security:
- New sign in detected / Password reset / Suspicious login
- Account compromise / Security alert

Finance:
- Payment failed / Invoice overdue / Subscription cancellation
- Banking notification / Refund issue

Career:
- Job interview / Recruiter response / Hiring process
- Internship opportunity / Offer letter

Academic:
- Assignment deadline / Examination notice
- University notification / Placement communication

Work:
- Client request / Manager communication / Production issue
- System outage / Escalation

Legal/Government:
- Tax notice / Government communication
- Compliance request / Official verification

=> HIGH priority

MEDIUM PRIORITY EMAILS:
- Meeting invitations / Event invitations / Follow-ups
- Personal emails / Team updates / Project updates
- Community notifications / Informational communications

=> MEDIUM priority

LOW PRIORITY EMAILS:
- Advertisements / Promotions / Discounts
- Marketing campaigns / Newsletters / Social media notifications
- Product recommendations / Blog updates / Shopping offers

=> LOW priority
"""

TASK_RULES = """
Extract actionable tasks whenever the email suggests an action.

Examples:

Email: "Apply for Amazon SDE Hiring Program"
Tasks:
[
  {
    "description": "Apply for Amazon SDE Hiring Program"
  }
]

Email: "Attend hiring session on Friday"
Tasks:
[
  {
    "description": "Attend hiring session"
  }
]

Email: "New sign in detected"
Tasks:
[
  {
    "description": "Review account activity"
  }
]

For newsletters and promotions:
tasks should usually be [].
"""

# ── Change 1: Added Calendar Rules ─────────────────────────────────────────────
CALENDAR_RULES = """
Detect calendar-worthy events.

Examples:

Interview:
- Interview scheduled on Monday
- Technical interview invitation

Meeting:
- Team meeting at 10 AM
- Project discussion tomorrow

Academic:
- Exam on Friday
- Assignment due on 15 June

Event:
- Webinar invitation
- Conference registration

If detected:
{
  "detected": true,
  "title": "Interview Scheduled",
  "date": "15 June 2026",
  "time": "10:00 AM"
}

Otherwise:
{
  "detected": false,
  "title": "",
  "date": "",
  "time": ""
}
"""

CATEGORY_RULES = """
You MUST use one of these exact categories (uppercase):

SECURITY / FINANCE / CAREER / ACADEMIC / WORK /
PERSONAL / PROMOTION / SOCIAL / SYSTEM / INFORMATIONAL / OTHER
"""

USER_CONTEXT = """
USER CONTEXT

The email owner is:

- Lakshya Kumar Singh
- Computer Science student
- Interested in AI
- Interested in Software Development
- Interested in Internships
- Interested in Job Opportunities

Priority must be determined from THIS user's perspective.

An email that is highly relevant to the user's goals should receive higher priority.
"""


VALID_CATEGORIES = {
    "SECURITY", "FINANCE", "CAREER", "ACADEMIC", "WORK",
    "PERSONAL", "PROMOTION", "SOCIAL", "SYSTEM", "INFORMATIONAL", "OTHER"
}

CATEGORY_MAPPING = {
    "TECHNICAL DOCUMENTATION": "ACADEMIC",
    "LEARNING RESOURCE":       "ACADEMIC",
    "NEWSLETTER":              "PROMOTION",
    "MARKETING":               "PROMOTION",
    "ADVERTISEMENT":           "PROMOTION",
}

def normalize_category(data):
    category = data.get("category", "OTHER").strip().upper()
    category = CATEGORY_MAPPING.get(category, category)
    if category not in VALID_CATEGORIES:
        category = "OTHER"
    data["category"] = category
    return data


def clean_email_body(body: str) -> str:
    body = re.sub(r"<[^>]+>", " ", body)
    body = re.sub(r"\s+", " ", body)
    return body[:2000]


# ── Main function ─────────────────────────────────────────────────────────────

def analyze_email(subject: str, body: str):

    body = clean_email_body(body)

    # Change 2 & 3: Injected CALENDAR_RULES and updated prompt response schema
    prompt = f"""
    You are VoxMail AI, an intelligent executive email assistant.

    Analyze the email and return ONLY valid JSON.

    {USER_CONTEXT}

    {PRIORITY_RULES}

    {TASK_RULES}

    {CALENDAR_RULES}

    {CATEGORY_RULES}

    Return JSON in exactly this format:

    {{
        "category": "",
        "priority": "",
        "summary": "",
        "tasks": [
            {{
                "description": ""
            }}
        ],
        "calendar_event": {{
            "detected": false,
            "title": "",
            "date": "",
            "time": ""
        }}
    }}

    Subject:
    {subject}

    Body:
    {body}
    """

    response = ollama.chat(
        model="qwen2.5:7b",
        format="json",
        messages=[
            {
                "role": "system",
                "content": """
    You are an email classification engine.

    You MUST ALWAYS return ONLY this schema:

    {
        "category": "",
        "priority": "",
        "summary": "",
        "tasks": [],
        "calendar_event": {}
    }

    Never return email_content, subject, body, html,
    content, metadata, or any reproduction of the email.
    Only classify it.
    """
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response["message"]["content"]

    # Remove markdown fences
    content = re.sub(r"```json|```", "", content).strip()

    try:
        analysis = json.loads(content)

        analysis = validate_analysis(analysis)
        analysis = normalize_priority(analysis)
        analysis = normalize_category(analysis)

        # Enforce that a baseline struct exists if AI returned calendar keys missing
        if "calendar_event" not in analysis:
            analysis["calendar_event"] = {
                "detected": False,
                "title": "",
                "date": "",
                "time": ""
            }

        return analysis

    except Exception as e:
        print("Analysis failed:", e)

        # Change 5: Safe structural fallback returning calendar options
        return {
            "category": "OTHER",
            "priority": "LOW",
            "summary": "Unable to classify.",
            "tasks": [],
            "calendar_event": {
                "detected": False,
                "title": "",
                "date": "",
                "time": ""
            }
        }