import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MessageSquare, TrendingDown } from "lucide-react";

interface TokenBalanceCheckData {
  token: string;
  texts: string[];
  sentiment: string;
  confidence: number;
}

export function TokenBalanceCheckComponent({ input }: { input: TokenBalanceCheckData }) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Token Balance Check</h3>
          </div>
          <Badge variant="destructive" className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            Negative Alpha
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-gray-400">Token</span>
                <div className="text-2xl font-bold">{input.token}</div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                Confidence: {(input.confidence * 100).toFixed(0)}%
              </Badge>
            </div>

            <div className="mt-4">
              <span className="text-sm text-gray-400">Sentiment Analysis</span>
              <div className="mt-2 space-y-2">
                {input.texts.map((text, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-gray-700/50">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                    <p className="text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className="text-sm text-gray-400">Action Required</span>
              <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">
                  Based on negative sentiment analysis with {(input.confidence * 100).toFixed(0)}% confidence, 
                  it is recommended to check and potentially sell {input.token} holdings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 