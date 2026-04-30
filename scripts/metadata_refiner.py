import json
import os
import asyncio
import httpx
import time
import re
import urllib.parse
from tqdm import tqdm
from dotenv import load_dotenv
from groq import Groq
import orjson
import sys
import mwparserfromhell
from cerebras.cloud.sdk import Cerebras

load_dotenv()

# --- CONFIG ---
JSON_PATH = "./mobile/assets/data/military-assets.json"
OUTPUT_PATH = "./mobile/assets/data/military-assets-v29.json"
LOG_FILE = "processed_assets_v2.log"
MISSING_LOG_FILE = "missing_assets_v2.log"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

# Model Queue Configuration
MODELS_CONFIG_70B = [
    {"provider": "GROQ", "model": "llama-3.3-70b-versatile"},
    {"provider": "GROQ", "model": "openai/gpt-oss-120b"},
    {"provider": "GROQ", "model": "qwen/qwen3-32b"},
    {"provider": "GROQ", "model": "moonshotai/kimi-k2-instruct-0905"},
    {"provider": "GROQ", "model": "qwen/qwen3-coder-32b"},
    {"provider": "CEREBRAS", "model": "qwen-3-235b-a22b-instruct-2507"},
]

MODELS_CONFIG_8B = [
    {"provider": "CEREBRAS", "model": "llama3.1-8b"},
    {"provider": "GROQ", "model": "llama-3.1-8b-instant"},
]

ALL_MODELS = MODELS_CONFIG_70B + MODELS_CONFIG_8B
current_idx_70b = 0
current_idx_all = 0

clients = {
    "GROQ": Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None,
    "CEREBRAS": Cerebras(api_key=CEREBRAS_API_KEY) if CEREBRAS_API_KEY else None,
}

# Rate Limit Settings
WIKI_CONCURRENCY = 2
SECONDS_PER_REQUEST = 1  # Safety delay between assets


def get_processed_ids():
    if not os.path.exists(LOG_FILE):
        return set()
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())


def log_processed_id(asset_id):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{asset_id}\n")


def log_missing_id(asset_id):
    with open(MISSING_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{asset_id}\n")


def sanitize_content(text):
    if not text:
        return ""
    # re.sub kullanarak kontrol karakterlerini (\u0000-\u001F) ve garip sembolleri temizle
    text = re.sub(r"[\x00-\x1F\x7F]", "", text)
    # Aşırı boşlukları ve yeni satır fazlalıklarını temizle
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fix_json(text):
    """Try to recover a valid JSON object from a potentially broken LLM response."""
    if not text:
        return None
    # Remove markdown code blocks if they exist
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    # Find the first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return text.strip()


def generate_slug(name):
    return re.sub(r"[^a-z0-9]+", "-", str(name).lower()).strip("-")


# --- PROMPTS ---

PASS_1_PROMPT = """CRITICAL: Your output must be a PURE JSON object. Do not include markdown code blocks (like ```json). Start with { and end with }. No text before or after.

You are a Senior Technical Intelligence Analyst. 
Mission: Extract technical parameters and strategic insights from Wikipedia data.

RULES:
1. "short_specs": Extract ALL technical parameters (e.g., speed, range, crew, armament, weight). Use raw values found in text (don't convert yet).
2. "full_dossier": Create strategic, insight-driven entries. ONLY if the text provides context/limitations (e.g., "Effective against low-altitude targets but vulnerable to EW"). 
3. Language: ENGLISH ONLY for this stage.
4. "specs" object: DO NOT create a separate specs object. Embed everything in "short_specs".

OUTPUT JSON FORMAT:
{
  "short_specs": { "key": "value" },
  "full_dossier": { "key": "insight sentence" }
}
"""

PASS_2_PROMPT = """CRITICAL: Your output must be a PURE JSON object. Do not include markdown code blocks (like ```json). Start with { and end with }. No text before or after.

You are a Polyglot Technical Translator and Metric Expert.
Mission: Translate the provided English technical JSON into Turkish (tr), Russian (ru), Arabic (ar), and Chinese (zh).

RULES:
1. Do not invent or add new information. Just translate the provided JSON. 
2. Ensure all quotes are escaped properly.
3. METRIC SUPREMACY: Convert ALL units to metric during translation:
   - mph -> km/sa (TR), km/h (other)
   - ft -> m
   - lbs -> kg
   - miles -> km
4. DICTIONARY (TR): 
   - "Crew" MUST be "Mürettebat".
   - "Speed" units MUST be "km/sa".
5. NO HALLUCINATION: No "made-up" technical terms. Use official military terminology for each language.
6. STRUCTURE: Output a "translations" object containing the 4 languages.

INPUT: English short_specs and full_dossier.
OUTPUT JSON FORMAT:
{
  "tr": { "short_specs": { ... }, "full_dossier": { ... } },
  "ru": { ... },
  "ar": { ... },
  "zh": { ... }
}
"""

# --- LLM WRAPPER ---


def call_llm(prompt, content, pass_name="AI", is_pass1=False):
    global current_idx_70b, current_idx_all

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": content},
    ]

    # Decide model pool based on pass
    if is_pass1:
        model_pool = MODELS_CONFIG_70B
        pool_key = "current_idx_70b"
    else:
        model_pool = ALL_MODELS
        pool_key = "current_idx_all"

    pool_size = len(model_pool)

    # Start loop from the last known good model index
    for i in range(pool_size):
        # Calculate index to rotate through full pool if necessary
        start_idx = globals()[pool_key]
        current_attempt_idx = (start_idx + i) % pool_size

        config = model_pool[current_attempt_idx]
        provider = config["provider"]
        model = config["model"]
        client = clients.get(provider)

        if not client:
            continue

        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.0,
            )
            raw_content = response.choices[0].message.content

            # Successfully got a response: Keep using this model for next asset
            globals()[pool_key] = current_attempt_idx

            try:
                return json.loads(raw_content)
            except Exception:
                # JSON Fixer Failover
                fixed = fix_json(raw_content)
                try:
                    return json.loads(fixed)
                except Exception as je:
                    tqdm.write(f"[JSON-FAIL] {model} gave invalid JSON: {je}")
                    # If model gives invalid JSON repeatedly, it might be worth moving to the next model
                    globals()[pool_key] = (current_attempt_idx + 1) % pool_size
                    continue

        except Exception as e:
            err_msg = str(e).lower()

            # Handle Quota / Rate Limits
            if "429" in err_msg or "rate_limit" in err_msg:
                # Determine if it's a hard Quota Reach (Daily/TPD) or temporary congestion
                is_hard_quota = any(
                    x in err_msg
                    for x in [
                        "daily",
                        "tpd",
                        "per day",
                        "quota reached",
                        "limit reached",
                    ]
                )

                # Fetch retry-after from headers if possible
                retry_after = 60
                if hasattr(e, "response") and e.response:
                    retry_after = int(e.response.headers.get("retry-after", 60))

                if is_hard_quota or retry_after > 180:
                    tqdm.write(
                        f"[QUOTA] {model} exhausted (Hard limit). Moving to next model permanently."
                    )
                    # Update global index to permanently skip this model for this session
                    globals()[pool_key] = (current_attempt_idx + 1) % pool_size
                    continue
                else:
                    tqdm.write(
                        f"[WAIT] {model} temporary limit, sleeping {retry_after}s..."
                    )
                    time.sleep(retry_after + 1)
                    # We stay on this model for now as it's temporary
                    return call_llm(
                        prompt, content, pass_name, is_pass1
                    )  # Recursive retry once for this model
            else:
                tqdm.write(f"[LLM-ERROR] {provider}/{model}: {e}")
                # Move to next model on other errors too
                globals()[pool_key] = (current_attempt_idx + 1) % pool_size
                continue

    return None

    return None


# --- WIKI FETCH ---


async def fetch_wiki_pro(session, asset, semaphore):
    async with semaphore:
        try:
            await asyncio.sleep(0.5)  # Human-like rhythm
            wiki_url = asset.get("wikiUrl", "")
            if not wiki_url or "wikipedia.org" not in wiki_url:
                return asset

            title = wiki_url.split("/wiki/")[-1].split("#")[0]
            # Safe URL encoding for titles with spaces or special chars
            safe_title = urllib.parse.unquote(
                title
            )  # First unquote to avoid double encoding
            encoded_title = urllib.parse.quote(safe_title)

            params = {
                "action": "query",
                "titles": safe_title,  # API expects the string, httpx handles encoding usually, but we ensure safe_title
                "prop": "revisions",
                "rvprop": "content",
                "format": "json",
                "redirects": 1,
            }

            resp = await session.get(
                "https://en.wikipedia.org/w/api.php",
                params=params,
                timeout=20,
                headers={
                    "User-Agent": "WarAsset3D_Refiner/6.0 (alpercanzerr1600@gmail.com)"
                },
            )

            if resp.status_code != 200:
                tqdm.write(f"[WIKI-ERROR] {title} - Status: {resp.status_code}")
                return asset

            if not resp.text.strip():
                tqdm.write(f"[WIKI-EMPTY] {title} - Response was empty.")
                return asset

            try:
                data = resp.json()
            except Exception as e:
                tqdm.write(f"[WIKI-JSON-ERROR] {title}: {e}")
                tqdm.write(f"DEBUG DATA: {resp.text[:500]}")
                return asset

            page = next(iter(data.get("query", {}).get("pages", {}).values()))
            if "missing" in page:
                return asset

            full_content = page.get("revisions", [{}])[0].get("*", "")
            if not full_content:
                return asset

            wikicode = mwparserfromhell.parse(full_content)

            # Targeted Sections
            target_sections = [
                "Design",
                "Development",
                "Performance",
                "Specifications",
                "Description",
            ]
            relevant_parts = []

            # Summary
            sections = wikicode.get_sections(flat=True)
            if sections:
                relevant_parts.append(str(sections[0])[:2000])

            for section in wikicode.get_sections(levels=[2]):
                header = section.filter_headings()
                if header and any(t in str(header[0].title) for t in target_sections):
                    relevant_parts.append(str(section)[:2500])

            # Combine and truncate to ~9000 chars
            combined_text = "\n\n".join(relevant_parts)
            asset["_wiki_content"] = combined_text[:9000]

            # Use tqdm.write if tqdm is available, else print
            msg = f"> * [WIKI] {asset['name']} - {len(asset['_wiki_content'])} karakter veri çekildi."
            # tqdm.write(msg)

        except Exception as e:
            tqdm.write(f"[WIKI-FAIL] {asset.get('name', 'Unknown')}: {e}")

        return asset


# --- MAIN ---


async def main():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        all_assets = json.load(f)

    v29_map = {}
    if os.path.exists(OUTPUT_PATH) and os.path.getsize(OUTPUT_PATH) > 0:
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                v29_map = {a["id"]: a for a in json.load(f)}
            print(
                f"> [RESTORE] {len(v29_map)} assets successfully loaded from existing JSON."
            )
        except Exception as e:
            print(f"Warning: Could not load existing output: {e}")

    # Log purely for history, decision is now 100% based on JSON content
    targets = []
    for a in all_assets:
        asset_id = a.get("id") or generate_slug(a["name"])
        if asset_id not in v29_map:
            targets.append(a)

    print(
        f"Starting Refinement Pipeline: {len(targets)} assets to process (Skipped {len(v29_map)} already in JSON)."
    )

    semaphore = asyncio.Semaphore(WIKI_CONCURRENCY)
    async with httpx.AsyncClient() as session:
        tasks = [fetch_wiki_pro(session, a, semaphore) for a in targets]
        assets_ready = []
        for f in tqdm(
            asyncio.as_completed(tasks), total=len(tasks), desc="Wiki Extraction"
        ):
            res = await f
            assets_ready.append(res)

    processed_count = 0
    pbar = tqdm(assets_ready, desc="AI Enrichment", total=len(assets_ready))

    for asset in pbar:
        try:
            name = asset["name"]
            asset_id = asset.get("id") or generate_slug(name)

            wiki_text = sanitize_content(asset.get("_wiki_content", ""))
            if not wiki_text:
                log_missing_id(asset_id)
                continue

            # PASS 1: EXTRACTION (EN) - Forcing 70B
            intel_en = call_llm(
                PASS_1_PROMPT, f"Asset: {name}\nData: {wiki_text}", is_pass1=True
            )
            if not intel_en:
                tqdm.write(f"[FAIL] Pass-1 failed: {name}")
                log_missing_id(asset_id)
                continue

            # PASS 2: TRANSLATION (MULTI)
            content_for_pass2 = orjson.dumps(intel_en).decode("utf-8")
            intel_multi = call_llm(PASS_2_PROMPT, content_for_pass2, is_pass1=False)
            if not intel_multi:
                tqdm.write(f"[FAIL] Pass-2 failed: {name}")
                log_missing_id(asset_id)
                continue

            # FINAL ASSEMBLY
            enriched = {
                **asset,
                "id": asset_id,
                "short_specs": intel_en.get("short_specs"),
                "full_dossier": intel_en.get("full_dossier"),
                "translations": intel_multi,
            }

            # Cleanup
            enriched.pop("specs", None)
            enriched.pop("_wiki_content", None)

            v29_map[asset_id] = enriched
            log_processed_id(asset_id)
            processed_count += 1

            # Update progress bar description
            pbar.set_postfix({"processed": processed_count})

            # Atomic Save: Save to .tmp first, then rename to prevent OOM corruption
            temp_path = f"{OUTPUT_PATH}.tmp"
            with open(temp_path, "wb") as f:
                f.write(
                    orjson.dumps(list(v29_map.values()), option=orjson.OPT_INDENT_2)
                )
            os.replace(temp_path, OUTPUT_PATH)  # Success! Rename to final path

        except Exception as e:
            tqdm.write(f"[CRITICAL] {asset.get('name')}: {e}")
            log_missing_id(asset_id)
            continue

        time.sleep(SECONDS_PER_REQUEST)  # Added sleep for rate limiting

    print(f"\nDone! Enriched {processed_count} assets.")


if __name__ == "__main__":
    asyncio.run(main())
