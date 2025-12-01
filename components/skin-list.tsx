"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import type { Skin } from "@/components/skin-tracker";

interface SkinListProps {
  skins: Skin[];
  onRemoveSkin: (id: string) => void;
}

export function SkinList({ skins, onRemoveSkin }: SkinListProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Tracked Skins</h2>
      {skins.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm min-h-[400px] flex items-center justify-center">
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No skins tracked yet. Add your first skin above.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 min-h-[400px]">
          {skins.map((skin) => (
            <Card key={skin.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors group">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Skin Image */}
                  <div className="relative h-20 w-32 shrink-0 rounded-lg bg-background/50 overflow-hidden border border-border/30 flex items-center justify-center">
                    <img
                      src={skin.image || "/placeholder.svg"}
                      alt={skin.name}
                      className="w-full h-full object-contain p-2"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error("❌ Image load error for tracked skin:", skin.name, "URL:", skin.image);
                        e.currentTarget.src = "/placeholder.svg";
                        e.currentTarget.style.opacity = "0.5";
                      }}
                      onLoad={() => {
                        console.log("✅ Tracked skin image loaded successfully:", skin.name);
                      }}
                    />
                  </div>

                  {/* Skin Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold truncate">{skin.name}</h3>
                      {skin.isStatTrak && <span className="inline-flex items-center shrink-0 rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500 ring-1 ring-inset ring-orange-500/20">StatTrak™</span>}
                    </div>
                    {skin.rarity && <p className="text-xs text-muted-foreground mb-2">{skin.rarity}</p>}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="font-mono text-2xl font-bold">{skin.price !== null ? `$${skin.price.toFixed(2)}` : <span className="text-muted-foreground">N/A</span>}</p>
                      </div>
                      {skin.price !== null && (
                        <div className={`flex items-center gap-1.5 ${skin.changePercent >= 0 ? "text-[#39FF14]" : "text-[#FF2800]"}`}>
                          {skin.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <div className="font-mono">
                            <span className="text-sm font-semibold">
                              {skin.changePercent >= 0 ? "+" : ""}
                              {skin.changePercent.toFixed(2)}%
                            </span>
                            <span className="text-xs ml-1.5 opacity-80">
                              ({skin.change24h >= 0 ? "+" : ""}${skin.change24h.toFixed(2)})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button variant="ghost" size="icon" onClick={() => onRemoveSkin(skin.id)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-negative/20 hover:text-negative">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
