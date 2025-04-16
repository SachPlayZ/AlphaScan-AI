import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, TrendingDown } from "lucide-react";

interface Message {
  group_name: string;
  topic_name: string;
  sender_name: string;
  message_text: string;
  user_id: string;
  overlap: boolean;
}

interface AlphaOutput {
  token: string;
  texts: string[];
  sentiment: string;
  confidence: number;
}

interface AlphaComponentProps {
  input: Message[];
  output: AlphaOutput[];
}

export function AlphaComponent({ input, output }: AlphaComponentProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Group Messages
        </h3>
        <div className="space-y-3">
          {input.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender_name === "Sachindra"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_name === "Sachindra"
                    ? "bg-primary/20 text-primary"
                    : "bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {message.sender_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {message.group_name} / {message.topic_name}
                  </span>
                </div>
                <p>{message.message_text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alpha Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {output.map((alpha, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-lg">
                    {alpha.token}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {alpha.sentiment === "positive" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm">
                      {Math.round(alpha.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {alpha.texts.map((text, i) => (
                    <div key={i} className="text-sm p-2 rounded bg-gray-800/50">
                      {text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
