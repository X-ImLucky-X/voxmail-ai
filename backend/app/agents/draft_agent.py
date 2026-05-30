import json
import ollama

from app.services.style_memory import get_style_examples


def generate_replies(email_body: str):

    style_examples = get_style_examples()

    prompt = f"""
You are an intelligent email assistant.

The email account owner is:

Name: Lakshya Kumar Singh

Generate 3 email replies:

1. short_reply
2. professional_reply
3. detailed_reply

Rules:

- Write as Lakshya Kumar Singh.
- Never use placeholders such as:
  [Your Name]
  [Your Position]
  [Company Name]
  [Your Contact Information]
- Do not invent job titles.
- Do not include fake signatures.
- End naturally with:

Best regards,
Lakshya

Match the user's writing style using these previous replies:

{style_examples}

Incoming Email:

{email_body}

Return ONLY valid JSON in this exact format:

{{
    "short_reply": "reply text",
    "professional_reply": "reply text",
    "detailed_reply": "reply text"
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

        parsed = json.loads(content)

        print("\n========== PARSED JSON ==========")
        print(parsed)
        print("=================================\n")

        return {
            "short_reply": parsed.get(
                "short_reply",
                ""
            ),

            "professional_reply": parsed.get(
                "professional_reply",
                ""
            ),

            "detailed_reply": parsed.get(
                "detailed_reply",
                ""
            )
        }

    except json.JSONDecodeError as e:

        return {
            "error": "Invalid JSON returned by model",
            "exception": str(e),
            "raw_response": (
                content
                if "content" in locals()
                else None
            )
        }

    except Exception as e:

        return {
            "error": "Draft generation failed",
            "exception": str(e)
        }