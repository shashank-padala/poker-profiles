import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

EXCEL_DIR = "data/player_notes"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def profile_exists(username: str) -> bool:
    try:
        response = supabase.table("poker_profiles") \
            .select("id") \
            .eq("username", username) \
            .limit(1) \
            .execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"⚠️ Error checking existence for {username}: {e}")
        return False

def process_excel_file(file_path):
    df = pd.read_excel(file_path)

    if not all(col in df.columns for col in ["opponent_username", "message_text"]):
        print(f"Skipping {file_path}: missing required columns")
        return

    username = os.path.splitext(os.path.basename(file_path))[0]

    if profile_exists(username):
        print(f"⏩ Skipping {username} (already exists)")
        return

    user_id = str(df["opponent_username"].iloc[0])  # constant in the sheet
    messages = df["message_text"].dropna().astype(str).tolist()
    raw_notes = "\n".join(messages)

    data = {
        "username": username,
        "user_id": user_id,
        "raw_notes": raw_notes,
    }

    try:
        supabase.table("poker_profiles").insert(data).execute()
        print(f"✅ Inserted: {username}")
    except Exception as e:
        print(f"❌ Failed to insert {username}: {e}")

def main():
    for file in os.listdir(EXCEL_DIR):
        if file.endswith(".xlsx"):
            file_path = os.path.join(EXCEL_DIR, file)
            process_excel_file(file_path)

if __name__ == "__main__":
    main()
