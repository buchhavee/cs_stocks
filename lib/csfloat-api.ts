// CSFloat API Integration
// Dokumentation: https://docs.csfloat.com/
// Bruger vores egen API route for at undgå CORS problemer

const getApiBase = () => {
  // I browser miljø, brug relativ URL
  if (typeof window !== "undefined") {
    return "/api/csfloat";
  }
  // I server miljø (SSR), brug absolut URL hvis VERCEL_URL er sat
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/csfloat`;
  }
  // Fallback til localhost i development
  return "http://localhost:3000/api/csfloat";
};

export interface CSFloatListing {
  id: string;
  created_at: string;
  type: string;
  price: number; // I cents
  state: string;
  item: {
    asset_id: string;
    def_index: number;
    paint_index: number;
    paint_seed: number;
    float_value: number;
    icon_url: string;
    is_stattrak: boolean;
    is_souvenir: boolean;
    rarity: number;
    quality: number;
    market_hash_name: string;
    item_name: string;
    wear_name: string;
    description: string;
    collection: string;
    scm?: {
      price: number; // Steam Community Market pris i cents
      volume: number;
    };
  };
}

export interface CSFloatResponse {
  data?: CSFloatListing[];
  error?: string;
}

export interface PriceData {
  lowestPrice?: number; // Laveste pris på CSFloat (i dollars)
  steamPrice?: number; // Steam Community Market pris (i dollars)
  hasData: boolean;
}

/**
 * Henter prisdata for et skin baseret på market hash name
 * @param marketHashName Det fulde navn på skinnet (f.eks. "AK-47 | Redline (Field-Tested)")
 * @returns Prisdata eller null hvis ikke fundet
 */
export async function getSkinPrice(marketHashName: string): Promise<PriceData> {
  try {
    // Hent kun den billigste listing - hurtigere respons
    const params = new URLSearchParams({
      market_hash_name: marketHashName,
      limit: "1", // Kun den billigste
      sort_by: "lowest_price",
    });

    const url = `${getApiBase()}?${params}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { hasData: false };
    }

    const data = await response.json();
    const listings: CSFloatListing[] = data.data || data;

    if (!listings || listings.length === 0) {
      return { hasData: false };
    }

    // Hent laveste pris
    const lowestListing = listings[0];
    const lowestPrice = lowestListing.price / 100; // Konverter fra cents til dollars
    const steamPrice = lowestListing.item.scm?.price ? lowestListing.item.scm.price / 100 : undefined;

    return {
      lowestPrice,
      steamPrice,
      hasData: true,
    };
  } catch (error) {
    console.error(`Error fetching price:`, error);
    return { hasData: false };
  }
}

/**
 * Konstruerer market hash name fra skin data
 * @param weapon Våben navn (f.eks. "AK-47")
 * @param skinName Skin navn (f.eks. "Redline")
 * @param exterior Condition (f.eks. "Field-Tested")
 * @param isStatTrak Om det er StatTrak
 * @returns Market hash name
 */
export function buildMarketHashName(weapon: string, skinName: string, exterior: string, isStatTrak: boolean = false): string {
  const statTrakPrefix = isStatTrak ? "StatTrak™ " : "";
  return `${statTrakPrefix}${weapon} | ${skinName} (${exterior})`;
}
