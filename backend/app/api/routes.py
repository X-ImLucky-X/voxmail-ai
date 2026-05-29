from fastapi import APIRouter
from app.models.email_models import EmailInput
from app.agents.triage_agent import analyze_email
from app.agents.draft_agent import generate_replies
from app.models.email_models import DraftRequest
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