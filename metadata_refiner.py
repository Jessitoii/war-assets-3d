import json
import os
import time
import random
import re
from tqdm import tqdm
from dotenv import load_dotenv
from groq import Groq

# 1. LOAD CONFIGURATION
load_dotenv()
JSON_PATH = './mobile/assets/data/military-assets.json'
OUTPUT_PATH = './mobile/assets/data/military-assets-v27.json'
LOG_FILE = 'processed_assets.log'
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY not found in .env")
    exit(1)

client = Groq(api_key=GROQ_API_KEY)
MODEL_ID = "groq/compound"

# 2. STATE TRACKER
def get_processed_ids():
    if not os.path.exists(LOG_FILE):
        return set()
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        return set(line.strip() for line in f if line.strip())

def log_processed_id(asset_id):
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f"{asset_id}\n")

# 3. UTILITIES
def generate_slug(name):
    if not name: return "unknown"
    return re.sub(r'[^a-z0-9]+', '-', str(name).lower()).strip('-')

def groq_compound_query(asset, max_retries=3):
    asset_name = asset.get('name')
    system_prompt = (
        "You are a Senior Military Intelligence Analyst with access to native web search.\n"
        "TASK: Verify technical specs for the specified asset using your built-in search tool.\n\n"
        "STRICT REQUIREMENTS:\n"
        "1. WEB SEARCH: Find real, live OSINT data for country of origin, range, speed, and payload.\n"
        "2. DATA BIFURCATION:\n"
        "   - short_specs: Raw/Numeric shorthand (max 25 chars). E.g. '300 km', 'Mach 2.5'.\n"
        "   - full_dossier: Contextual description. E.g. '300 km (High Alt) / 120 km (Sea Level)'.\n"
        "3. COUNTRIES: Provide 'country' name and ISO 'countryCode'.\n"
        "4. TRANSLATIONS: Provide localized accuracy for 'tr', 'ru', 'ar', 'zh'. Bifurcate their specs too.\n\n"
        "OUTPUT JSON ONLY."
    )

    essential_data = {
        "name": asset.get("name"),
        "id": asset.get("id"),
        "current_specs": asset.get("specs", {})
    }
    user_msg = f"Verify intelligence for: {asset_name}. Context: {json.dumps(essential_data)}"

    backoff = 20
    for i in range(max_retries):
        try:
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg}
                ],
                model=MODEL_ID,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            if "429" in str(e) or "rate_limit" in str(e).lower():
                print(f"\n [!] Rate limit hit for {asset_name}. Retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
                continue
            print(f" [!] Error querying {asset_name}: {e}")
            break
    return None

def main():
    if not os.path.exists(JSON_PATH):
        print(f"File {JSON_PATH} not found.")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        all_assets = json.load(f)

    processed_ids = get_processed_ids()
    
    # Load or initialize v27 data
    v27_data = []
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
            try:
                v27_data = json.load(f)
            except:
                v27_data = []

    # Map existing assets for quick update check
    v27_map = {a.get('id'): a for a in v27_data}

    target_assets = [a for a in all_assets if a.get('id') not in processed_ids]
    
    print(f"🚀 MISSION INITIALIZED: Groq Compound Enrichment (v27)")
    print(f"   - Total Assets: {len(all_assets)}")
    print(f"   - Target Batch: {len(target_assets)}")

    count = 0
    pbar = tqdm(target_assets, desc="Enriching Database")

    for asset in pbar:
        if count >= 250:
            print("\n[!] Daily quota of 250 reached. Mission paused.")
            break

        original_id = asset.get('id')
        asset_name = asset.get('name')
        final_id = generate_slug(asset_name) if not original_id else original_id.lower()
        
        intel = groq_compound_query(asset)
        
        if intel:
            enriched_asset = asset.copy()
            enriched_asset.update({
                "id": final_id,
                "country": intel.get("country"),
                "countryCode": intel.get("countryCode"),
                "short_specs": intel.get("short_specs"),
                "full_dossier": intel.get("full_dossier"),
                "translations": intel.get("translations")
            })
            
            # Clean up old specs if necessary or keep as fallback? 
            # User said "create this object", implying new ones.
            # I'll keep everything but ensure new objects exist.
            
            v27_map[final_id] = enriched_asset
            log_processed_id(final_id)
            count += 1
            
            # Atomic save to avoid corruption
            if count % 2 == 0:
                with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
                    json.dump(list(v27_map.values()), f, indent=2)
        else:
            time.sleep(10) # Extra wait if failure

        # Respect the free tier - be very slow
        time.sleep(15) 

    # FINAL SAVE
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(list(v27_map.values()), f, indent=2)

    print(f"\n✅ COMPLETED: {count} assets enriched.")

if __name__ == "__main__":
    main()
