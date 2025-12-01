import { searchSkins, getTotalSkinsCount } from "@/lib/huggingface-api";

export default async function TestPage() {
  // Test forskellige søgninger
  const testSearches = ["bloodsport", "redline", "asiimov", "dragon lore", "fade"];
  const results: Record<string, number> = {};

  console.log("🧪 Testing search functionality...");

  for (const search of testSearches) {
    try {
      const skins = await searchSkins(search, 10);
      results[search] = skins.length;
      console.log(`Search "${search}": Found ${skins.length} results`);
      if (skins.length > 0) {
        console.log(`  First result: ${skins[0].name}`);
      }
    } catch (error) {
      console.error(`Error searching for "${search}":`, error);
      results[search] = -1;
    }
  }

  let totalCount = 0;
  try {
    totalCount = await getTotalSkinsCount();
  } catch (error) {
    console.error("Error getting total count:", error);
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Database Search Test</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Dataset Info</h2>
        <p className="text-muted-foreground">
          Total skins in dataset: <span className="font-mono font-bold">{totalCount.toLocaleString()}</span>
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Search Results</h2>
        {testSearches.map((search) => (
          <div key={search} className="p-4 border border-border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{search}</span>
              <span className={`font-mono ${results[search] > 0 ? "text-green-500" : results[search] === 0 ? "text-yellow-500" : "text-red-500"}`}>{results[search] === -1 ? "ERROR" : `${results[search]} results`}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Test Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Search function scans through batches of 100 skins (max 3000 total)</li>
          <li>Searches in: full name, weapon name, and skin name</li>
          <li>Case-insensitive matching</li>
          <li>If "bloodsport" returns 0, the skin might be in a later batch (after offset 3000)</li>
        </ul>
      </div>
    </div>
  );
}
