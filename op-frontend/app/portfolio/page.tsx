"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
} from "lucide-react";
import { WalletData, Transaction, updateEduBalance } from "@/lib/wallet";
import { Navbar } from "@/components/navbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for portfolio assets (in a real app, this would come from an API or state management)
interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  change24h: number;
  lastUpdated: number;
}

const mockPortfolioAssets: PortfolioAsset[] = [
  {
    id: "1",
    symbol: "BTC",
    name: "Bitcoin",
    quantity: 0.05,
    buyPrice: 42000,
    currentPrice: 44500,
    change24h: 3.2,
    lastUpdated: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  },
  {
    id: "2",
    symbol: "ETH",
    name: "Ethereum",
    quantity: 1.2,
    buyPrice: 2800,
    currentPrice: 2650,
    change24h: -2.1,
    lastUpdated: Date.now() - 1000 * 60 * 10, // 10 minutes ago
  },
  {
    id: "3",
    symbol: "SOL",
    name: "Solana",
    quantity: 15,
    buyPrice: 110,
    currentPrice: 125,
    change24h: 8.5,
    lastUpdated: Date.now() - 1000 * 60 * 3, // 3 minutes ago
  },
  {
    id: "4",
    symbol: "AVAX",
    name: "Avalanche",
    quantity: 25,
    buyPrice: 35,
    currentPrice: 34.2,
    change24h: -1.8,
    lastUpdated: Date.now() - 1000 * 60 * 8, // 8 minutes ago
  },
];

export default function PortfolioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [portfolioAssets, setPortfolioAssets] =
    useState<PortfolioAsset[]>(mockPortfolioAssets);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [profitLossPercentage, setProfitLossPercentage] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      setIsLoading(true);

      // In a real app, you would fetch the wallet data from your API or state management
      try {
        const walletData = localStorage.getItem("wallet");
        if (walletData) {
          const parsedWallet = JSON.parse(walletData) as WalletData;
          const updatedWallet = await updateEduBalance(parsedWallet);
          setWallet(updatedWallet);
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }

      setIsLoading(false);
    };

    fetchWallet();
    calculatePortfolioMetrics();
  }, []);

  const calculatePortfolioMetrics = () => {
    let totalValue = 0;
    let totalCost = 0;

    portfolioAssets.forEach((asset) => {
      const currentValue = asset.quantity * asset.currentPrice;
      const costBasis = asset.quantity * asset.buyPrice;

      totalValue += currentValue;
      totalCost += costBasis;
    });

    const pnl = totalValue - totalCost;
    const pnlPercentage = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

    setPortfolioValue(totalValue);
    setTotalProfitLoss(pnl);
    setProfitLossPercentage(pnlPercentage);
  };

  const refreshPortfolio = async () => {
    setIsRefreshing(true);

    // In a real app, you would fetch updated prices from an API
    // For this demo, we'll simulate a refresh with random price changes
    setTimeout(() => {
      const updatedAssets = portfolioAssets.map((asset) => {
        const priceChange = Math.random() * 6 - 3; // Random change between -3% and +3%
        const newPrice = asset.currentPrice * (1 + priceChange / 100);

        return {
          ...asset,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          change24h: parseFloat(
            (asset.change24h + (Math.random() * 2 - 1)).toFixed(1)
          ),
          lastUpdated: Date.now(),
        };
      });

      setPortfolioAssets(updatedAssets);
      calculatePortfolioMetrics();
      setIsRefreshing(false);
    }, 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              AI-Managed Portfolio
            </h1>
            <p className="text-gray-400">
              Track the performance of assets managed by your AI agent
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
            <button
              onClick={refreshPortfolio}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg transition-all duration-300"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card neon-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(portfolioValue)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {wallet && `EDU Balance: ${wallet.eduBalance.toFixed(4)} EDU`}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Total Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(totalProfitLoss)}
              </div>
              <div
                className={`text-sm flex items-center mt-1 ${
                  totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {totalProfitLoss >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {formatPercentage(profitLossPercentage)}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                AI Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {profitLossPercentage >= 0 ? "A" : "C"}
                {Math.abs(profitLossPercentage) > 10 ? "+" : "-"}
              </div>
              <div className="mt-2">
                <Progress
                  value={profitLossPercentage >= 0 ? 75 : 45}
                  className="h-2"
                />
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Based on market conditions and decisions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Assets Table */}
        <Card className="glass-card neon-border mb-8">
          <CardHeader>
            <CardTitle>Portfolio Assets</CardTitle>
            <CardDescription>
              Assets currently managed by your AI agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Asset</th>
                    <th className="text-right py-3 px-4">Quantity</th>
                    <th className="text-right py-3 px-4">Buy Price</th>
                    <th className="text-right py-3 px-4">Current Price</th>
                    <th className="text-right py-3 px-4">Value</th>
                    <th className="text-right py-3 px-4">P/L</th>
                    <th className="text-right py-3 px-4">24h</th>
                    <th className="text-right py-3 px-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioAssets.map((asset) => {
                    const currentValue = asset.quantity * asset.currentPrice;
                    const costBasis = asset.quantity * asset.buyPrice;
                    const pnl = currentValue - costBasis;
                    const pnlPercentage = (pnl / costBasis) * 100;

                    return (
                      <tr
                        key={asset.id}
                        className="border-b border-gray-800 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                              {asset.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{asset.symbol}</div>
                              <div className="text-sm text-gray-400">
                                {asset.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          {asset.quantity}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(asset.buyPrice)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(asset.currentPrice)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(currentValue)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div
                            className={
                              pnl >= 0 ? "text-green-500" : "text-red-500"
                            }
                          >
                            {formatCurrency(pnl)}
                            <div className="text-xs">
                              {formatPercentage(pnlPercentage)}
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <div
                            className={`flex items-center justify-end ${
                              asset.change24h >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {asset.change24h >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {formatPercentage(asset.change24h)}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-400">
                          <div className="flex items-center justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(asset.lastUpdated)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Strategy Insights */}
        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle>AI Strategy Insights</CardTitle>
            <CardDescription>
              Understanding how your AI agent is managing your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="strategy">
              <TabsList className="mb-4">
                <TabsTrigger value="strategy">Current Strategy</TabsTrigger>
                <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
                <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
              </TabsList>

              <TabsContent value="strategy">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary" />
                      Current Market Approach
                    </h3>
                    <p className="text-gray-300">
                      The AI is currently following a{" "}
                      <span className="text-primary font-medium">
                        balanced growth strategy
                      </span>{" "}
                      with a focus on established cryptocurrencies while
                      allocating a smaller portion to promising altcoins.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <h4 className="font-medium mb-2">
                        Recent Strategy Adjustments
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-2 mt-0.5">
                            +
                          </span>
                          <span>
                            Increased Bitcoin allocation due to positive market
                            sentiment
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mr-2 mt-0.5">
                            -
                          </span>
                          <span>
                            Reduced exposure to mid-cap altcoins during market
                            volatility
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mr-2 mt-0.5">
                            ↺
                          </span>
                          <span>
                            Rebalanced portfolio to maintain target allocations
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <h4 className="font-medium mb-2">
                        Market Indicators Being Monitored
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                            1
                          </span>
                          <span>
                            Bitcoin dominance and correlation with altcoins
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                            2
                          </span>
                          <span>
                            Social sentiment analysis from Twitter and Reddit
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                            3
                          </span>
                          <span>
                            On-chain metrics and whale wallet movements
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                            4
                          </span>
                          <span>Regulatory news and market events</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="allocation">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Current Allocation
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Bitcoin (BTC)</span>
                          <span>40%</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Ethereum (ETH)</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Solana (SOL)</span>
                          <span>20%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Avalanche (AVAX)</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Target Allocation
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Bitcoin (BTC)</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Ethereum (ETH)</span>
                          <span>25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Solana (SOL)</span>
                          <span>20%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Avalanche (AVAX)</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-6 p-3 rounded bg-primary/10 text-sm">
                      <p>
                        The AI is planning to increase Bitcoin allocation by 5%
                        and decrease Ethereum by 5% based on recent market
                        analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk">
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h3 className="text-lg font-medium mb-2">
                      Portfolio Risk Score
                    </h3>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold mr-3">65/100</div>
                      <div className="text-sm text-gray-300">Moderate Risk</div>
                    </div>
                    <Progress value={65} className="h-2 mt-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <h4 className="font-medium mb-2">Volatility</h4>
                      <div className="text-2xl font-bold mb-1">Medium</div>
                      <p className="text-sm text-gray-400">
                        30-day volatility is within expected range for crypto
                        assets
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <h4 className="font-medium mb-2">Diversification</h4>
                      <div className="text-2xl font-bold mb-1">Good</div>
                      <p className="text-sm text-gray-400">
                        Portfolio is spread across different blockchain
                        ecosystems
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <h4 className="font-medium mb-2">Market Exposure</h4>
                      <div className="text-2xl font-bold mb-1">High</div>
                      <p className="text-sm text-gray-400">
                        Currently fully invested with minimal cash reserves
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Risk Mitigation Strategies
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <DollarSign className="h-5 w-5 mr-2 text-primary" />
                        <span>
                          Dollar-cost averaging for new investments to reduce
                          timing risk
                        </span>
                      </li>
                      <li className="flex items-start">
                        <TrendingDown className="h-5 w-5 mr-2 text-primary" />
                        <span>
                          Stop-loss orders set at 15% below purchase price for
                          volatile assets
                        </span>
                      </li>
                      <li className="flex items-start">
                        <RefreshCcw className="h-5 w-5 mr-2 text-primary" />
                        <span>
                          Regular portfolio rebalancing to maintain target
                          allocations
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
