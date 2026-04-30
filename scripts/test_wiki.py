import httpx
import asyncio
import mwparserfromhell
import re


async def fetch_wiki_pro(session, title):
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": title,
        "prop": "revisions",
        "rvprop": "content",
        "format": "json",
        "redirects": 1,
    }

    try:
        resp = await session.get(
            url,
            params=params,
            timeout=20,
            headers={
                "User-Agent": "WarAsset3D_FinalTest/5.0 (alpercanzerr1600@gmail.com)"
            },
        )
        data = resp.json()
        page = next(iter(data.get("query", {}).get("pages", {}).values()))

        if "missing" in page:
            return None

        full_content = page.get("revisions", [{}])[0].get("*", "")
        wikicode = mwparserfromhell.parse(full_content)

        # 1. STRATEJİK BÖLÜM AVCILIĞI
        # Bu başlıklar altında "koşullu bilgiler" (ancak, fakat, kısıtlar) gizlidir.
        target_sections = [
            "Design",
            "Development",
            "Operational history",
            "Performance",
            "Specifications",
            "Description",
        ]
        relevant_text = []

        # Giriş paragrafını her zaman al (Bağlam için)
        relevant_text.append(
            "=== SUMMARY ===\n"
            + str(wikicode.get_sections(levels=[1, 2, 3], flat=True)[0])[:1500]
        )

        for section in wikicode.get_sections(levels=[2]):
            header = section.filter_headings()
            if header:
                header_title = str(header[0].title).strip()
                if any(target in header_title for target in target_sections):
                    # Bölüm içeriğini temizle (dosya boyutunu korumak için max 2000 karakter)
                    relevant_text.append(
                        f"=== {header_title.upper()} ===\n" + str(section)[:2000]
                    )

        # 2. TEKNİK ŞABLONLAR (Specs & Infobox)
        tech_payload = [
            str(t)
            for t in wikicode.filter_templates()
            if any(
                k in str(t.name).lower()
                for k in ["infobox", "specs", "performance", "armament", "engine"]
            )
        ]

        # 3. NİHAİ PAKETLEME
        # Toplamda 5000-8000 karakter arası bir "Intelligence Pack" oluşturur.
        pro_content = (
            "\n\n".join(relevant_text)
            + "\n\n=== RAW TECHNICAL DATA ===\n"
            + "\n".join(tech_payload)
        )
        return pro_content

    except Exception as e:
        print(f"Fetch Error: {e}")
        return None


async def debug_pro_v1(title):
    async with httpx.AsyncClient() as session:
        print(f"--- [PRO MINING] {title} Veri Madenciliği Başladı... ---")
        content = await fetch_wiki_pro(session, title)

        if not content:
            print("❌ HATA: Veri çekilemedi.")
            return

        # Analiz Panelimiz
        print(f"\n✅ TOPLAM VERİ BOYUTU: {len(content)} Karakter")

        # "Ancak/Fakat" Kontrolü (Insight var mı?)
        insights = [
            "but",
            "however",
            "although",
            "only",
            "reduced",
            "increased",
            "due to",
            "limit",
        ]
        found_insights = [word for word in insights if word in content.lower()]

        print(f"🔍 BULUNAN ANAHTAR İPUÇLARI (Insight Indicators): {found_insights}")

        print("\n--- [A] İLK 500 KARAKTER (Bağlam) ---")
        print(content[:500] + "...")

        print("\n--- [B] BULUNAN BÖLÜM BAŞLIKLARI ---")
        sections = re.findall(r"=== (.*?) ===", content)
        for s in sections:
            print(f"- {s}")

        print("\n--- [C] SON 500 KARAKTER (Teknik Veri) ---")
        print(content[-500:])


if __name__ == "__main__":
    # Örnek: EADS Barracuda (Hala en iyi test objemiz)
    asyncio.run(debug_pro_v1("EADS_Barracuda"))
