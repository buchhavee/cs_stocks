// CSFloat API til søgning af skins
// Bedre end Hugging Face fordi den understøtter direkte søgning og har prisdata

const CSFLOAT_API_BASE = "/api/csfloat";

export interface CSFloatSearchResult {
  id: string;
  price: number; // I cents
  item: {
    market_hash_name: string;
    item_name: string; // Skin navn uden condition
    wear_name: string; // Condition (Factory New, etc.)
    icon_url: string;
    is_stattrak: boolean;
    is_souvenir: boolean;
    rarity: number;
    def_index: number; // Våben ID
    float_value: number;
    scm?: {
      price: number;
      volume: number;
    };
  };
}

/**
 * Søger efter et eksakt skin via CSFloat API med market_hash_name
 * Bruges til at få aktive listings og priser for et specifikt skin
 *
 * @param marketHashName Eksakt market hash name (f.eks. "AK-47 | Redline (Field-Tested)")
 * @param limit Max antal resultater
 * @returns Array af listings for det specifikke skin
 */
export async function getCSFloatListings(marketHashName: string, limit: number = 50): Promise<CSFloatSearchResult[]> {
  const searchId = Date.now();
  console.log(`[CSFloat Listings ${searchId}] 🔍 Fetching listings for: "${marketHashName}"`);

  try {
    // Brug market_hash_name parameteren for eksakt match
    const params = new URLSearchParams({
      market_hash_name: marketHashName,
      limit: limit.toString(),
      sort_by: "lowest_price",
    });

    const url = `${CSFLOAT_API_BASE}?${params}`;
    console.log(`[CSFloat Listings ${searchId}] 📡 Fetching from CSFloat`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CSFloat Listings ${searchId}] ❌ API Error: ${response.status}`, errorText);
      return [];
    }

    const data = await response.json();
    console.log(`[CSFloat Listings ${searchId}] 📦 API Response structure:`, Object.keys(data));

    // CSFloat returnerer et array af listings direkte
    const listings: CSFloatSearchResult[] = Array.isArray(data) ? data : data.data || data.listings || [];

    if (!Array.isArray(listings) || listings.length === 0) {
      console.log(`[CSFloat Listings ${searchId}] ⚠️ No listings found for this skin`);
      return [];
    }

    console.log(`[CSFloat Listings ${searchId}] ✅ Found ${listings.length} listings`);
    return listings;
  } catch (error) {
    console.error(`[CSFloat Listings ${searchId}] ❌ Error:`, error);
    return [];
  }
}

/**
 * Søger efter skins via CSFloat API (partial search ved at søge gennem almindelige listings)
 * BEMÆRK: CSFloat understøtter ikke partial search direkte, så denne funktion er begrænset
 *
 * @param searchTerm Søgeord (kan være våben eller skin navn)
 * @param limit Max antal resultater
 * @returns Array af unikke skins med prisdata
 */
export async function searchSkinsViaCSFloat(searchTerm: string, limit: number = 50): Promise<CSFloatSearchResult[]> {
  const searchId = Date.now();
  console.log(`[CSFloat Search ${searchId}] 🔍 Starting search for: "${searchTerm}"`);

  try {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower || searchLower.length < 3) {
      console.log(`[CSFloat Search ${searchId}] ⚠️ Search term too short`);
      return [];
    }

    // Hent de nyeste listings og filtrer dem (begrænset approach)
    const params = new URLSearchParams({
      limit: "50", // Max per request
      sort_by: "most_recent",
    });

    const url = `${CSFLOAT_API_BASE}?${params}`;
    console.log(`[CSFloat Search ${searchId}] 📡 Fetching recent listings from CSFloat`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CSFloat Search ${searchId}] ❌ API Error: ${response.status}`, errorText);
      return [];
    }

    const data = await response.json();
    const listings: CSFloatSearchResult[] = Array.isArray(data) ? data : data.data || data.listings || [];

    if (!Array.isArray(listings) || listings.length === 0) {
      console.log(`[CSFloat Search ${searchId}] ⚠️ No listings returned from API`);
      return [];
    }

    console.log(`[CSFloat Search ${searchId}] 📊 Got ${listings.length} recent listings from API`);

    // Filtrer baseret på søgeord
    const filtered = listings.filter((listing) => {
      const marketName = listing.item.market_hash_name?.toLowerCase() || "";
      const itemName = listing.item.item_name?.toLowerCase() || "";
      return marketName.includes(searchLower) || itemName.includes(searchLower);
    });

    // Deduplicate baseret på market_hash_name
    const uniqueMap = new Map<string, CSFloatSearchResult>();
    filtered.forEach((listing) => {
      const key = listing.item.market_hash_name;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, listing);
      }
    });

    const results = Array.from(uniqueMap.values()).slice(0, limit);
    console.log(`[CSFloat Search ${searchId}] ✅ Found ${results.length} unique skins (LIMITED - only recent listings)`);

    return results;
  } catch (error) {
    console.error(`[CSFloat Search ${searchId}] ❌ Error:`, error);
    return [];
  }
}

/**
 * Konverterer CSFloat result til vores ProcessedSkin format
 */
export function convertCSFloatToProcessedSkin(result: CSFloatSearchResult) {
  // Ekstraher våben navn fra market_hash_name
  // F.eks. "AK-47 | Redline (Field-Tested)" -> weapon: "AK-47", skin: "Redline"
  const fullName = result.item.market_hash_name;
  const isStatTrak = result.item.is_stattrak;

  // Fjern StatTrak™ prefix hvis det findes
  const nameWithoutStatTrak = fullName.replace(/StatTrak™\s+/, "");

  const parts = nameWithoutStatTrak.split(" | ");
  const weapon = parts[0] || "";
  const skinWithCondition = parts[1] || "";
  const skinName = skinWithCondition.split(" (")[0] || "";

  // Konstruer image URL fra icon_url
  const imageUrl = result.item.icon_url ? `https://community.akamai.steamstatic.com/economy/image/${result.item.icon_url}` : "/placeholder.svg";

  return {
    name: fullName,
    weapon: weapon,
    skin_name: skinName,
    exterior: result.item.wear_name,
    rarity: `Rarity ${result.item.rarity}`,
    isStatTrak: isStatTrak,
    image_url: imageUrl,
    price: result.price / 100, // Konverter fra cents til dollars
    imageid: result.item.def_index.toString(),
  };
}
