from fastapi import APIRouter
from app.models.email_models import EmailInput
from app.agents.triage_agent import analyze_email
from app.agents.draft_agent import generate_replies
from app.models.email_models import DraftRequest
from app.services.email_pipeline import process_email
from app.services.gmail_service import get_recent_email_previews, get_recent_emails
from app.services.gmail_service import (
    get_recent_emails,
    get_email_content
)

from app.services.email_pipeline import process_email

router = APIRouter()

@router.post("/triage")
async def triage(email: EmailInput):

    result = analyze_email(
        email.subject,
        email.body
    )

    return result

@router.post("/draft")
async def draft(request: DraftRequest):

    result = generate_replies(
        request.email
    )

    return result

@router.post("/process-email")
async def process(email: EmailInput):

    return process_email(
        email.subject,
        email.body
    )

@router.get("/emails")
async def emails():
    return get_recent_emails()

@router.get("/emails/{message_id}/process")
async def process_gmail_email(message_id: str):

    email = get_email_content(message_id)

    result = process_email(
        email["subject"],
        email["body"]
    )

    return {
        "email": email,
        "analysis": result["analysis"],
        "drafts": result["drafts"]
    }

@router.get("/inbox")
async def inbox():
    return get_recent_email_previews()