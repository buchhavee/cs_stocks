"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { SkinList } from "@/components/skin-list";
import { PriceChart } from "@/components/price-chart";
import { searchSkins, type ProcessedSkin } from "@/lib/huggingface-api";
import { getSkinPrice, buildMarketHashName } from "@/lib/csfloat-api";
import { searchSkinsViaCSFloat, convertCSFloatToProcessedSkin } from "@/lib/csfloat-search";

export interface Skin {
  id: string;
  name: string;
  image: string;
  price: number | null; // null = N/A (ingen prisdata)
  change24h: number;
  changePercent: number;
  weapon?: string;
  skinName?: string;
  rarity?: string;
  isStatTrak?: boolean;
}

export default function SkinTracker() {
  const [skins, setSkins] = useState<Skin[]>([
    // Eksempel skin til demo
  ]);

  const [newSkinName, setNewSkinName] = useState("");
  const [searchResults, setSearchResults] = useState<ProcessedSkin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddingSkin, setIsAddingSkin] = useState(false);

  const totalValue = skins.reduce((sum, skin) => sum + (skin.price ?? 0), 0);
  const total24hChange = skins.reduce((sum, skin) => sum + (skin.price ? skin.change24h : 0), 0);
  const total24hPercent = totalValue > 0 ? (total24hChange / (totalValue - total24hChange)) * 100 : 0;

  // HYBRID APPROACH: Hugging Face til søgning (alle skins) + CSFloat til priser
  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (newSkinName.trim().length >= 3) {
        setIsSearching(true);
        setShowSuggestions(true);
        try {
          console.log(`🔍 [HYBRID] Searching for: "${newSkinName}"`);

          // Brug Hugging Face til søgning - optimeret for hastighed
          const results = await searchSkins(newSkinName, 30);

          console.log(`✅ Found ${results.length} matches from Hugging Face`);
          console.log(`💰 Prices will be fetched from CSFloat when adding skin`);
          setSearchResults(results);
        } catch (error) {
          console.error("❌ Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
        setIsSearching(false);
      }
    }, 500); // 500ms debounce - hurtigere responstid

    return () => clearTimeout(searchDebounce);
  }, [newSkinName]);

  const handleAddSkin = async (skinData?: ProcessedSkin) => {
    if (!skinData && !newSkinName.trim()) return;

    setIsAddingSkin(true);
    let newSkin: Skin;

    try {
      if (skinData) {
        // HYBRID: Data kommer fra Hugging Face, priser fra CSFloat API
        const marketHashName = buildMarketHashName(skinData.weapon, skinData.skin_name, skinData.exterior, skinData.isStatTrak);
        console.log("💰 [HYBRID] Fetching live price from CSFloat for:", marketHashName);

        let price: number | null = null;
        try {
          const priceData = await getSkinPrice(marketHashName);
          price = priceData.lowestPrice || priceData.steamPrice || null;
          console.log(`✅ Price fetched: ${price !== null ? `$${price.toFixed(2)}` : "N/A"}`);
        } catch (priceError) {
          console.warn("⚠️ Could not fetch price from CSFloat, using N/A:", priceError);
          price = null;
        }

        // Brug data fra søgning (CSFloat eller Hugging Face)
        newSkin = {
          id: Date.now().toString(),
          name: skinData.name,
          weapon: skinData.weapon,
          skinName: skinData.skin_name,
          rarity: skinData.rarity,
          isStatTrak: skinData.isStatTrak,
          image: skinData.image_url,
          price: price,
          change24h: price ? (Math.random() - 0.5) * (price * 0.1) : 0, // +/- 10% af prisen
          changePercent: price ? (Math.random() - 0.5) * 10 : 0,
        };
        console.log("✅ [HYBRID] Adding skin:", {
          name: newSkin.name,
          price: price !== null ? `$${price.toFixed(2)}` : "N/A",
          source: "Hugging Face (search) + CSFloat (price)",
          image: newSkin.image,
          isStatTrak: newSkin.isStatTrak,
        });
      } else {
        // Fallback til manuel indtastning
        newSkin = {
          id: Date.now().toString(),
          name: newSkinName,
          image: "/placeholder.svg",
          price: null, // N/A for manual entry
          change24h: 0,
          changePercent: 0,
        };
      }

      console.log("➕ Adding skin to collection");
      setSkins([...skins, newSkin]);

      // Reset search state
      console.log("🔄 Resetting search state");
      setNewSkinName("");
      setSearchResults([]);
      setShowSuggestions(false);
      setIsSearching(false);
    } catch (error) {
      console.error("❌ Error adding skin:", error);
    } finally {
      setIsAddingSkin(false);
    }
  };

  const handleRemoveSkin = (id: string) => {
    setSkins(skins.filter((skin) => skin.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <Header />

      {/* Total Value Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Portfolio Value</p>
              <p className="text-4xl md:text-5xl font-mono font-bold">${totalValue.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 rounded-lg px-4 py-3 ${total24hPercent >= 0 ? "bg-positive/10" : "bg-negative/10"}`}>
                {total24hPercent >= 0 ? <TrendingUp className="h-5 w-5" style={{ color: "#39FF14" }} /> : <TrendingDown className="h-5 w-5" style={{ color: "#FF2800" }} />}
                <div>
                  <p className={`font-mono text-lg font-semibold ${total24hPercent >= 0 ? "text-[#39FF14]" : "text-[#FF2800]"}`}>
                    {total24hPercent >= 0 ? "+" : ""}
                    {total24hPercent.toFixed(2)}%
                  </p>
                  <p className={`font-mono text-sm ${total24hPercent >= 0 ? "text-[#39FF14]/80" : "text-[#FF2800]/80"}`}>
                    {total24hPercent >= 0 ? "+" : ""}${total24hChange.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Price Chart */}
      <PriceChart skins={skins} />

      {/* Add Skin Input */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative z-10">
        <div className="p-4">
          <div className="relative z-20">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search for weapon or skin (min. 3 characters)..."
                  value={newSkinName}
                  onChange={(e) => setNewSkinName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchResults.length > 0 && handleAddSkin(searchResults[0])}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => {
                    console.log("🔎 Input focused, current search:", newSkinName);
                    if (newSkinName.trim().length >= 3) {
                      console.log("📋 Showing existing results");
                      setShowSuggestions(true);
                    }
                  }}
                  className="bg-background/50 border-border/50 focus:border-primary pr-10"
                />
                {isSearching && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
              </div>
              <Button onClick={() => handleAddSkin(undefined)} disabled={!newSkinName.trim() || isAddingSkin} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isAddingSkin ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skin
                  </>
                )}
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && newSkinName.trim().length >= 3 && (
              <Card className="absolute z-50 w-full mt-1 min-h-[300px] max-h-[500px] overflow-y-auto border-border/50 bg-background/95 backdrop-blur-md shadow-2xl ring-1 ring-border/20">
                <div className="p-2 bg-linear-to-b from-background/50 to-transparent">
                  {isSearching ? (
                    <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-2 bg-background/40 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching for skins...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/30 bg-background/40">Showing {searchResults.length} results</div>
                      {searchResults.map((skin, index) => (
                        <button key={index} onClick={() => handleAddSkin(skin)} className="w-full p-3 text-left hover:bg-primary/10 hover:border-primary/20 border border-transparent rounded-lg transition-all flex items-center gap-3 group">
                          <div className="relative h-12 w-16 shrink-0 rounded bg-background/60 overflow-hidden border border-border/40 group-hover:border-primary/30 transition-colors">
                            <img
                              src={skin.image_url || "/placeholder.svg"}
                              alt={skin.name}
                              className="object-contain w-full h-full p-1"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                console.error("❌ Search result image error:", skin.name);
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                              onLoad={() => {
                                console.log("✅ Search result image loaded:", skin.name);
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate group-hover:text-primary transition-colors flex items-center gap-2">
                              <span>
                                {skin.weapon} | {skin.skin_name}
                              </span>
                              {skin.isStatTrak && <span className="inline-flex items-center rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500 ring-1 ring-inset ring-orange-500/20">StatTrak™</span>}
                            </p>
                            {skin.rarity && <p className="text-xs text-muted-foreground">{skin.rarity}</p>}
                            <p className="text-xs text-muted-foreground/70">{skin.exterior}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground bg-background/40 rounded-lg">
                      <p className="text-sm">No skins found for "{newSkinName}"</p>
                      <p className="text-xs mt-1">Searching through all 13,412 skins in database</p>
                      <p className="text-xs mt-1 opacity-70">Live prices will be fetched from CSFloat when you add the skin</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </Card>

      {/* Skin List */}
      <SkinList skins={skins} onRemoveSkin={handleRemoveSkin} />

      {/* Footer */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm mt-8 overflow-hidden">
        <div className="relative p-8">
          {/* Gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 via-transparent to-foreground/5 pointer-events-none" />

          <div className="relative">
            {/* Main Footer Content */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              {/* Left Section - Branding */}
              <div className="flex flex-col items-center md:items-start gap-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">CS Skin Tracker</h3>
                <p className="text-sm text-muted-foreground">Track your CS2 skin portfolio with real-time prices</p>
              </div>

              {/* Right Section - Stats */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">13,412</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Skins</div>
                </div>
                <div className="hidden md:block w-px h-12 bg-border/50" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Live</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Market Data</div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30 my-4" />

            {/* Bottom Section - Data Sources */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Powered by CSFloat API</span>
                </div>
                <span className="hidden md:inline">•</span>
                <span>Hugging Face Dataset</span>
              </div>
              <div className="text-muted-foreground/70">© 2025 CS Skin Tracker</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
