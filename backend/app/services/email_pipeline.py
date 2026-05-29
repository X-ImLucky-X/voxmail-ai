from app.agents.triage_agent import analyze_email
from app.agents.draft_agent import generate_replies


def process_email(subject: str, body: str):

    analysis = analyze_email(subject, body)

    drafts = generate_replies(body)

    return {
        "analysis": analysis,
        "drafts": drafts
    }