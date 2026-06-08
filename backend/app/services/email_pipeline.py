from app.agents.triage_agent import analyze_email
from app.agents.draft_agent import generate_replies


def process_email(subject: str, body: str, user_id: str):
    """
    Orchestrates email evaluation and variant response drafting.
    Accepts user_id context to satisfy the updated draft agent signature.
    """
    analysis = analyze_email(subject, body)

    # Fix #2 Verified: Passed down user_id to avoid positional argument mismatch crashes
    drafts = generate_replies(body, user_id)

    return {
        "analysis": analysis,
        "drafts": drafts
    }