import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from a .env file in the `backend` directory
load_dotenv()

class GeminiClient:
    """A wrapper for the Google Gemini API client."""
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("The GOOGLE_API_KEY environment variable is not set. Please add it to a .env file in the `backend` directory.")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
        print("Gemini client initialized.")

    async def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        """
        Generates a JSON string from the Gemini model.

        Note: Gemini doesn't have a dedicated "system" prompt field like some other
        models. The system prompt is prepended to the user prompt.
        """
        full_prompt = f"{system_prompt}\n\nUser query:\n{user_prompt}"
        try:
            # Set safety settings to be less restrictive, as we expect JSON output
            # which can sometimes be flagged. Adjust as needed.
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            response = await self.model.generate_content_async(
                full_prompt,
                safety_settings=safety_settings
            )
            return self._clean_response(response.text)
        except Exception as e:
            print(f"FATAL: An error occurred while calling the Gemini API: {e}")
            # In a real application, you'd want more robust error handling and logging.
            raise

    def _clean_response(self, text: str) -> str:
        """
        Removes markdown formatting (e.g., ```json ... ```) from the model's response
        to ensure a clean JSON string.
        """
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

# Create a singleton instance of the client to be used across the application.
# This avoids re-initializing the client on every request.
try:
    gemini_client = GeminiClient()
except ValueError as e:
    print(f"Could not initialize Gemini client: {e}")
    gemini_client = None
