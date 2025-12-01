/**
 * Test script for Hugging Face API integration
 * Run with: npx ts-node test-api.ts
 * Or simply check the console in your browser when using the app
 */

import { fetchSkinsFromHuggingFace, searchSkins, getTotalSkinsCount } from "./lib/huggingface-api";

async function testAPI() {
  console.log("🧪 Testing Hugging Face API Integration...\n");

  try {
    // Test 1: Get total count
    console.log("📊 Test 1: Getting total skins count...");
    const totalCount = await getTotalSkinsCount();
    console.log(`✅ Total skins in dataset: ${totalCount}\n`);

    // Test 2: Fetch first 5 skins
    console.log("📦 Test 2: Fetching first 5 skins...");
    const firstSkins = await fetchSkinsFromHuggingFace(0, 5);
    console.log(`✅ Fetched ${firstSkins.length} skins:`);
    firstSkins.forEach((skin, i) => {
      console.log(`   ${i + 1}. ${skin.weapon} | ${skin.skin_name}`);
      console.log(`      Rarity: ${skin.rarity}`);
      console.log(`      Image: ${skin.image_url?.substring(0, 50)}...`);
    });
    console.log("");

    // Test 3: Search for AK-47 skins
    console.log('🔍 Test 3: Searching for "AK-47" skins...');
    const ak47Skins = await searchSkins("AK-47", 5);
    console.log(`✅ Found ${ak47Skins.length} AK-47 skins:`);
    ak47Skins.forEach((skin, i) => {
      console.log(`   ${i + 1}. ${skin.weapon} | ${skin.skin_name}`);
    });
    console.log("");

    // Test 4: Search for Dragon skins
    console.log('🔍 Test 4: Searching for "Dragon" skins...');
    const dragonSkins = await searchSkins("Dragon", 5);
    console.log(`✅ Found ${dragonSkins.length} Dragon skins:`);
    dragonSkins.forEach((skin, i) => {
      console.log(`   ${i + 1}. ${skin.weapon} | ${skin.skin_name}`);
    });
    console.log("");

    console.log("✨ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Uncomment to run tests
// testAPI()

export { testAPI };
