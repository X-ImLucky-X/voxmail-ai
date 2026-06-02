def validate_analysis(data):

    required_fields = {
        "category",
        "priority",
        "summary",
        "tasks"
    }

    missing_fields = (
        required_fields -
        set(data.keys())
    )

    if missing_fields:

        raise ValueError(
            f"Missing fields: {missing_fields}"
        )

    if not isinstance(
        data["tasks"],
        list
    ):
        raise ValueError(
            "tasks must be a list"
        )

    if "calendar_event" not in data:

        data["calendar_event"] = {
            "detected": False,
            "title": "",
            "date": "",
            "time": ""
        }

    return data

def normalize_priority(data):

    priority = (
        str(
            data.get(
                "priority",
                ""
            )
        )
        .strip()
        .upper()
    )

    mapping = {
        "HIGH": "HIGH",
        "URGENT": "HIGH",
        "CRITICAL": "HIGH",

        "MEDIUM": "MEDIUM",
        "NORMAL": "MEDIUM",

        "LOW": "LOW"
    }

    data["priority"] = (
        mapping.get(
            priority,
            "LOW"
        )
    )

    return data