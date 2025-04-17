import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, Shield, AlertCircle } from "lucide-react";

interface ValidationDeclinedData {
  token: string;
  texts: string[];
  sentiment: string;
  confidence: number;
  reason: string;
  validity: boolean;
}

export function ValidationLayerDeclinedComponent({ input, output }: { input: ValidationDeclinedData, output: any }) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Validation Layer Declined</h3>
          </div>
          <Badge variant="destructive">
            <XCircle className="h-4 w-4 mr-1" />
            Validation Failed
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg">
              {input.token}
            </Badge>
            <span className="text-sm text-gray-400">Token Validation</span>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-400">Validation Failed</span>
            </div>
            <p className="text-sm text-red-400">{output.reason}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-400">Expected Sentiment</span>
              </div>
              <div className="text-lg font-medium capitalize">
                {input.sentiment}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-400">Actual Sentiment</span>
              </div>
              <div className="text-lg font-medium capitalize">{output.sentiment}</div>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-400">Original Texts</span>
            <div className="mt-2 space-y-2">
              {input.texts.map((text, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-gray-700/50">
                  <AlertCircle className="h-4 w-4 text-gray-400 mt-1" />
                  <p className="text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 