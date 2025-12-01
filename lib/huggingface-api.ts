// API for Hugging Face Counter-Strike 2 Skins dataset
// Bruger vores egen API route for at undgå CORS problemer
const getApiBase = () => {
  // I browser miljø, brug relativ URL
  if (typeof window !== "undefined") {
    return "/api/huggingface";
  }
  // I server miljø (SSR), brug absolut URL hvis VERCEL_URL er sat
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/huggingface`;
  }
  // Fallback til localhost i development
  return "http://localhost:3000/api/huggingface";
};

const DATASET = "While402/CounterStrike2Skins";
const CONFIG = "metadata";
const SPLIT = "metadata";

export interface HuggingFaceSkin {
  name: string;
  weapon: string;
  exterior: string;
  rarity: string;
  imageid: string;
  [key: string]: any; // For andre properties i datasættet
}

export interface ProcessedSkin extends HuggingFaceSkin {
  skin_name: string;
  image_url: string;
  isStatTrak: boolean;
}

interface HuggingFaceResponse {
  rows: Array<{
    row: HuggingFaceSkin;
  }>;
  features: any[];
  num_rows_total: number;
  num_rows_per_page: number;
}

/**
 * Processerer skin data og tilføjer billede URL
 */
function processSkin(skin: HuggingFaceSkin): ProcessedSkin {
  // Ekstrahér skin navn fra det fulde navn
  // F.eks. "AK-47 | Fire Serpent (Factory New)" -> "Fire Serpent"
  const nameParts = skin.name.split("|");
  const skin_name = nameParts.length > 1 ? nameParts[1].split("(")[0].trim() : skin.name;

  // Tjek om dette er en StatTrak skin
  const isStatTrak = skin.name.includes("StatTrak") || skin.name.includes("StatTrak™");

  // Konstruér billede URL baseret på imageid
  // Hugging Face resolve endpoint til billederne i datasættet
  const image_url = `https://huggingface.co/datasets/While402/CounterStrike2Skins/resolve/main/images/${skin.imageid}.png`;

  const processed: ProcessedSkin = {
    ...skin,
    skin_name,
    image_url,
    isStatTrak,
  };

  // Log første skin for debugging
  if (skin.imageid === "1") {
    console.log("Sample skin processed:", {
      name: processed.name,
      image_url: processed.image_url,
    });
  }

  return processed;
}

/**
 * Henter skins fra Hugging Face datasættet
 * @param offset Start position (default: 0)
 * @param length Antal skins at hente (default: 100)
 * @returns Array af skins
 */
export async function fetchSkinsFromHuggingFace(offset: number = 0, length: number = 100): Promise<ProcessedSkin[]> {
  try {
    const params = new URLSearchParams({
      dataset: DATASET,
      config: CONFIG,
      split: SPLIT,
      offset: offset.toString(),
      length: length.toString(),
    });

    const url = `${getApiBase()}?${params}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Bruger default caching for bedre performance
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: HuggingFaceResponse = await response.json();

    // Ekstrahér og processér skin data fra response
    const skins = data.rows.map((item) => processSkin(item.row));

    return skins;
  } catch (error) {
    console.error("Error fetching skins from Hugging Face:", error);
    throw error;
  }
}

/**
 * Søger efter skins baseret på navn
 * @param searchTerm Søgeterm
 * @param limit Max antal resultater
 * @returns Array af matchende skins
 */
export async function searchSkins(searchTerm: string, limit: number = 50): Promise<ProcessedSkin[]> {
  const searchId = Date.now();
  console.log(`[Search ${searchId}] 🔍 Starting search for: "${searchTerm}"`);

  try {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) {
      console.log(`[Search ${searchId}] ⚠️ Empty search term, returning empty array`);
      return [];
    }

    const filtered: ProcessedSkin[] = [];
    let offset = 0;
    const batchSize = 100; // Max allowed by API
    const maxBatches = 50; // 50 batches = 5,000 skins - balanceret mellem hastighed og coverage
    let batchCount = 0;

    console.log(`[Search ${searchId}] 📊 Searching through up to ${maxBatches * batchSize} skins`);

    // Hent batches indtil vi har nok resultater eller har søgt alle
    while (filtered.length < limit && batchCount < maxBatches) {
      console.log(`[Search ${searchId}] 📦 Fetching batch ${batchCount + 1}, offset: ${offset}`);

      try {
        const batch = await fetchSkinsFromHuggingFace(offset, batchSize);

        if (batch.length === 0) {
          console.log(`[Search ${searchId}] 🛑 No more skins to fetch`);
          break; // Ingen flere skins
        }

        // Filtrer batch - søg i både våben navn og skin navn
        const matches = batch.filter((skin) => {
          const fullName = skin.name?.toLowerCase() || "";
          const weaponName = skin.weapon?.toLowerCase() || "";
          const skinName = skin.skin_name?.toLowerCase() || "";

          // Søg i alle relevante felter
          return fullName.includes(searchLower) || weaponName.includes(searchLower) || skinName.includes(searchLower);
        });

        console.log(`[Search ${searchId}] 🎯 Found ${matches.length} matches in batch ${batchCount + 1}`);
        filtered.push(...matches);
        offset += batchSize;
        batchCount++;

        // Stop hvis vi har nok resultater
        if (filtered.length >= limit) {
          console.log(`[Search ${searchId}] ✅ Reached limit of ${limit} results`);
          break;
        }

        // Early stopping: 30 resultater er nok for de fleste søgninger
        if (filtered.length >= 30) {
          console.log(`[Search ${searchId}] 🎯 Early stopping: ${filtered.length} results (enough!)`);
          break;
        }

        // Reduceret delay mellem requests - balanceret mellem hastighed og rate limiting
        if (filtered.length < limit && batchCount < maxBatches) {
          const delay = batchCount < 20 ? 100 : 200; // Hurtigere delay
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error: any) {
        // Hvis vi får 429 (rate limit), stop søgningen og returner hvad vi har
        if (error.message?.includes("429")) {
          console.warn(`[Search ${searchId}] ⚠️ Rate limit reached, returning ${filtered.length} results`);
          break;
        }
        throw error; // Re-throw andre fejl
      }
    }

    const results = filtered.slice(0, limit);
    console.log(`[Search ${searchId}] ✅ Returning ${results.length} results`);
    return results;
  } catch (error) {
    console.error(`[Search ${searchId}] ❌ Error searching skins:`, error);
    // Return tom array ved fejl så UI'en ikke crasher
    return [];
  }
}

/**
 * Henter total antal skins i datasættet
 */
export async function getTotalSkinsCount(): Promise<number> {
  try {
    const params = new URLSearchParams({
      dataset: DATASET,
      config: CONFIG,
      split: SPLIT,
      offset: "0",
      length: "1",
    });

    const url = `${getApiBase()}?${params}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: HuggingFaceResponse = await response.json();
    return data.num_rows_total;
  } catch (error) {
    console.error("Error fetching total count:", error);
    throw error;
  }
}
