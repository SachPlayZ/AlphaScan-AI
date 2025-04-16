import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart as LineChartIcon,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">PNL Potential</h3>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {pnl.toFixed(2)}% Potential
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-gray-800/50 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-400">Expected Return</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                {pnl.toFixed(2)}%
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <Badge variant="outline">High Potential</Badge>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (
                      active &&
                      payload &&
                      payload.length &&
                      payload[0]?.value
                    ) {
                      return (
                        <div className="p-2 bg-gray-800 border border-gray-700 rounded-lg">
                          <div className="text-sm text-gray-400">
                            Time: {payload[0].payload.time}
                          </div>
                          <div className="font-medium">
                            Price: ${Number(payload[0].value).toFixed(2)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
