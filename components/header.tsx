import { Card } from "@/components/ui/card";

export function Header() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-6">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CS Skin Tracker</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Track your Counter-Strike skin portfolio</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1.5 rounded-md bg-background/50 border border-border/50 font-mono">Live Prices</span>
            <span className="px-3 py-1.5 rounded-md bg-background/50 border border-border/50 font-mono">13,412 Skins</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
