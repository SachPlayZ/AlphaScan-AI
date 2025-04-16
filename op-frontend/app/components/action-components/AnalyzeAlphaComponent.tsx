import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search, AlertCircle } from "lucide-react";

interface AnalyzeAlphaProps {
  token: string;
  texts: string[];
  sentiment: string;
  confidence: number;
}

export function AnalyzeAlphaComponent({
  token,
  texts,
  sentiment,
  confidence,
}: AnalyzeAlphaProps) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Alpha Analysis</h3>
          </div>
          <Badge
            variant={sentiment === "positive" ? "secondary" : "destructive"}
          >
            {sentiment === "positive" ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {confidence * 100}% Confidence
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg">
              {token}
            </Badge>
            <span className="text-sm text-gray-400">Token Analysis</span>
          </div>

          <div className="space-y-2">
            {texts.map((text, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-gray-800/50 flex items-start gap-2"
              >
                <AlertCircle className="h-4 w-4 mt-1 text-primary" />
                <p className="text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
