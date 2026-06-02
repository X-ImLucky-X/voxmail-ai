from fastapi import APIRouter
from pydantic import BaseModel
from app.services.task_service import (
    load_tasks,
    is_completed,
    toggle_task
)
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
import json
import os

CACHE_FILE = "data/email_cache.json"


def load_cache():
    if not os.path.exists(CACHE_FILE):
        return {}
    with open(CACHE_FILE, "r") as f:
        return json.load(f)


def save_cache(cache):
    os.makedirs(
        os.path.dirname(CACHE_FILE),
        exist_ok=True
    )
    with open(CACHE_FILE, "w") as f:
        json.dump(
            cache,
            f,
            indent=2
        )


def get_cached_email(email_id):
    cache = load_cache()
    return cache.get(email_id)


def cache_email(email_id, data):
    cache = load_cache()
    cache[email_id] = data
    save_cache(cache)


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

    # Major Fix: Return early if both analysis and drafts are cached
    cached = get_cached_email(message_id)

    if (
        cached
        and "analysis" in cached
        and "drafts" in cached
    ):
        return {
            "email": email,
            "analysis": cached["analysis"],
            "drafts": cached["drafts"]
        }

    # Not fully cached — run full pipeline
    result = process_email(
        email["subject"],
        email["body"]
    )

    # Cache both analysis and drafts together
    cache_email(
        message_id,
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


@router.get("/inbox")
async def inbox():
    emails = get_recent_email_previews()

    for email in emails:
        cached = get_cached_email(
            email["id"]
        )

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

            cache_email(
                email["id"],
                {
                    "analysis": analysis
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


@router.get("/dashboard")
async def dashboard():
    emails = get_recent_email_previews()

    high = 0
    medium = 0
    low = 0
    total_tasks = 0

    # Calculate completed task flags
    completed_tasks = load_tasks()
    completed_count = sum(
        1 for value in completed_tasks.values() if value
    )

    for email in emails:
        cached = get_cached_email(email["id"])

        if not cached:
            continue

        analysis = cached.get("analysis", {})
        
        # Count total tasks found inside this cached email's payload
        total_tasks += len(analysis.get("tasks", []))

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
async def get_tasks():
    emails = get_recent_email_previews()
    tasks = []

    for email in emails:
        cached = get_cached_email(
            email["id"]
        )

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

        for index, task in enumerate(email_tasks):
            task_id = f"{email['id']}_{index}"

            tasks.append(
                {
                    "task_id": task_id,
                    "task": task.get(
                        "description",
                        ""
                    ),
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
                        task_id
                    )
                }
            )

    return tasks


@router.post(
    "/tasks/{task_id}/toggle"
)
async def toggle_task_status(
    task_id: str
):
    completed = toggle_task(
        task_id
    )

    return {
        "completed": completed
    }