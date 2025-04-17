import { AlphaComponent } from "./AlphaComponent";
import { TweetsComponent } from "./TweetsComponent";
import { HistoricalDataComponent } from "./HistoricalDataComponent";
import { TransactionComponent } from "./TransactionComponent";
import { AnalyzeAlphaComponent } from "./AnalyzeAlphaComponent";
import { EduBalanceComponent } from "./EduBalanceComponent";
import { AnalyzeTweetsComponent } from "./AnalyzeTweetsComponent";
import { ValidationLayerComponent } from "./ValidationLayerComponent";
import { ValidationLayerDeclinedComponent } from "./ValidationLayerDeclinedComponent";
import { DetectTrendsComponent } from "./DetectTrendsComponent";
import { PnlPotentialComponent } from "./PnlPotentialComponent";
import { TokenBalanceCheckComponent } from "./TokenBalanceCheckComponent";

interface ActionRendererProps {
  action: string;
  input: any;
  output: any;
}

export function ActionRenderer({ action, input, output }: ActionRendererProps) {
  const renderContent = () => {
    switch (action) {
      case "Get Alpha from Group Texts":
        return <AlphaComponent input={input} output={output} />;

      case "Get Tweets":
        return <TweetsComponent tweets={output} />;

      case "Get Historical Data":
        return (
          <HistoricalDataComponent
            data={output}
            trends={{
              prices: "positive",
              market_caps: "positive",
              total_volumes: "positive",
            }}
          />
        );

      case action.match(/^Buy Token [A-Z]+$/)?.input:
      case action.match(/^Sell Token [A-Z]+$/)?.input:
        return <TransactionComponent details={output} />;

      case "Analyse Each Alpha":
        return (
          <AnalyzeAlphaComponent
            token={input.token}
            texts={input.texts}
            sentiment={input.sentiment}
            confidence={input.confidence}
          />
        );

      case "Check EDU Balance [Alpha is positive so we need to buy using EDU]":
        return <EduBalanceComponent input={input} />;

      case "Analyse Tweets":
        return (
          <AnalyzeTweetsComponent
            sentiment={output}
            confidence={0.9}
            keywords={input.tweets
              .slice(0, 3)
              .map((tweet: string) => tweet.split(" ").slice(0, 2).join(" "))}
            volume={input.tweets.length}
          />
        );

      case "Validation Layer Passed":
        return (
          <ValidationLayerComponent
            token={input.token}
            sentiment={input.sentiment}
            expected_sentiment={input.expected_sentiment}
            matches={output === "Sentiment matches"}
          />
        );

      case "Validation Layer":
        return (
          <ValidationLayerComponent
            token={input.token}
            sentiment={input.sentiment}
            expected_sentiment={input.expected_sentiment}
            matches={false}
          />
        );

      case "Validation Layer Declined":
        return <ValidationLayerDeclinedComponent input={input} output={output} />;

      case "Detect Trends":
        return (
          <DetectTrendsComponent
            prices={output.prices}
            market_caps={output.market_caps}
            total_volumes={output.total_volumes}
          />
        );

      case "Get PNL Potential":
        return (
          <PnlPotentialComponent
            pnl={output}
            historical_data={input.historical_data}
          />
        );

      case action.match(/^Check Token Balance \[Alpha is negative so we need to sell the token\]$/)?.input:
        return <TokenBalanceCheckComponent input={input} />;

      default:
        return (
          <div className="p-4 rounded-lg bg-gray-800/50">
            <h3 className="text-lg font-semibold mb-2">{action}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Input
                </h4>
                <pre className="text-sm bg-gray-900/50 p-3 rounded overflow-auto">
                  {JSON.stringify(input, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Output
                </h4>
                <pre className="text-sm bg-gray-900/50 p-3 rounded overflow-auto">
                  {JSON.stringify(output, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderContent();
}
