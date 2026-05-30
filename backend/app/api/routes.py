from fastapi import APIRouter
from app.models.email_models import EmailInput
from app.agents.triage_agent import analyze_email
from app.agents.draft_agent import generate_replies
from app.models.email_models import DraftRequest
from app.services.email_pipeline import process_email
from app.services.gmail_service import get_recent_email_previews, get_recent_emails, send_email
from app.services.gmail_service import (
    get_recent_emails,
    get_email_content
)
from pydantic import BaseModel
from app.services.style_memory import save_reply
from pydantic import BaseModel
from app.services.email_pipeline import process_email
class SaveStyleRequest(BaseModel):
    reply: str
class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str

class ReplyEmailRequest(BaseModel):
    to: str
    subject: str
    body: str

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

@router.post("/send-email")
async def send_email_route(
    request: SendEmailRequest
):
    result = send_email(
        request.to,
        request.subject,
        request.body
    )

    return {
        "success": True,
        "message_id": result["id"]
    }

@router.post("/save-style")
async def save_style(
    request: SaveStyleRequest
):

    save_reply(
        request.reply
    )

    return {
        "success": True
    }

@router.post("/reply-email")
async def reply_email(
    request: ReplyEmailRequest
):

    result = send_email(
        request.to,
        request.subject,
        request.body
    )

    return {
        "success": True,
        "message_id": result["id"]
    }