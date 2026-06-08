from app.services.supabase_service import supabase


def get_cached_email(
    email_id: str,
    user_id: str
):
    response = (
        supabase
        .table("email_analysis")
        .select("*")
        .eq("email_id", email_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return None

    row = response.data[0]

    return {
        "analysis": row.get("analysis"),
        "drafts": row.get("drafts")
    }


def cache_email(
    email_id: str,
    user_id: str,
    data: dict
):
    (
        supabase
        .table("email_analysis")
        .upsert(
            {
                "email_id": email_id,
                "user_id": user_id,
                "analysis": data.get("analysis"),
                "drafts": data.get("drafts"),
            }
        )
        .execute()
    )