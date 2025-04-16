import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LineChart } from "lucide-react";

interface TrendData {
  prices: string;
  market_caps: string;
  total_volumes: string;
}

export function DetectTrendsComponent({
  prices,
  market_caps,
  total_volumes,
}: TrendData) {
  const getTrendIcon = (trend: string) => {
    return trend === "positive" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendText = (trend: string) => {
    return trend === "positive" ? "Upward Trend" : "Downward Trend";
  };

  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-6">
          <LineChart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Trend Detection</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Price Trend</span>
              <Badge
                variant={prices === "positive" ? "secondary" : "destructive"}
              >
                {getTrendIcon(prices)}
              </Badge>
            </div>
            <div className="text-lg font-medium">{getTrendText(prices)}</div>
          </div>

          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Market Cap Trend</span>
              <Badge
                variant={
                  market_caps === "positive" ? "secondary" : "destructive"
                }
              >
                {getTrendIcon(market_caps)}
              </Badge>
            </div>
            <div className="text-lg font-medium">
              {getTrendText(market_caps)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Volume Trend</span>
              <Badge
                variant={
                  total_volumes === "positive" ? "secondary" : "destructive"
                }
              >
                {getTrendIcon(total_volumes)}
              </Badge>
            </div>
            <div className="text-lg font-medium">
              {getTrendText(total_volumes)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
