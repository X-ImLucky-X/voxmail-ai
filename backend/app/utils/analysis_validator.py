def validate_analysis(data):

    required_fields = {
        "category",
        "priority",
        "summary",
        "tasks"
    }

    actual_fields = set(data.keys())

    if actual_fields != required_fields:
        raise ValueError(
            f"Invalid schema: {actual_fields}"
        )

    if not isinstance(data["tasks"], list):
        raise ValueError(
            "tasks must be a list"
        )

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