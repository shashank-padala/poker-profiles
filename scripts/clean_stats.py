import csv
import os

INPUT_FILE = "data/player_stats.csv"
OUTPUT_FILE = "data/cleaned_player_stats.csv"

# Final stats columns to keep
OUTPUT_FIELDS = [
    "username",
    "vpip",
    "pfr",
    "three_bet",
    "fold_to_three_bet",
    "steal",
    "check_raise",
    "cbet",
    "fold_to_cbet",
    "fold",
    "wtsd",
    "wsd",
]

def pct(numerator: int, denominator: int) -> float | None:
    if denominator == 0:
        return None
    return round((numerator / denominator) * 100, 2)

def parse_int(row, key):
    try:
        return int(row.get(key, 0) or 0)
    except ValueError:
        return 0

def process_row(row):
    return {
        "username": row["Username"].strip(),
        "vpip": pct(parse_int(row, "hands_vpip"), parse_int(row, "hands_vpip_opportunity")),
        "pfr": pct(parse_int(row, "hands_pfr"), parse_int(row, "hands_pfr_opportunity")),
        "three_bet": pct(parse_int(row, "hands_three_bet"), parse_int(row, "hands_three_bet_opportunity")),
        "fold_to_three_bet": pct(parse_int(row, "hands_folded_three_bet"), parse_int(row, "hands_three_bet_fold_opportunity")),
        "steal": pct(parse_int(row, "hands_steal_attempt"), parse_int(row, "hands_steal_opportunity")),
        "check_raise": pct(parse_int(row, "hands_check_n_raise"), parse_int(row, "hands_check_n_raise_opportunity")),
        "cbet": pct(parse_int(row, "hands_cbet_success"), parse_int(row, "hands_cbet_opportunity")),
        "fold_to_cbet": pct(parse_int(row, "hands_folded_to_cbet"), parse_int(row, "hands_fold_to_cbet_opportunity")),
        "fold": pct(parse_int(row, "hands_fold"), parse_int(row, "hands_fold_opportunity")),
        "wtsd": pct(parse_int(row, "hands_wtsd"), parse_int(row, "hands_flop_seen")),
        "wsd": pct(parse_int(row, "hands_won_at_showdown"), parse_int(row, "hands_wtsd")),
    }

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file not found: {INPUT_FILE}")
        return

    with open(INPUT_FILE, newline="") as infile, open(OUTPUT_FILE, "w", newline="") as outfile:
        reader = csv.DictReader(infile)  # now correctly assumes comma-separated
        writer = csv.DictWriter(outfile, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()

        for row in reader:
            username = row.get("Username", "").strip()
            if not username:
                continue
            cleaned = process_row(row)
            writer.writerow(cleaned)

    print(f"✅ Cleaned player stats written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
