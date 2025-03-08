import { BrainCircuit } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 glass">
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 animate-pulse">
          <BrainCircuit
            className="h-16 w-16 text-primary"
            style={{
              filter: "blur(4px)",
              opacity: 0.7,
            }}
          />
        </div>

        <BrainCircuit className="h-16 w-16 text-primary animate-pulse" />

        <div className="mt-8 glass-card px-6 py-3 rounded-lg neon-border">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full bg-primary animate-pulse"
                style={{
                  animationDelay: `${i * 200}ms`,
                  boxShadow: "0 0 10px #9333ea, 0 0 20px #9333ea",
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-medium neon-text-purple">Loading</p>
          <p className="text-sm text-muted-foreground">
            Analyzing market data...
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x"></div>
      </div>
    </div>
  );
}
