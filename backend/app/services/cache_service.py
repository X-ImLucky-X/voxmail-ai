import json
import os

CACHE_FILE = "data/email_cache.json"


def load_cache():

    if not os.path.exists(CACHE_FILE):
        return {}

    with open(CACHE_FILE, "r") as f:
        content = f.read().strip()
        if not content:
            return {}
        return json.loads(content)


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


def get_cached_email(
    email_id
):

    cache = load_cache()

    return cache.get(email_id)


def cache_email(
    email_id,
    data
):

    cache = load_cache()

    cache[email_id] = data

    save_cache(cache)