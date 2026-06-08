from fastapi import APIRouter, Depends  
from pydantic import BaseModel
from app.services.task_service import (
    is_completed,
    toggle_task,
    generate_deterministic_task_id,
)
from app.services.supabase_service import supabase
from app.models.email_models import EmailInput, DraftRequest
from app.agents.triage_agent import analyze_email
from app.agents.draft_agent import generate_replies
from app.services.email_pipeline import process_email
from app.services.gmail_service import (
    get_recent_email_previews,
    get_recent_emails,
    get_email_content,
    send_email,
)
from app.services.style_memory import save_reply
from app.services.cache_service import (
    get_cached_email,
    cache_email,
)
from app.services.auth_service import get_current_user_id

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


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id)):
    return {
        "user_id": user_id
    }


@router.post("/triage")
async def triage(email: EmailInput):
    result = analyze_email(
        email.subject,
        email.body
    )
    return result


@router.post("/draft")
async def draft(request: DraftRequest, user_id: str = Depends(get_current_user_id)):
    result = generate_replies(
        request.email,
        user_id
    )
    return result


@router.post("/process-email")
async def process(email: EmailInput, user_id: str = Depends(get_current_user_id)):
    return process_email(
        email.subject,
        email.body,
        user_id
    )


@router.get("/emails")
async def emails(user_id: str = Depends(get_current_user_id)):
    return get_recent_emails()


# Step 4 — Update routes.py (Process Email Route)
@router.get("/emails/{message_id}/process")
async def process_gmail_email(message_id: str, user_id: str = Depends(get_current_user_id)):
    email = get_email_content(message_id)
    
    # Updated to pass both message_id and user_id to partition cache read
    cached = get_cached_email(message_id, user_id)

    if (
        cached
        and cached.get("analysis") is not None
        and cached.get("drafts") is not None
    ):
        return {
            "email": email,
            "analysis": cached["analysis"],
            "drafts": cached["drafts"]
        }

    result = process_email(
        email["subject"],
        email["body"],
        user_id
    )

    # Updated to pass both message_id and user_id to partition cache write
    cache_email(
        message_id,
        user_id,
        {
            "analysis": result["analysis"],
            "drafts": result["drafts"]
        }
    )

    return {
        "email": email,
        "analysis": result["analysis"],
        "drafts": result["drafts"]
    }


# Step 5 — Update Inbox Route
@router.get("/inbox")
async def inbox(user_id: str = Depends(get_current_user_id)):
    emails = get_recent_email_previews()

    for email in emails:
        # Updated to filter cached reads by message_id and user_id context
        cached = get_cached_email(email["id"], user_id)

        if cached:
            email["priority"] = (
                cached["analysis"]
                .get(
                    "priority",
                    "Low"
                )
            )
        else:
            email_data = (
                get_email_content(
                    email["id"]
                )
            )

            analysis = analyze_email(
                email_data["subject"],
                email_data["body"]
            )

            # Updated to write to localized cache using message_id and user_id context
            cache_email(
                email["id"],
                user_id,
                {
                    "analysis": analysis,
                    "drafts": None
                }
            )

            email["priority"] = (
                analysis.get(
                    "priority",
                    "Low"
                )
            )

    return emails


@router.post("/send-email")
async def send_email_route(
    request: SendEmailRequest,
    user_id: str = Depends(get_current_user_id)
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
    request: SaveStyleRequest,
    user_id: str = Depends(get_current_user_id)  
):
    save_reply(
        request.reply,
        user_id  
    )

    return {
        "success": True
    }


@router.post("/reply-email")
async def reply_email(
    request: ReplyEmailRequest,
    user_id: str = Depends(get_current_user_id)
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


@router.get("/dashboard")
async def dashboard(user_id: str = Depends(get_current_user_id)):  
    emails = get_recent_email_previews()

    high = 0
    medium = 0
    low = 0
    total_tasks = 0
    completed_count = 0

    for email in emails:
        # Updated to parse user isolated cache lines during dashboard computation loops
        cached = get_cached_email(email["id"], user_id)

        if not cached:
            continue

        analysis = cached.get("analysis", {})
        email_tasks = analysis.get("tasks", [])
        
        total_tasks += len(email_tasks)

        for task in email_tasks:
            task_description = task.get("description", "")
            task_id = generate_deterministic_task_id(email["id"], task_description)
            
            if is_completed(task_id, user_id):  
                completed_count += 1

        priority = analysis.get("priority", "").lower()

        if priority == "high":
            high += 1
        elif priority == "medium":
            medium += 1
        else:
            low += 1

    pending_tasks = total_tasks - completed_count

    return {
        "total": len(emails),
        "high": high,
        "medium": medium,
        "low": low,
        "tasks_pending": pending_tasks,
        "tasks_completed": completed_count
    }


@router.get("/tasks")
async def get_tasks(user_id: str = Depends(get_current_user_id)):  
    emails = get_recent_email_previews()
    tasks = []

    for email in emails:
        # Updated to parse user isolated cache lines during tasks checklist loops
        cached = get_cached_email(email["id"], user_id)

        if not cached:
            continue

        analysis = cached.get(
            "analysis",
            {}
        )

        email_tasks = analysis.get(
            "tasks",
            []
        )

        for task in email_tasks:
            task_description = task.get("description", "")
            task_id = generate_deterministic_task_id(email["id"], task_description)

            tasks.append(
                {
                    "task_id": task_id,
                    "task": task_description,
                    "priority": analysis.get(
                        "priority",
                        "LOW"
                    ),
                    "subject": email.get(
                        "subject",
                        ""
                    ),
                    "email_id": email["id"],
                    "completed": is_completed(
                        task_id,
                        user_id  
                    )
                }
            )

    return tasks


@router.post("/tasks/{task_id}/toggle")
async def toggle_task_status(
    task_id: str,
    user_id: str = Depends(get_current_user_id)  
):
    completed = toggle_task(
        task_id,
        user_id  
    )

    return {
        "completed": completed
    }