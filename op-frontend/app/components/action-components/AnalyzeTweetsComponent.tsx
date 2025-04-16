import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, TrendingUp, TrendingDown, BarChart } from "lucide-react";

interface TweetAnalysis {
  sentiment: string;
  confidence: number;
  keywords: string[];
  volume: number;
}

export function AnalyzeTweetsComponent({
  sentiment,
  confidence,
  keywords,
  volume,
}: TweetAnalysis) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Tweet Analysis</h3>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <BarChart className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-400">Tweet Volume</span>
            </div>
            <div className="text-2xl font-bold">{volume} tweets</div>
          </div>

          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Twitter className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-400">Key Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <Badge key={i} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
