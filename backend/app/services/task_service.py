import json
import os

TASK_FILE = "data/completed_tasks.json"


def load_tasks():

    if not os.path.exists(TASK_FILE):
        return {}

    try:
        with open(TASK_FILE, "r") as f:
            return json.load(f)

    except:
        return {}


def save_tasks(data):

    with open(TASK_FILE, "w") as f:
        json.dump(
            data,
            f,
            indent=2
        )


def is_completed(task_id):

    tasks = load_tasks()

    return tasks.get(
        task_id,
        False
    )


def toggle_task(task_id):

    tasks = load_tasks()

    tasks[task_id] = not tasks.get(
        task_id,
        False
    )

    save_tasks(tasks)

    return tasks[task_id]