import json
import os

MEMORY_FILE = "data/style_memory.json"


def load_memory():

    if not os.path.exists(MEMORY_FILE):
        return []

    with open(
        MEMORY_FILE,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)


def save_reply(reply_text):

    memory = load_memory()

    memory.append(reply_text)

    memory = memory[-20:]

    with open(
        MEMORY_FILE,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            memory,
            f,
            indent=2
        )


def get_style_examples():

    memory = load_memory()

    return "\n\n".join(
        memory[-5:]
    )