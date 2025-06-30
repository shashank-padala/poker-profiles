import os
from supabase import create_client, Client
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai = OpenAI(api_key=OPENAI_API_KEY)

PROMPT_PATH = "scripts/ai_prompts/player_notes_summary_prompt.txt"

def load_prompt():
    try:
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"❌ Failed to load prompt: {e}")
        return None

def generate_profile(raw_notes: str):
    prompt_template = load_prompt()
    if not prompt_template:
        return None

    prompt = prompt_template.replace("{raw_notes}", raw_notes)

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional poker coach and analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=600,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"❌ GPT error: {e}")
        return None

def parse_response(text: str):
    lines = text.strip().split("\n")
    tags = []
    summary = []
    exploit = []
    mode = None

    for line in lines:
        line = line.strip()
        if line.startswith("TAGS:"):
            tags = [tag.strip() for tag in line.replace("TAGS:", "").split(",") if tag.strip()]
        elif line.startswith("SUMMARY:"):
            mode = "summary"
        elif line.startswith("EXPLOIT STRATEGY:"):
            mode = "exploit"
        elif line.startswith("- "):
            content = line[2:].strip()
            if mode == "summary":
                summary.append(content)
            elif mode == "exploit":
                exploit.append(content)

    return tags, summary, exploit

def enrich_profiles():
    print("🔍 Fetching profiles needing enrichment...")
    response = supabase.table("poker_profiles") \
        .select("*") \
        .filter("profile_summary", "is", "null") \
        .filter("raw_notes", "not.is", "null") \
        .limit(10) \
        .execute()

    if not response.data:
        print("✅ No profiles to enrich.")
        return

    for row in response.data:
        username = row["username"]
        raw_notes = row["raw_notes"]

        print(f"🧠 Enriching: {username}")

        result = generate_profile(raw_notes)
        if not result:
            continue

        tags, summary, exploit = parse_response(result)

        if not summary or not exploit:
            print(f"⚠️ Skipping update for {username} — empty GPT output.")
            continue

        try:
            supabase.table("poker_profiles") \
                .update({
                    "player_tags": tags,
                    "profile_summary": summary,
                    "exploit_strategy": exploit
                }) \
                .eq("id", row["id"]) \
                .execute()
            print(f"✅ Updated: {username}")
        except Exception as e:
            print(f"❌ Failed to update {username}: {e}")

if __name__ == "__main__":
    enrich_profiles()
