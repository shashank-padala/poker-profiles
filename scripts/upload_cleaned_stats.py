#!/usr/bin/env python3
import csv
import uuid
import os
import time
from datetime import datetime, timezone

import psycopg2
from dotenv import load_dotenv
from tqdm import tqdm

# ─── CONFIG ─────────────────────────────────────────────────────────────────────

# Path to your CSV
CSV_PATH = os.path.join(os.path.dirname(__file__), "../data/cleaned_player_stats.csv")

# Batch size for commits and throttle
BATCH_SIZE = 500       # commit every 500 rows
SLEEP_SECONDS = 0.5    # pause 0.5s after each batch
START_FROM_ROW = 7000  # previous batch stopped after 7k rows

# Load environment vars from .env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))

# ─── DB CONNECTION ────────────────────────────────────────────────────────────────

def get_connection():
    """
    Establishes and returns a new psycopg2 connection using env vars.
    """
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )

# ─── HELPERS ─────────────────────────────────────────────────────────────────────

def get_or_create_player_id(cursor, username):
    """
    Returns existing player_profiles.id for username, or inserts a new record.
    """
    cursor.execute("SELECT id FROM player_profiles WHERE username = %s", (username,))
    row = cursor.fetchone()
    if row:
        return row[0]
    # create new
    new_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    cursor.execute(
        """
        INSERT INTO player_profiles (id, username, created_at, updated_at)
        VALUES (%s, %s, %s, %s)
        """,
        (new_id, username, now, now)
    )
    return new_id

def insert_player_alias(cursor, player_id, username):
    """
    Inserts into player_aliases unless that alias already exists.
    """
    cursor.execute(
        "SELECT 1 FROM player_aliases WHERE player_id = %s AND username = %s",
        (player_id, username)
    )
    if cursor.fetchone() is None:
        now = datetime.now(timezone.utc)
        alias_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO player_aliases
              (id, player_id, platform, username, created_at)
            VALUES
              (%s, %s, %s, %s, %s)
            """,
            (alias_id, player_id, "PokerBaazi", username, now)
        )

def insert_player_stats(cursor, player_id, row):
    """
    Inserts one row of stats into player_stats.
    """
    now = datetime.now(timezone.utc)
    cursor.execute(
        """
        INSERT INTO player_stats (
            id, player_id, vpip, pfr, three_bet, fold_to_three_bet,
            steal, check_raise, cbet, fold_to_cbet, fold, wtsd, wsd,
            created_at, updated_at
        )
        VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s
        )
        """,
        (
            str(uuid.uuid4()), player_id,
            float(row.get("vpip") or 0),
            float(row.get("pfr") or 0),
            float(row.get("three_bet") or 0),
            float(row.get("fold_to_three_bet") or 0),
            float(row.get("steal") or 0),
            float(row.get("check_raise") or 0),
            float(row.get("cbet") or 0),
            float(row.get("fold_to_cbet") or 0),
            float(row.get("fold") or 0),
            float(row.get("wtsd") or 0),
            float(row.get("wsd") or 0),
            now, now
        )
    )

# ─── MAIN SEEDING ────────────────────────────────────────────────────────────────

def seed_player_data(csv_path):
    """
    Reads CSV and seeds player_profiles, player_aliases, and player_stats.
    Shows a tqdm progress bar, commits in batches, and throttles.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Load all rows so tqdm can show total
    with open(csv_path, newline="") as f:
        rows = list(csv.DictReader(f))

    # Slice the rows to resume
    rows_to_process = rows[START_FROM_ROW:]

    for idx, row in enumerate(tqdm(rows_to_process, desc="Uploading players", unit="row")):
        username = row.get("username", "").strip()
        if not username:
            continue

        player_id = get_or_create_player_id(cursor, username)
        insert_player_alias(cursor, player_id, username)
        insert_player_stats(cursor, player_id, row)

        # Batch commit & throttle
        if (idx + 1) % BATCH_SIZE == 0:
            conn.commit()
            time.sleep(SLEEP_SECONDS)

    # Final commit
    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Data import complete.")

# ─── ENTRYPOINT ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    seed_player_data(CSV_PATH)
