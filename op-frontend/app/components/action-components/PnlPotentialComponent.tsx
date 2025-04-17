import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart as LineChartIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface PnlData {
  pnl: number;
  historical_data: {
    prices: number[];
    market_caps: number[];
    total_volumes: number[];
  };
}

export function PnlPotentialComponent({ pnl, historical_data }: PnlData) {
  const chartData = historical_data.prices.map((price, index) => ({
    time: index,
    price: price,
    market_cap: historical_data.market_caps[index],
    volume: historical_data.total_volumes[index],
  }));

  const isPositive = pnl >= 0;

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const calculateSlope = (values: number[]) => {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  };

  const priceSlope = calculateSlope(historical_data.prices);
  const marketCapSlope = calculateSlope(historical_data.market_caps);
  const volumeSlope = calculateSlope(historical_data.total_volumes);

  const getSlopeColor = (slope: number) => {
    return slope >= 0 ? "text-green-500" : "text-red-500";
  };

  const getSlopeIcon = (slope: number) => {
    return slope >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">PNL Potential</h3>
          </div>
          <Badge variant={isPositive ? "secondary" : "destructive"} className="flex items-center gap-1">
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(pnl).toFixed(2)}% {isPositive ? "Gain" : "Loss"}
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-gray-800/50 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-400">Expected Return</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                {Math.abs(pnl).toFixed(2)}%
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            <Badge variant={isPositive ? "secondary" : "destructive"}>
              {isPositive ? "High Potential" : "High Risk"}
            </Badge>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="#888888" />
                <YAxis 
                  stroke="#888888" 
                  scale="log"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => formatValue(value)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 bg-gray-800 border border-gray-700 rounded-lg">
                          <div className="text-sm text-gray-400">
                            Time: {payload[0].payload.time}
                          </div>
                          <div className="font-medium flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#2563eb]" />
                            Price: {formatValue(Number(payload[0].value))}
                            <span className={`ml-2 flex items-center gap-1 ${getSlopeColor(priceSlope)}`}>
                              {getSlopeIcon(priceSlope)}
                              {Math.abs(priceSlope).toFixed(2)}%
                            </span>
                          </div>
                          <div className="font-medium flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                            Market Cap: {formatValue(Number(payload[1].value))}
                            <span className={`ml-2 flex items-center gap-1 ${getSlopeColor(marketCapSlope)}`}>
                              {getSlopeIcon(marketCapSlope)}
                              {Math.abs(marketCapSlope).toFixed(2)}%
                            </span>
                          </div>
                          <div className="font-medium flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                            Volume: {formatValue(Number(payload[2].value))}
                            <span className={`ml-2 flex items-center gap-1 ${getSlopeColor(volumeSlope)}`}>
                              {getSlopeIcon(volumeSlope)}
                              {Math.abs(volumeSlope).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  formatter={(value) => (
                    <span className="text-sm text-gray-400">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  name="Price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="market_cap"
                  name="Market Cap"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <ReferenceLine
                  y={historical_data.prices[0]}
                  stroke="#2563eb"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                />
                <ReferenceLine
                  y={historical_data.market_caps[0]}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                />
                <ReferenceLine
                  y={historical_data.total_volumes[0]}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
