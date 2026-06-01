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

# ── Change 4: Improved task extraction examples (AI-driven, no forced rules) ──

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

CATEGORY_RULES = """
You MUST use one of these exact categories (uppercase):

SECURITY / FINANCE / CAREER / ACADEMIC / WORK /
PERSONAL / PROMOTION / SOCIAL / SYSTEM / INFORMATIONAL / OTHER
"""

# ── Change 3: User context for AI-driven priority ──────────────────────────────

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


# ── Fix 2 & 3: Category enum + normalization ──────────────────────────────────

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


# ── Fix 1 & 8: Clean + truncate email body ────────────────────────────────────

def clean_email_body(body: str) -> str:
    body = re.sub(r"<[^>]+>", " ", body)
    body = re.sub(r"\s+", " ", body)
    return body[:2000]


# ── Main function ─────────────────────────────────────────────────────────────

def analyze_email(subject: str, body: str):

    # Fix 1 & 8: clean and truncate before anything else
    body = clean_email_body(body)

    # Change 3: User context included in prompt
    prompt = f"""
    You are VoxMail AI, an intelligent executive email assistant.

    Analyze the email and return ONLY valid JSON.

    {USER_CONTEXT}

    {PRIORITY_RULES}

    {TASK_RULES}

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
        ]
    }}

    Subject:
    {subject}

    Body:
    {body}
    """

    # Change 1: Removed preclassify() call and hint injection

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
        "tasks": []
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

        # Change 2: Removed forced empty tasks for LOW priority emails
        # AI decides tasks based on content, not priority level

        return analysis

    except Exception as e:

        print("Analysis failed:", e)

        # Fix 4: no repair call — return safe fallback immediately
        return {
            "category": "OTHER",
            "priority": "LOW",
            "summary": "Unable to classify.",
            "tasks": []
        }