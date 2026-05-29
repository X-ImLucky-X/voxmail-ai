import ollama
import json

from app.agents.style_agent import get_style_context


def generate_replies(email_body: str):

    style_examples = get_style_context(email_body)

    prompt = f"""
You are an email assistant.

Analyze the email and generate 3 reply versions:

1. short_reply
2. professional_reply
3. detailed_reply

Match the user's writing style using these examples:

{style_examples}

Incoming Email:

{email_body}

Return ONLY valid JSON in this format:

{{
    "short_reply": "",
    "professional_reply": "",
    "detailed_reply": ""
}}
"""

    try:
        response = ollama.chat(
            model="qwen2.5:7b",
            format="json",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        content = response["message"]["content"]

        print("\n========== RAW MODEL OUTPUT ==========")
        print(content)
        print("======================================\n")

        return json.loads(content)

    except json.JSONDecodeError as e:
        return {
            "error": "Invalid JSON returned by model",
            "exception": str(e),
            "raw_response": content if "content" in locals() else None
        }

    except Exception as e:
        return {
            "error": "Draft generation failed",
            "exception": str(e)
        }