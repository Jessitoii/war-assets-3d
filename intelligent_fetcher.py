import json
import os
import time
import random
import requests
import subprocess
import zipfile
import threading
import re
import boto3
from botocore.client import Config
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from ddgs import DDGS
from cerebras.cloud.sdk import Cerebras
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

load_dotenv()

# CONFIGURATION
JSON_PATH = './mobile/assets/data/military-assets.json'
IMAGE_DIR = './backend-cdn/public/images/'
MODEL_DIR = './backend-cdn/public/models/'
RAW_MODEL_DIR = './backend-cdn/public/models/raw/'
LOG_FILE = 'missing_assets.log'

CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
SKETCHFAB_TOKEN = os.getenv("SKETCHFAB_TOKEN")
MAX_WORKERS = 4  # Resource limit for Blender/Playwright
BLENDER_PATH = r"C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

# HYBRID DEPLOYMENT CONFIG
DEPLOY_MODE = os.getenv("DEPLOY_MODE", "CLOUDFLARE") # LOCAL or CLOUDFLARE
R2_PUBLIC_URL = "https://pub-2c4d302f7a9147f2b8723c7d066dc44f.r2.dev/"

# CLOUDFLARE R2 CREDENTIALS
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")

# 5. VALIDATE BUCKET NAME CONFIGURATION
if R2_BUCKET_NAME and "r2.dev" in R2_BUCKET_NAME:
    raise ValueError("R2_BUCKET_NAME must be the bucket name, not the r2.dev domain.")

# Global Locks
json_lock = threading.Lock()
log_lock = threading.Lock()
# 6. ADD THREAD-SAFE LOGGING
print_lock = threading.Lock()

def safe_print(msg):
    with print_lock:
        print(msg)

client = Cerebras(api_key=CEREBRAS_API_KEY)

# Ensure directories exist
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(RAW_MODEL_DIR, exist_ok=True)

def safe_log(msg):
    with log_lock:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} | {msg}\n")

def jitter_sleep(min_s=1, max_s=3):
    time.sleep(random.uniform(min_s, max_s))

def llm_query(system_prompt, user_msg, json_mode=True):
    """Wrapper for multi-provider LLM access (Groq/Cerebras)."""
    try:
        # 1. ATTEMPT GROQ (High Performance)
        if GROQ_API_KEY:
            from groq import Groq
            g_client = Groq(api_key=GROQ_API_KEY)
            response = g_client.chat.completions.create(
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
                model="llama-3.1-70b-versatile",
                response_format={"type": "json_object"} if json_mode else None
            )
            return response.choices[0].message.content
        
        # 2. FALLBACK TO CEREBRAS
        response = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
            model="llama3.1-8b", 
            response_format={"type": "json_object"} if json_mode else None
        )
        return response.choices[0].message.content
    except Exception as e:
        safe_print(f" [!] LLM Query Failed: {e}")
        return None

def generate_slug(name):
    """
    Standardizes slugs for R2 compatibility.
    Replaces all non-alphanumeric chars with a single hyphen, strictly lowercase.
    Does not rely solely on AI output if it's missing.
    """
    if not name: return "unknown-asset"
    
    # 1. SLUG STANDARDIZATION: Strictly lowercase and replace special chars/spaces with a single hyphen
    name_str = str(name).strip().lower()
    slug = re.sub(r'[^a-z0-9]+', '-', name_str)
    return slug.strip('-')

def get_r2_client():
    if not R2_ACCESS_KEY_ID or not R2_SECRET_ACCESS_KEY or not R2_ACCOUNT_ID:
        return None
    return boto3.client(
        's3',
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def upload_to_r2(local_path, r2_path):
    if DEPLOY_MODE != "CLOUDFLARE": return True
    r2 = get_r2_client()
    if not r2: return False
    
    # 2. VERIFY LOCAL FILE EXISTS BEFORE UPLOAD
    if not os.path.exists(local_path):
        safe_print(f"[UPLOAD ERROR] File does not exist: {local_path}")
        return False
    
    file_size = os.path.getsize(local_path)
    safe_print(f"[UPLOAD] {local_path} | size={file_size}")
    
    if file_size == 0:
        safe_print(f"[UPLOAD SKIP] File is empty: {local_path}")
        return False

    try:
        content_type = 'application/octet-stream'
        if local_path.endswith('.jpg'): content_type = 'image/jpeg'
        elif local_path.endswith('.glb'): content_type = 'model/gltf-binary'
        
        # 3. VERIFY R2 UPLOAD SUCCEEDED
        r2.upload_file(local_path, R2_BUCKET_NAME, r2_path, ExtraArgs={'ContentType': content_type})
        
        # Verification check
        r2.head_object(Bucket=R2_BUCKET_NAME, Key=r2_path)
        safe_print(f"[UPLOAD VERIFIED] {r2_path}")
        return True
    except Exception as e:
        # 4. ADD STRICT ERROR LOGGING FOR R2
        safe_print(f"[R2 UPLOAD FAILED] {local_path} -> {e}")
        safe_log(f"R2 Upload Failed: {local_path} -> {e}")
        return False

def save_asset_to_db(asset):
    """Atomic save to JSON after every successful asset processing."""
    # 7. PREVENT DATABASE WRITE WITH EMPTY ID
    if not asset.get("id"):
        safe_print("[DB ERROR] Attempted to write asset with empty id")
        return False

    with json_lock:
        try:
            if os.path.exists(JSON_PATH):
                with open(JSON_PATH, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = []
            
            # Upsert logic
            existing_idx = next((i for i, a in enumerate(data) if a['id'] == asset['id']), None)
            if existing_idx is not None:
                data[existing_idx] = asset
            else:
                data.append(asset)
                
            with open(JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            safe_print(f" [!] Database Save Failure: {e}")
            return False

def trigger_conversion(input_path, asset_id):
    abs_input = os.path.abspath(input_path)
    abs_output = os.path.abspath(os.path.join(MODEL_DIR, f"{asset_id}.glb"))
    
    if not os.path.exists(abs_input): return None
    
    try:
        subprocess.run([
            BLENDER_PATH, "--background", "--python", "converter.py", "--", 
            abs_input, abs_output
        ], check=True, capture_output=True)
        return abs_output if os.path.exists(abs_output) else None
    except Exception:
        return None

def fetch_3d_model(asset_name, asset_id):
    """Multi-source 3D model scouting: Sketchfab -> Direct DDG Search"""
    headers = {"Authorization": f"Token {SKETCHFAB_TOKEN}"}
    
    # SOURCE 1: Sketchfab API
    search_url = f"https://api.sketchfab.com/v3/search?type=models&q={asset_name}&downloadable=true"
    try:
        r = requests.get(search_url, timeout=15)
        res = r.json().get('results', [])
        if res:
            uid = res[0]['uid']
            dl_url = f"https://api.sketchfab.com/v3/models/{uid}/download"
            dr = requests.get(dl_url, headers=headers, timeout=15)
            if dr.status_code == 200:
                links = dr.json()
                options = next((links[fmt] for fmt in ['glb', 'gltf', 'source'] if fmt in links), None)
                if options:
                    local_raw = os.path.join(RAW_MODEL_DIR, f"{asset_id}_temp")
                    with requests.get(options['url'], stream=True, timeout=60) as fr:
                        with open(local_raw, 'wb') as f:
                            for chunk in fr.iter_content(8192): f.write(chunk)
                    
                    # Identification
                    with open(local_raw, 'rb') as f:
                        magic = f.read(4)
                        ext = '.glb' if magic == b'glTF' else ('.zip' if magic[:2] == b'PK' else '.raw')
                        
                    final_raw = os.path.join(RAW_MODEL_DIR, f"{asset_id}{ext}")
                    if os.path.exists(final_raw): os.remove(final_raw)
                    os.rename(local_raw, final_raw)
                    
                    if ext == '.zip':
                        extract_dir = os.path.join(RAW_MODEL_DIR, asset_id)
                        with zipfile.ZipFile(final_raw, 'r') as zf: zf.extractall(extract_dir)
                        for root, _, files in os.walk(extract_dir):
                            for file in files:
                                if file.lower().endswith(('.gltf', '.glb', '.obj', '.fbx', '.stl')):
                                    return os.path.join(root, file)
                    return final_raw
    except Exception as e:
        safe_print(f"    [!] Sketchfab scouting failed: {e}")

    # SOURCE 2: DDG Direct Search for GLB/GLTF/OBJ
    try:
        # Enhanced query with requested fallbacks
        queries = [
            f"{asset_name} 3d model filetype:glb OR filetype:gltf",
            f"{asset_name} military 3d model github",
            f"{asset_name} 3d model google poly archive",
            f"{asset_name} low poly military model .obj"
        ]
        
        for query in queries:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=5))
                for res in results:
                    url = res.get('href', '')
                    if any(url.lower().endswith(ext) for ext in ['.glb', '.gltf', '.obj', '.zip']):
                        # Filter out common junk
                        if "github.com" in url and "/blob/" in url:
                            url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
                        
                        local_raw = os.path.join(RAW_MODEL_DIR, f"{asset_id}_fallback{os.path.splitext(url.split('?')[0])[1] or '.raw'}")
                        try:
                            r = requests.get(url, stream=True, timeout=30)
                            if r.status_code == 200:
                                with open(local_raw, 'wb') as f:
                                    for chunk in r.iter_content(8192): f.write(chunk)
                                safe_print(f"    [+] Fallback model found: {url}")
                                return local_raw
                        except: continue
    except Exception as e:
        safe_print(f"    [!] Enhanced 3D search failed: {e}")

    return None

def fetch_image_from_ddg(name, asset_id):
    query = f"{name} military vehicle"
    asset_dir = os.path.join(IMAGE_DIR, asset_id)
    os.makedirs(asset_dir, exist_ok=True)
    
    downloaded_paths = []
    try:
        with DDGS() as ddgs:
            # Fetch up to 10 results to increase chances of finding 3 valid images
            results = list(ddgs.images(query, max_results=10))
            if not results: return []
            
            count = 0
            for res in results:
                if count >= 3: break
                img_url = res['image']
                local_path = os.path.join(asset_dir, f"{count + 1}.jpg")
                
                try:
                    r = requests.get(img_url, timeout=10, stream=True)
                    if r.status_code == 200:
                        with open(local_path, 'wb') as f:
                            for chunk in r.iter_content(8192): f.write(chunk)
                        downloaded_paths.append(local_path)
                        count += 1
                        safe_print(f"    [+] Downloaded image {count}/3: {img_url}")
                except Exception as e:
                    safe_print(f"    [!] Failed to download {img_url}: {e}")
                    continue
            return downloaded_paths
    except Exception as e:
        safe_print(f"    [!] DDG Search failed: {e}")
    return []

def extract_intel(name, cat_id):
    try:
        # 1. PRE-SEARCH Technical Snippets and Wiki URL
        search_query = f"{name} military technical specifications wikipedia"
        snippets = []
        wiki_url = None
        
        with DDGS() as ddgs:
            # Search for snippets
            text_results = list(ddgs.text(search_query, max_results=3))
            for r in text_results:
                snippets.append(f"Source: {r['href']}\nContent: {r['body']}")
                if "en.wikipedia.org" in r['href'] and not wiki_url:
                    wiki_url = r['href']
            
            # If no wiki link in text search, try specifically for it
            if not wiki_url:
                wiki_results = list(ddgs.text(f"{name} wikipedia", max_results=2))
                for r in wiki_results:
                    if "en.wikipedia.org" in r['href']:
                        wiki_url = r['href']
                        break

        search_context = "\n\n".join(snippets)

        system_prompt = (
            "You are a Senior Military Intelligence Analyst and Polyglot Specialist. "
            "Extract technical specifications for a military asset in English, and then provide translations for TR (Turkish), RU (Russian), AR (Arabic), and ZH (Chinese).\n\n"
            "STRICT RULES:\n"
            "1. TERMINOLOGY: Use precise military terms in all languages (e.g., 'Ana Muharebe Tankı' for TR, 'Основной боевой танк' for RU).\n"
            "2. VALUES: Extract values in English first (e.g., '1,500 km', 'Mach 2.0').\n"
            "3. TRANSLATIONS: Translate the 'name', 'role', and the string values of specifications (range, speed, payload, etc.) into TR, RU, AR, and ZH.\n"
            "4. METRICS: Provide 0-100 values for firepower, mobility, stealth, and durability.\n"
            "5. NO CLASSIFIED: Use high-confidence estimates instead of 'Classified'.\n"
            "6. WIKI: Provide the official English Wikipedia URL.\n\n"
            "Output ONLY JSON matching this schema:\n"
            "{\n"
            "  \"name\": \"string (English)\",\n"
            "  \"role\": \"string (English)\",\n"
            "  \"range\": \"string (English)\",\n"
            "  \"speed\": \"string (English)\",\n"
            "  \"rcs\": \"string (English)\",\n"
            "  \"payload\": \"string (English)\",\n"
            "  \"generation\": \"string (English)\",\n"
            "  \"dangerLevel\": number,\n"
            "  \"threatType\": \"string (English)\",\n"
            "  \"wikiUrl\": \"string\",\n"
            "  \"metrics\": { \"firepower\": number, \"mobility\": number, \"stealth\": number, \"durability\": number },\n"
            "  \"translations\": {\n"
            "    \"tr\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } },\n"
            "    \"ru\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } },\n"
            "    \"ar\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } },\n"
            "    \"zh\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } }\n"
            "  }\n"
            "}"
        )

        
        user_msg = f"Asset: {name}\n\nSearch Context:\n{search_context}"
        
        intel_json = llm_query(system_prompt, user_msg, json_mode=True)
        if not intel_json: return None
        intel = json.loads(intel_json)
        
        if not intel or "name" not in intel: return None

        # 2. DEEP RECON: Check for "Classified" specs and trigger web search
        classified_fields = []
        for field in ["range", "speed", "payload", "rcs"]:
            val = str(intel.get(field, "")).lower()
            if "classified" in val or "unknown" in val or not val:
                classified_fields.append(field)
        
        if classified_fields:
            safe_print(f"    [!] Specialized Recon: Researching classified specs {classified_fields}...")
            deep_search_query = f"{name} military {', '.join(classified_fields)} real specifications OSINT"
            deep_snippets = []
            try:
                with DDGS() as ddgs:
                    res = list(ddgs.text(deep_search_query, max_results=5))
                    deep_snippets = [f"Deep Intel: {r['body']}" for r in res]
                
                if deep_snippets:
                    recon_msg = f"Deep Web Search Results for classified fields:\n" + "\n".join(deep_snippets)
                    recon_msg += f"\n\nPrevious JSON: {json.dumps(intel)}"
                    recon_msg += "\n\nUpdate the JSON with real OSINT estimates. DO NOT use 'Classified' anymore. Use your best intelligence guess based on the snippets."
                    
                    updated_json = llm_query(system_prompt, recon_msg, json_mode=True)
                    if updated_json:
                        intel = json.loads(updated_json)
            except Exception as e:
                safe_print(f"    [!] Deep Recon failed: {e}")
        
        # Override or set wikiUrl if LLM missed it but we found it
        if wiki_url and not intel.get("wikiUrl"):
            intel["wikiUrl"] = wiki_url
            
        return intel
    except Exception as e:
        safe_print(f" [!] Intel extraction failed for {name}: {e}")
        return None

def translate_only(name, specs):
    """CASE B: Only fetch translations using existing specs to save tokens."""
    try:
        system_prompt = (
            "You are a Senior Military Intelligence Analyst and Polyglot Specialist. "
            "Translate the provided military asset specifications into TR (Turkish), RU (Russian), AR (Arabic), and ZH (Chinese).\n\n"
            "STRICT RULES:\n"
            "1. TERMINOLOGY: Use precise military terms in all languages.\n"
            "2. TRANSLATIONS: Translate the 'name', 'role', and the string values of specifications (range, speed, payload, etc.) into TR, RU, AR, and ZH.\n"
            "Output ONLY JSON matching this schema:\n"
            "{\n"
            "  \"tr\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } },\n"
            "  \"ru\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } },\n"
            "  \"ar\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } },\n"
            "  \"zh\": { \"name\": \"string\", \"specs\": { \"role\": \"string\", \"range\": \"string\", \"speed\": \"string\", \"payload\": \"string\", \"generation\": \"string\" } }\n"
            "}"
        )
        
        user_msg = f"Asset Name: {name}\nExisting Specs: {json.dumps(specs, indent=2)}"
        
        translations_json = llm_query(system_prompt, user_msg, json_mode=True)
        if not translations_json: return None
        translations = json.loads(translations_json)
        return translations
    except Exception as e:
        safe_print(f" [!] Translation-only failed for {name}: {e}")
        return None

def process_asset_live(asset, existing_assets_map=None):
    """The Master Live-Sync Loop for a single asset with Smart Incremental Update logic."""
    original_name = asset['name']
    cat_id = asset.get('catId', '1')
    
    # 1. Identify Case
    asset_id = asset.get('id') or generate_slug(original_name)
    
    # Case B: Existing Asset - Missing Translations
    if existing_assets_map and asset_id in existing_assets_map:
        existing = existing_assets_map[asset_id]
        translations = existing.get('translations', {})
        required_langs = {'tr', 'ru', 'ar', 'zh'}
        if not translations or not all(l in translations for l in required_langs):
            safe_print(f"[*] Case B (Update Translations): {original_name}")
            new_translations = translate_only(existing['name'], existing.get('specs', {}))
            if new_translations:
                existing['translations'] = new_translations
                if save_asset_to_db(existing):
                    safe_print(f"    [✓] Translations Updated: {asset_id}")
                    return True
            return False
        return True # Case C: Skip complete asset

    # Case A: New Asset - Full Recon
    safe_print(f"\n[*] Case A (Full Recon): {original_name}")
    
    # 1. Intel Discovery
    intel = extract_intel(original_name, cat_id)

    if not intel: 
        safe_print(f"    [-] Aborted: Not military or OSINT failure.")
        return False

    
    # 1. SLUG STANDARDIZATION: Use AI name if available, otherwise original
    real_name = intel.get('name', original_name)
    asset_id = generate_slug(real_name)
    
    if not asset_id:
        safe_print(f"[INVALID SLUG] name={real_name}")
        return False

    # Extract translations before updating asset
    translations = intel.pop("translations", {})

    asset.update({
        "id": asset_id, # ID-TO-PATH ENFORCEMENT
        "name": real_name,
        "specs": intel,
        "translations": translations,
        "dangerLevel": intel.get('dangerLevel', 5),
        "threatType": intel.get('threatType', 'Classified'),
        "wikiUrl": intel.get('wikiUrl', 'https://en.wikipedia.org/wiki/Military_technology')
    })


    # 2. Image Fetch & Sync
    # LOCAL PATH ENFORCEMENT: Derived exclusively from asset_id, now in a directory
    img_paths = fetch_image_from_ddg(real_name, asset_id)
    if img_paths:
        asset['images'] = []
        for i, img_local in enumerate(img_paths):
            if DEPLOY_MODE == "CLOUDFLARE":
                # R2 KEY ENFORCEMENT: images/{asset_id}/{i+1}.jpg
                r2_path = f"images/{asset_id}/{i+1}.jpg"
                if upload_to_r2(img_local, r2_path):
                    # DYNAMIC URL SANITIZATION
                    public_url = f"{R2_PUBLIC_URL.rstrip('/')}/{r2_path}"
                    asset['images'].append(public_url)
                    # VERIFICATION LOGS
                    safe_print(f"    [VERIFICATION] Public Image URL {i+1}: {public_url}")
            else:
                asset['images'].append(f"{asset_id}/{i+1}.jpg")
        if asset['images']:
            asset['img'] = asset['images'][0]
            
        safe_print(f"    [+] {len(asset['images'])} Images Synced: {asset_id}/")
    else:
        safe_print(f"    [!] Multi-Image Acquisition Failed.")

    # 3. Model Fetch, Convert & Sync
    raw_path = fetch_3d_model(real_name, asset_id)
    if raw_path:
        # GLB LOCAL PATH ENFORCEMENT via trigger_conversion
        glb_local = trigger_conversion(raw_path, asset_id)
        if glb_local:
            if DEPLOY_MODE == "CLOUDFLARE":
                # R2 KEY ENFORCEMENT: models/{asset_id}.glb
                r2_path = f"models/{asset_id}.glb"
                if upload_to_r2(glb_local, r2_path):
                    # DYNAMIC URL SANITIZATION
                    public_url = f"{R2_PUBLIC_URL.rstrip('/')}/{r2_path}"
                    asset['model'] = public_url
                    # VERIFICATION LOGS
                    safe_print(f"    [VERIFICATION] Public Model URL: {public_url}")
            else:
                asset['model'] = f"{asset_id}.glb"
            safe_print(f"    [+] Model Materialized: {asset_id}.glb")
        else:
            safe_print(f"    [!] GLB Fusion Failed.")
            asset['model'] = None
            
        # Cleanup temporary raw model files to save space
        try:
            if os.path.exists(raw_path):
                if os.path.isfile(raw_path):
                    os.remove(raw_path)
                # If it was a zip extraction, we might want to clean that too, 
                # but for now let's focus on the main temp raw file
                safe_print(f"    [CLEANUP] Removed temporary model file: {raw_path}")
        except Exception as e:
            safe_print(f"    [!] Cleanup failed: {e}")
    else:
        safe_print(f"    [!] Model Scouting Failed.")
        asset['model'] = None

    # 4. Persistence
    if save_asset_to_db(asset):
        safe_print(f"    [✓] Database Lock-in: {asset_id}")
        return True
    return False

def expand_targets(current_assets, target_count=1000):
    safe_print(f"[*] Intelligence Briefing: Expanding target list to {target_count}...")
    categories = {
        "1": ["Main Battle Tank", "Cold War MBT", "Modern AFV"],
        "2": ["Stealth Fighter", "Strategic Bomber", "Attack Helicopter"],
        "3": ["SAM System", "Patriot Battery", "S-400"],
        "4": ["UCAV", "Loitering Munition", "Kamikaze Drone"],
        "5": ["Destroyer", "Stealth Frigate", "Attack Submarine"]
    }
    
    new_targets = []
    current_ids = {a['name'].lower() for a in current_assets}
    needed = target_count - len(current_assets)
    if needed <= 0: return []

    per_cat = (needed // len(categories)) + 1
    for cat_id, hints in categories.items():
        for hint in hints:
            num = (per_cat // len(hints)) + 1
            safe_print(f"    [>] Scouting {num} targets for {hint}...")
            try:
                prompt = (f"Return a JSON list of exactly {num} UNIQUE, REAL {hint} models from world militaries (USA, Russia, China, NATO). "
                          "Format: {\"list\": [\"Name1\", ...]} No placeholders like 'Classified'.")
                names_json = llm_query("You are a military discovery assistant.", prompt, json_mode=True)
                if names_json:
                    names = json.loads(names_json).get("list", [])
                    for n in names:
                        if n.lower() not in current_ids:
                            new_targets.append({"catId": cat_id, "name": n, "featured": False})
                            current_ids.add(n.lower())
            except Exception as e: 
                safe_print(f"    [!] Scouting error for {hint}: {e}")
    return new_targets

def main():
    # 8. ADD DEBUG OUTPUT FOR R2 CONFIG
    safe_print("R2 CONFIG:")
    safe_print(f"Bucket: {R2_BUCKET_NAME}")
    safe_print(f"Endpoint: https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com")
    safe_print(f"Deploy Mode: {DEPLOY_MODE}")
    
    safe_print(f"🚀 INITIALIZING HYBRID LIVE-SYNC [Mode: {DEPLOY_MODE}]")
    
    # Load Existing
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            existing_assets = json.load(f)
    else:
        existing_assets = []

    # Filter out junk already
    existing_assets = [a for a in existing_assets if len(a.get('name', '')) > 2]
    
    # Map for easy lookup
    existing_assets_map = {a['id']: a for a in existing_assets if a.get('id')}
    
    # Identify assets needing updates (Case B)
    pending_updates = []
    required_langs = {'tr', 'ru', 'ar', 'zh'}
    for a in existing_assets:
        translations = a.get('translations', {})
        if not translations or not all(lang in translations for lang in required_langs):
            pending_updates.append(a)
    
    safe_print(f"[*] Smart Discovery: {len(pending_updates)} existing assets need translation updates.")
    
    # Scout New Targets (Case A)
    new_targets = expand_targets(existing_assets, 1000)
    safe_print(f"[*] Intelligence Discovery Found {len(new_targets)} New Targets.")

    # Combine tasks
    all_tasks = pending_updates + new_targets
    random.shuffle(all_tasks)

    # Live Processing Loop
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_asset_live, t, existing_assets_map): t for t in all_tasks}
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                safe_print(f" [!] Thread error: {e}")

    safe_print(f"\n[!] OPERATION LIVE-SYNC COMPLETE.")

if __name__ == "__main__":
    main()

