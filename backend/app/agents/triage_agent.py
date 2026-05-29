import ollama
import json
import re


def analyze_email(subject: str, body: str):

    prompt = f"""
    Analyze this email.

    Return ONLY valid JSON.

    {{
      "category":"",
      "priority":"",
      "summary":"",
      "tasks":[]
    }}

    Subject:
    {subject}

    Body:
    {body}
    """

    response = ollama.chat(
        model="qwen2.5:7b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response["message"]["content"]

    # Remove markdown fences
    content = re.sub(r"```json|```", "", content).strip()

    try:
        return json.loads(content)
    except Exception:
        return {
            "error": "Failed to parse model output",
            "raw_response": content
        }