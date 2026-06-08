from app.services.supabase_service import supabase


def save_reply(reply_text: str, user_id: str):
    """
    Saves a reply variant to the Supabase style_memory table 
    bound to the authenticated user's ID.
    """
    (
        supabase
        .table("style_memory")
        .insert(
            {
                "user_id": user_id,
                "reply": reply_text
            }
        )
        .execute()
    )


def get_style_examples(user_id: str) -> str:
    """
    Retrieves the latest 5 saved writing style variants 
    for the specific authenticated user.
    """
    response = (
        supabase
        .table("style_memory")
        .select("reply")
        .eq(
            "user_id",
            user_id
        )
        .order(
            "created_at",
            desc=True
        )
        .limit(5)
        .execute()
    )

    if not response.data:
        return ""

    replies = [
        row["reply"]
        for row in response.data
    ]

    return "\n\n".join(replies)