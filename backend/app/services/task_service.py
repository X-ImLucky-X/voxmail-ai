import hashlib
from app.services.supabase_service import supabase


def generate_deterministic_task_id(email_id: str, task_description: str) -> str:
    """
    Generates a unique, persistent MD5 hash bound directly to the task content 
    and source email. Prevents array index shifting mismatches.
    """
    cleaned_desc = (task_description or "").strip()
    seed_string = f"{email_id}-{cleaned_desc}"
    return hashlib.md5(seed_string.encode("utf-8")).hexdigest()


def is_completed(
    task_id: str,
    user_id: str
):
    response = (
        supabase
        .table("task_completion")
        .select("completed")
        .eq("task_id", task_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return False

    return (
        response
        .data[0]
        .get(
            "completed",
            False
        )
    )


def toggle_task(
    task_id: str,
    user_id: str
):
    current = is_completed(
        task_id,
        user_id
    )

    new_status = not current

    (
        supabase
        .table("task_completion")
        .upsert(
            {
                "task_id": task_id,
                "user_id": user_id,
                "completed": new_status,
            }
        )
        .execute()
    )

    return new_status