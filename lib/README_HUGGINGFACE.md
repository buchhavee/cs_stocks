# Hugging Face CS2 Skins API Integration

## Oversigt

Dette projekt bruger Hugging Face datasættet `While402/CounterStrike2Skins` til at hente rigtige CS2 skin data.

## API Funktioner

### `fetchSkinsFromHuggingFace(offset, length)`

Henter skins fra datasættet med pagination.

```typescript
import { fetchSkinsFromHuggingFace } from "@/lib/huggingface-api";

// Hent de første 100 skins
const skins = await fetchSkinsFromHuggingFace(0, 100);

// Hent næste 100 skins
const moreSkins = await fetchSkinsFromHuggingFace(100, 100);
```

### `searchSkins(searchTerm, limit)`

Søger efter skins baseret på navn.

```typescript
import { searchSkins } from "@/lib/huggingface-api";

// Søg efter AK-47 skins
const results = await searchSkins("AK-47", 20);

// Søg efter "Dragon" skins
const dragonSkins = await searchSkins("Dragon", 10);
```

### `getTotalSkinsCount()`

Henter det totale antal skins i datasættet.

```typescript
import { getTotalSkinsCount } from "@/lib/huggingface-api";

const total = await getTotalSkinsCount();
console.log(`Total skins: ${total}`);
```

## Skin Data Struktur

```typescript
interface HuggingFaceSkin {
  name: string; // Fulde navn
  weapon: string; // Våben type (f.eks. "AK-47")
  skin_name: string; // Skin navn (f.eks. "Fire Serpent")
  rarity: string; // Rarity level
  image_url: string; // URL til skin billede
  wear?: string; // Slid niveau (optional)
  [key: string]: any; // Andre properties
}
```

## Eksempel på Integration

```typescript
"use client";

import { useState, useEffect } from "react";
import { searchSkins } from "@/lib/huggingface-api";

export default function SkinSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const search = async () => {
      if (query.length >= 2) {
        const skins = await searchSkins(query, 10);
        setResults(skins);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skins..." />
      <ul>
        {results.map((skin, i) => (
          <li key={i}>
            <img src={skin.image_url} alt={skin.name} />
            {skin.weapon} | {skin.skin_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Nuværende Implementation

I `components/skin-tracker.tsx`:

- Realtids søgning med autocomplete
- Viser skin billeder, våben type, og rarity
- Bruger debouncing for at reducere API calls

## Fremtidige Forbedringer

1. **Cache skins lokalt** - Reducer API calls ved at cache resultater
2. **Tilføj reel prisdata** - Integrer med en CS2 market API for live priser
3. **Filtrer efter rarity** - Lad brugere filtrere skins efter sjældenhed
4. **Pagination** - Vis flere skins med infinite scroll
5. **Favoritter** - Gem brugerens favorit skins i localStorage

## API Endpoint

```bash
curl -X GET \
  "https://datasets-server.huggingface.co/rows?dataset=While402%2FCounterStrike2Skins&config=metadata&split=metadata&offset=0&length=100"
```

## Rate Limiting

Hugging Face API har rate limits. For production brug, overvej at:

- Cache data i din egen database
- Implementer server-side caching
- Brug environment variables til API konfiguration
