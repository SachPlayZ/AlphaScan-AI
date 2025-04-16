import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  LineChart,
  BarChart2,
} from "lucide-react";

interface HistoricalData {
  prices: number[];
  market_caps: number[];
  total_volumes: number[];
}

interface TrendAnalysis {
  prices: string;
  market_caps: string;
  total_volumes: string;
}

interface HistoricalDataComponentProps {
  data: HistoricalData;
  trends: TrendAnalysis;
}

export function HistoricalDataComponent({
  data,
  trends,
}: HistoricalDataComponentProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const getPercentageChange = (values: number[]) => {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BarChart className="h-5 w-5" />
        Historical Data Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Price Card */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Price</span>
              </div>
              <Badge
                variant={
                  trends.prices === "positive" ? "secondary" : "destructive"
                }
              >
                {trends.prices === "positive" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-2">
              {formatNumber(data.prices[data.prices.length - 1])}
            </div>
            <div className="text-sm text-gray-400">
              {getPercentageChange(data.prices).toFixed(2)}% change
            </div>
            <div className="h-20 mt-4 flex items-end gap-1">
              {data.prices.map((price, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 hover:bg-primary/30 transition-colors"
                  style={{
                    height: `${(price / Math.max(...data.prices)) * 100}%`,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Cap Card */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                <span className="font-medium">Market Cap</span>
              </div>
              <Badge
                variant={
                  trends.market_caps === "positive"
                    ? "secondary"
                    : "destructive"
                }
              >
                {trends.market_caps === "positive" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-2">
              $
              {formatLargeNumber(data.market_caps[data.market_caps.length - 1])}
            </div>
            <div className="text-sm text-gray-400">
              {getPercentageChange(data.market_caps).toFixed(2)}% change
            </div>
            <div className="h-20 mt-4 flex items-end gap-1">
              {data.market_caps.map((cap, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 hover:bg-primary/30 transition-colors"
                  style={{
                    height: `${(cap / Math.max(...data.market_caps)) * 100}%`,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Volume Card */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                <span className="font-medium">Volume</span>
              </div>
              <Badge
                variant={
                  trends.total_volumes === "positive"
                    ? "secondary"
                    : "destructive"
                }
              >
                {trends.total_volumes === "positive" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-2">
              $
              {formatLargeNumber(
                data.total_volumes[data.total_volumes.length - 1]
              )}
            </div>
            <div className="text-sm text-gray-400">
              {getPercentageChange(data.total_volumes).toFixed(2)}% change
            </div>
            <div className="h-20 mt-4 flex items-end gap-1">
              {data.total_volumes.map((volume, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 hover:bg-primary/30 transition-colors"
                  style={{
                    height: `${
                      (volume / Math.max(...data.total_volumes)) * 100
                    }%`,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
