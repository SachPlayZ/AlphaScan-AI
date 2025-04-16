import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Shield } from "lucide-react";

interface ValidationResult {
  token: string;
  sentiment: string;
  expected_sentiment: string;
  matches: boolean;
}

export function ValidationLayerComponent({
  token,
  sentiment,
  expected_sentiment,
  matches,
}: ValidationResult) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Validation Layer</h3>
          </div>
          <Badge variant={matches ? "secondary" : "destructive"}>
            {matches ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {matches ? "Validated" : "Mismatch"}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg">
              {token}
            </Badge>
            <span className="text-sm text-gray-400">Token Validation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-400">
                  Expected Sentiment
                </span>
              </div>
              <div className="text-lg font-medium capitalize">
                {expected_sentiment}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-400">Actual Sentiment</span>
              </div>
              <div className="text-lg font-medium capitalize">{sentiment}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
