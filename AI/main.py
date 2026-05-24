from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os, requests, json
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]



# Load environment variables
load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
API_URL = "https://api.perplexity.ai/chat/completions"

# Validate API key early
if not PERPLEXITY_API_KEY:
    raise EnvironmentError("PERPLEXITY_API_KEY not set in .env file")

# Initialize FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all, but specific is safer
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Define request schema
class SlimValuationRequest(BaseModel):
    name: str
    type: str  # "physical" or "virtual"
    origin: str  # e.g., game, platform, or source
    shareable: bool
    variant: str  # Optional descriptor like "Souvenir Factory New"

# Build Perplexity prompt
def build_prompt(data: SlimValuationRequest) -> list:
    return [
        {
            "role": "system",
            "content": "You are an AI asset valuation model. Respond only with a JSON object."
        },
        {
            "role": "user",
            "content": (
                f"Input:\n"
                f"- name: {data.name}\n"
                f"- type: {data.type}\n"
                f"- origin: {data.origin}\n"
                f"- shareable: {data.shareable}\n"
                f"- variant: {data.variant}\n\n"
                "Return only JSON with:\n"
                "{\n"
                "  \"rarity_score\": float (0–10),\n"
                "  \"demand_score\": float (0–10),\n"
                "  \"estimated_value_usd\": integer,\n"
                "  \"confidence_level\": integer (0–100)\n"
                "}"
            )
        }
    ]

# POST endpoint
@app.post("/value")
def evaluate_asset(request: SlimValuationRequest):
    prompt = build_prompt(request)
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "sonar-pro",
        "messages": prompt,
        "temperature": 0.3,
        "max_tokens": 300
    }

    try:
        response = requests.post(API_URL, headers=headers, json=body)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]

        try:
            valuation = json.loads(content.strip())
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON returned by AI.")

        return valuation

    except requests.RequestException as req_err:
        raise HTTPException(status_code=502, detail=f"Perplexity API error: {req_err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Valuation failed: {e}")
