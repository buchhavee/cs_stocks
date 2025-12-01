# CS2 Skin Tracker 🎮

Et Next.js baseret værktøj til at tracke Counter-Strike 2 skin priser og statistik. Projektet bruger rigtige CS2 skin data fra Hugging Face datasættet.

## ✨ Features

- 🔍 **Realtids søgning** - Søg efter CS2 skins med autocomplete
- 📊 **Portfolio tracking** - Hold styr på værdien af dine skins
- 📈 **Pris statistik** - Se ændringer i pris over tid
- 🖼️ **Rigtige billeder** - Viser faktiske skin billeder fra datasættet
- 🎨 **Modern UI** - Bygget med Tailwind CSS og shadcn/ui

## 🚀 Getting Started

Først, installer dependencies:

```bash
npm install
```

Derefter, kør development serveren:

```bash
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000) i din browser for at se applikationen.

## 🔌 Hugging Face API Integration

Projektet bruger [While402/CounterStrike2Skins](https://huggingface.co/datasets/While402/CounterStrike2Skins) datasættet fra Hugging Face.

### API Funktioner

Se `lib/huggingface-api.ts` for implementeringen:

- `fetchSkinsFromHuggingFace(offset, length)` - Hent skins med pagination
- `searchSkins(searchTerm, limit)` - Søg efter skins
- `getTotalSkinsCount()` - Få det totale antal skins

### Eksempel:

```typescript
import { searchSkins } from "@/lib/huggingface-api";

// Søg efter AK-47 skins
const results = await searchSkins("AK-47", 10);
```

For mere detaljeret dokumentation, se [lib/README_HUGGINGFACE.md](lib/README_HUGGINGFACE.md).

## 📁 Projekt Struktur

```
cs_stocks/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   ├── skin-tracker.tsx    # Main tracker komponent
│   ├── skin-list.tsx       # Liste af trackede skins
│   ├── price-chart.tsx     # Pris graf
│   └── ui/                 # shadcn/ui komponenter
├── lib/
│   ├── huggingface-api.ts  # Hugging Face API integration
│   └── utils.ts            # Utility funktioner
└── test-api.ts             # API test script
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **TypeScript:** For type safety

## 📊 Data Source

Skin data kommer fra Hugging Face API:

```bash
curl -X GET \
  "https://datasets-server.huggingface.co/rows?dataset=While402%2FCounterStrike2Skins&config=metadata&split=metadata&offset=0&length=100"
```

## 🔮 Fremtidige Forbedringer

- [ ] Integrer med CS2 market API for live priser
- [ ] Tilføj localStorage for at gemme tracket skins
- [ ] Implementer filtrering efter rarity
- [ ] Tilføj historiske pris grafer
- [ ] Export portfolio til CSV/JSON

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
