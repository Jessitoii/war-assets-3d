import json
import os
import asyncio
import aiohttp
from tqdm import tqdm
from datetime import datetime

# CONFIGURATION
JSON_PATH = './mobile/assets/data/military-assets.json'
OUTPUT_PATH = './mobile/assets/data/military-assets-v26.json'
LOG_FILE = 'audit_report.log'
# Primary Tactical Edge Node
PROXY_BASE = 'https://warassets-cdn.alpercanzerr1600.workers.dev'

async def check_url(session, url):
    """Perform a tactical HEAD request to verify file existence."""
    try:
        async with session.head(url, timeout=10, allow_redirects=True) as response:
            return response.status == 200
    except Exception:
        return False

async def audit_asset(session, asset):
    """Validate visual intelligence and model existence for a single asset."""
    asset_id = asset.get('id')
    asset_name = asset.get('name', 'Unknown')
    
    if not asset_id:
        return None, f"[CRITICAL] Missing ID for asset: {asset_name}"

    # 1. PRIMARY IMAGE INTEGRITY CHECK (/images/{id}/1.jpg)
    image_url = f"{PROXY_BASE}/images/{asset_id}/1.jpg"
    image_exists = await check_url(session, image_url)

    if not image_exists:
        return None, f"[EXCLUDED] {asset_id} | Missing primary image at {image_url}"

    # 2. 3D MODEL INTEGRITY CHECK
    model_exists = False
    if asset.get('model'):
        model_url = f"{PROXY_BASE}/models/{asset_id}.glb"
        model_exists = await check_url(session, model_url)
    
    # Update hasModel flag as per Step 17 requirements
    asset['hasModel'] = model_exists
    
    # If the database thought there was a model but it's missing on R2, nullify it
    if asset.get('model') and not model_exists:
        asset['model'] = None
    
    return asset, None

async def main():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found. Ensure Step 16 has generated the file.")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        assets = json.load(f)

    print(f"🕵️ Starting Step 17: Cloud Integrity Audit (Worker Proxy: {PROXY_BASE})")
    print(f"   Targeting {len(assets)} assets for verification...")
    
    cleaned_assets = []
    skipped_logs = []

    # Use a TCPConnector to limit connections and avoid proxy rate-limiting
    connector = aiohttp.TCPConnector(limit=50)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [audit_asset(session, asset) for asset in assets]
        
        # Using tqdm to monitor progress of async tasks
        for f in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Auditing Assets"):
            asset, error = await f
            if asset:
                cleaned_assets.append(asset)
            else:
                skipped_logs.append(error)

    # 3. GENERATE v26 DATABASE (Verified Visual Intelligence Only)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(cleaned_assets, f, indent=2)

    # 4. LOG AUDIT RESULTS
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        f.write(f"CLOUD INTEGRITY AUDIT REPORT (v26)\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Proxy Node: {PROXY_BASE}\n")
        f.write(f"{'='*50}\n")
        f.write(f"TOTAL ASSETS SCANNED: {len(assets)}\n")
        f.write(f"VERIFIED (INCLUDED): {len(cleaned_assets)}\n")
        f.write(f"FAILED (EXCLUDED): {len(skipped_logs)}\n")
        f.write(f"{'='*50}\n\n")
        f.write("\n".join(skipped_logs))

    print(f"\n✅ INTEGRITY AUDIT COMPLETE")
    print(f"   - Verified Assets: {len(cleaned_assets)}")
    print(f"   - Excluded Assets: {len(skipped_logs)}")
    print(f"   - Cleaned Database: {OUTPUT_PATH}")
    print(f"   - Audit Logs: {LOG_FILE}")
    
    if skipped_logs:
        print(f"   ⚠️  Warning: {len(skipped_logs)} assets failed visual intelligence check and were pruned.")

if __name__ == "__main__":
    asyncio.run(main())
