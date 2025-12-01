"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { searchSkins, fetchSkinsFromHuggingFace } from "@/lib/huggingface-api";

export default function TestAPIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const skins = await fetchSkinsFromHuggingFace(0, 5);
      setResult(skins);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const skins = await searchSkins("AK-47", 5);
      setResult(skins);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Hugging Face API Test</h1>

      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Åbn browser console (F12) for at se billede load status. Du kan også teste billederne direkte på{" "}
          <a href="/test-images.html" target="_blank" className="underline">
            /test-images.html
          </a>
        </p>
      </Card>

      <div className="flex gap-4 mb-6">
        <Button onClick={testFetch} disabled={loading}>
          {loading ? "Loading..." : "Test Fetch First 5"}
        </Button>
        <Button onClick={testSearch} disabled={loading}>
          {loading ? "Loading..." : "Search AK-47"}
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200 mb-6">
          <p className="text-red-600">Error: {error}</p>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results ({result.length} skins):</h2>
          {result.map((skin: any, i: number) => (
            <Card key={i} className="p-4">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <img
                    src={skin.image_url}
                    alt={skin.name}
                    className="w-32 h-24 object-contain bg-gray-100 border border-gray-300"
                    crossOrigin="anonymous"
                    onLoad={(e) => {
                      console.log("✅ Image loaded:", skin.image_url);
                      e.currentTarget.style.borderColor = "green";
                    }}
                    onError={(e) => {
                      console.error("❌ Image failed:", skin.image_url);
                      e.currentTarget.src = "/placeholder.svg";
                      e.currentTarget.style.borderColor = "red";
                    }}
                  />
                  <p className="text-xs text-center mt-1 text-muted-foreground">Check console</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{skin.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Weapon: {skin.weapon} | Rarity: {skin.rarity}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Image ID: {skin.imageid}</p>
                  <p className="text-xs text-muted-foreground mt-1">Exterior: {skin.exterior}</p>
                  <div className="mt-2 space-x-2">
                    <a href={skin.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      Open image in new tab
                    </a>
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono break-all">{skin.image_url}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
