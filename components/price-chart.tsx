"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import type { Skin } from "@/components/skin-tracker";

interface PriceChartProps {
  skins: Skin[];
}

type TimeRange = "24h" | "7d" | "1m" | "3m" | "1y" | "all";

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: "24h", label: "24H", days: 1 },
  { value: "7d", label: "7D", days: 7 },
  { value: "1m", label: "1M", days: 30 },
  { value: "3m", label: "3M", days: 90 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "all", label: "ALL", days: 730 }, // 2 years for "all"
];

// Generate mock historical data
function generateHistoricalData(skins: Skin[], days: number) {
  const data = [];

  // Special handling for 24H - show hourly data
  if (days === 1) {
    const now = new Date();
    const hoursToShow = 24;

    for (let i = hoursToShow; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(date.getHours() - i);

      const totalValue = skins.reduce((sum, skin) => {
        // Skip skins with no price (N/A)
        if (skin.price === null) return sum;

        // Simulate price fluctuation (smaller range for more realistic data)
        const fluctuation = (Math.random() - 0.5) * 0.05;
        const priceChange = i * 0.0002; // Small hourly trend
        const historicalPrice = Math.max(0, skin.price * (1 - priceChange + fluctuation));
        return sum + historicalPrice;
      }, 0);

      // Format time for 24H view
      const timeFormat = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: false,
      });

      // Full date and time for tooltip
      const fullDate =
        date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) + ` at ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;

      data.push({
        date: timeFormat + ":00",
        fullDate: fullDate,
        value: totalValue,
      });
    }

    return data;
  }

  // Determine data point interval based on time range
  const interval = days <= 7 ? 1 : days <= 30 ? 2 : days <= 90 ? 7 : 30;
  const dataPoints = Math.ceil(days / interval);

  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * interval);

    const totalValue = skins.reduce((sum, skin) => {
      // Skip skins with no price (N/A)
      if (skin.price === null) return sum;

      // Simulate price fluctuation (smaller range for more realistic data)
      const fluctuation = (Math.random() - 0.5) * 0.05; // Reduced from 0.1 to 0.05
      const priceChange = i * interval * 0.005; // Reduced trend from 0.01 to 0.005
      const historicalPrice = Math.max(0, skin.price * (1 - priceChange + fluctuation)); // Ensure non-negative
      return sum + historicalPrice;
    }, 0);

    // Format date based on range
    const dateFormat = days <= 7 ? { month: "short", day: "numeric" } : days <= 90 ? { month: "short", day: "numeric" } : { month: "short", year: "2-digit" };

    // Full date for tooltip (without weekday)
    const fullDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    data.push({
      date: date.toLocaleDateString("en-US", dateFormat as Intl.DateTimeFormatOptions),
      fullDate: fullDate,
      value: totalValue,
    });
  }

  return data;
}

export function PriceChart({ skins }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const selectedRange = TIME_RANGES.find((r) => r.value === timeRange)!;
  const data = generateHistoricalData(skins, selectedRange.days);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm outline-none focus:outline-none focus-visible:outline-none [&:focus]:outline-none [&:focus-visible]:outline-none" tabIndex={-1}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Portfolio History</h2>

          {/* Time Range Buttons */}
          <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
            {TIME_RANGES.map((range) => (
              <Button key={range.value} onClick={() => setTimeRange(range.value)} variant="ghost" size="sm" className={`h-8 px-3 text-xs font-medium transition-all ${timeRange === range.value ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-background/80 text-muted-foreground hover:text-foreground"}`}>
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="outline-none focus:outline-none focus-visible:outline-none pointer-events-auto [&_*]:outline-none [&_*]:focus:outline-none" onFocus={(e) => e.preventDefault()} onClick={(e) => e.currentTarget.blur()}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0 0)" opacity={0.3} />
              <XAxis dataKey="date" stroke="oklch(0.55 0 0)" style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }} />
              <YAxis stroke="oklch(0.55 0 0)" style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }} tickFormatter={(value) => `$${value.toFixed(0)}`} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.12 0 0)",
                  border: "1px solid #39FF14",
                  borderRadius: "0.5rem",
                  fontFamily: "JetBrains Mono",
                  padding: "8px 12px",
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
                labelStyle={{ color: "oklch(0.98 0 0)", fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Portfolio Value"]}
                cursor={{ stroke: "#39FF14", strokeWidth: 1, strokeDasharray: "5 5" }}
              />
              <Line type="monotone" dataKey="value" stroke="#39FF14" strokeWidth={3} dot={{ fill: "#39FF14", strokeWidth: 2, r: 4, stroke: "oklch(0.12 0 0)" }} activeDot={{ r: 6, fill: "#39FF14", stroke: "#39FF14", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
