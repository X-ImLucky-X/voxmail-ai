import json
import numpy as np

from app.services.embedding_service import get_embedding


EMAIL_FILE = "data/emails.json"


def cosine_similarity(a, b):

    a = np.array(a)
    b = np.array(b)

    return np.dot(a, b) / (
        np.linalg.norm(a) * np.linalg.norm(b)
    )


def search_similar_emails(query, top_k=3):

    with open(EMAIL_FILE, "r", encoding="utf-8") as f:
        emails = json.load(f)

    query_embedding = get_embedding(query)

    scores = []

    for email in emails:

        email_embedding = get_embedding(
            email["email"]
        )

        similarity = cosine_similarity(
            query_embedding,
            email_embedding
        )

        scores.append(
            (
                similarity,
                email["email"]
            )
        )

    scores.sort(reverse=True)

    return [
        item[1]
        for item in scores[:top_k]
    ]