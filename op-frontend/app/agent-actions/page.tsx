"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  MessageSquare,
  Twitter,
  BarChart,
  ShoppingCart,
  Trash,
  RefreshCcw,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Mock data for agent actions
interface AgentAction {
  id: string;
  timestamp: number;
  type: "analysis" | "decision" | "transaction" | "communication";
  status: "completed" | "pending" | "failed";
  title: string;
  description: string;
  details: string[];
  sources?: string[];
  relatedAssets?: string[];
}

const mockAgentActions: AgentAction[] = [
  {
    id: "action-1",
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    type: "analysis",
    status: "completed",
    title: "Bitcoin Market Analysis",
    description: "Analyzed Bitcoin price movements and on-chain metrics",
    details: [
      "Reviewed 24h price action showing 3.2% increase",
      "Analyzed on-chain metrics indicating accumulation by whales",
      "Detected positive sentiment in social media discussions",
      "Identified potential resistance level at $45,500",
    ],
    sources: ["CoinMarketCap", "Glassnode", "Twitter", "TradingView"],
    relatedAssets: ["BTC"],
  },
  {
    id: "action-2",
    timestamp: Date.now() - 1000 * 60 * 25, // 25 minutes ago
    type: "communication",
    status: "completed",
    title: "Telegram Channel Monitoring",
    description: "Monitored crypto signal channels for trading opportunities",
    details: [
      "Scanned 15 premium signal channels",
      "Identified 3 potential trading opportunities",
      "Cross-referenced signals with technical analysis",
      "Filtered out 2 signals with insufficient confirmation",
    ],
    sources: ["Telegram", "Discord"],
    relatedAssets: ["ETH", "SOL", "AVAX"],
  },
  {
    id: "action-3",
    timestamp: Date.now() - 1000 * 60 * 20, // 20 minutes ago
    type: "analysis",
    status: "completed",
    title: "Twitter Sentiment Analysis",
    description: "Analyzed crypto sentiment on Twitter for the past 24 hours",
    details: [
      "Processed 5,000+ tweets from influential crypto accounts",
      "Sentiment analysis shows 68% positive, 22% neutral, 10% negative",
      "Detected increasing mentions of Solana ecosystem",
      "Identified potential FUD campaign against Ethereum",
    ],
    sources: ["Twitter", "Sentiment API"],
    relatedAssets: ["BTC", "ETH", "SOL"],
  },
  {
    id: "action-4",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    type: "decision",
    status: "completed",
    title: "Portfolio Allocation Decision",
    description:
      "Evaluated current market conditions and decided on allocation changes",
    details: [
      "Reviewed current portfolio allocation and performance",
      "Analyzed market trends and sentiment across major assets",
      "Considered risk factors and volatility metrics",
      "Decided to increase Bitcoin allocation by 5% and decrease Ethereum by 5%",
    ],
    relatedAssets: ["BTC", "ETH"],
  },
  {
    id: "action-5",
    timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    type: "transaction",
    status: "completed",
    title: "Sell Ethereum",
    description:
      "Executed sell order for Ethereum based on allocation decision",
    details: [
      "Sold 0.3 ETH at $2,650 per ETH",
      "Total transaction value: $795",
      "Transaction fee: $2.15",
      "Transaction hash: 0x3a8e...7f2d",
    ],
    relatedAssets: ["ETH"],
  },
  {
    id: "action-6",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    type: "transaction",
    status: "completed",
    title: "Buy Bitcoin",
    description: "Executed buy order for Bitcoin based on allocation decision",
    details: [
      "Bought 0.018 BTC at $44,500 per BTC",
      "Total transaction value: $801",
      "Transaction fee: $1.85",
      "Transaction hash: 0x7d2c...9e4f",
    ],
    relatedAssets: ["BTC"],
  },
  {
    id: "action-7",
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    type: "analysis",
    status: "pending",
    title: "Solana Ecosystem Research",
    description: "Researching new projects in the Solana ecosystem",
    details: [
      "Analyzing TVL trends across Solana DeFi protocols",
      "Reviewing new project launches and token metrics",
      "Evaluating developer activity and GitHub commits",
      "Assessing community growth and social engagement",
    ],
    relatedAssets: ["SOL"],
  },
];

export default function AgentActionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);

  useEffect(() => {
    // Simulate loading agent actions
    setTimeout(() => {
      setAgentActions(mockAgentActions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredActions = agentActions.filter((action) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.details.some((detail) =>
        detail.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (action.relatedAssets &&
        action.relatedAssets.some((asset) =>
          asset.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    // Apply type filter
    const matchesType = filterType === "all" || action.type === filterType;

    // Apply status filter
    const matchesStatus =
      filterStatus === "all" || action.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort actions by timestamp
  const sortedActions = [...filteredActions].sort((a, b) => {
    return sortOrder === "desc"
      ? b.timestamp - a.timestamp
      : a.timestamp - b.timestamp;
  });

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <BarChart className="h-4 w-4" />;
      case "decision":
        return <CheckCircle className="h-4 w-4" />;
      case "transaction":
        return <ShoppingCart className="h-4 w-4" />;
      case "communication":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case "analysis":
        return "bg-blue-500/20 text-blue-500";
      case "decision":
        return "bg-purple-500/20 text-purple-500";
      case "transaction":
        return "bg-green-500/20 text-green-500";
      case "communication":
        return "bg-yellow-500/20 text-yellow-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Agent Actions
            </h1>
            <p className="text-gray-400">
              Track and monitor all actions taken by your AI agent
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4 md:mt-0">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card neon-border mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search actions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="decision">Decision</SelectItem>
                    <SelectItem value="transaction">Transaction</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center"
                  onClick={() =>
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                  }
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                </Button>

                <Button
                  variant="outline"
                  className="w-10 p-0 flex items-center justify-center"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setFilterStatus("all");
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedActions.length === 0 ? (
            <Card className="glass-card neon-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No actions found
                </h3>
                <p className="text-gray-400 text-center max-w-md">
                  No agent actions match your current filters. Try adjusting
                  your search criteria or check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedActions.map((action) => (
              <Card
                key={action.id}
                className="glass-card neon-border overflow-hidden"
              >
                <div className="border-l-4 border-primary">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center">
                        <Badge
                          className={`mr-3 ${getActionTypeColor(action.type)}`}
                        >
                          <span className="flex items-center">
                            {getActionTypeIcon(action.type)}
                            <span className="ml-1 capitalize">
                              {action.type}
                            </span>
                          </span>
                        </Badge>
                        <CardTitle className="text-lg">
                          {action.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="flex items-center mr-4">
                          {getActionStatusIcon(action.status)}
                          <span className="ml-1 text-sm capitalize">
                            {action.status}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          <span title={formatDateTime(action.timestamp)}>
                            {formatTimeAgo(action.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-1">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Details
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {action.details.map((detail, index) => (
                            <li key={index} className="flex items-start">
                              <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {action.sources && action.sources.length > 0 && (
                          <div className="flex items-center mr-4">
                            <span className="text-xs text-gray-400 mr-2">
                              Sources:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {action.sources.map((source, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {action.relatedAssets &&
                          action.relatedAssets.length > 0 && (
                            <div className="flex items-center">
                              <span className="text-xs text-gray-400 mr-2">
                                Assets:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {action.relatedAssets.map((asset, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-primary/20 text-primary text-xs"
                                  >
                                    {asset}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Action Statistics */}
        <Card className="glass-card neon-border mt-8">
          <CardHeader>
            <CardTitle>Action Statistics</CardTitle>
            <CardDescription>
              Overview of agent activity and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>

              <TabsContent value="daily">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Total Actions
                    </h4>
                    <div className="text-2xl font-bold">24</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Analysis Actions
                    </h4>
                    <div className="text-2xl font-bold">10</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Transactions
                    </h4>
                    <div className="text-2xl font-bold">6</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Success Rate
                    </h4>
                    <div className="text-2xl font-bold">96%</div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="text-lg font-medium mb-2">Daily Insights</h3>
                  <p className="text-gray-300">
                    Today, your AI agent has been particularly active in market
                    analysis, with a focus on Bitcoin and Solana. The agent
                    executed 6 transactions with a total volume of $4,850. The
                    most significant decision was to rebalance the portfolio by
                    increasing Bitcoin allocation.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="weekly">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Total Actions
                    </h4>
                    <div className="text-2xl font-bold">142</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Analysis Actions
                    </h4>
                    <div className="text-2xl font-bold">68</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Transactions
                    </h4>
                    <div className="text-2xl font-bold">32</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Success Rate
                    </h4>
                    <div className="text-2xl font-bold">94%</div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="text-lg font-medium mb-2">Weekly Insights</h3>
                  <p className="text-gray-300">
                    This week, your AI agent has been monitoring market
                    volatility closely, making more conservative decisions than
                    usual. The agent has increased research on Solana ecosystem
                    projects and reduced exposure to mid-cap altcoins. Overall
                    transaction volume was $28,500 with a net positive impact on
                    portfolio value.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="monthly">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Total Actions
                    </h4>
                    <div className="text-2xl font-bold">583</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Analysis Actions
                    </h4>
                    <div className="text-2xl font-bold">275</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Transactions
                    </h4>
                    <div className="text-2xl font-bold">124</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Success Rate
                    </h4>
                    <div className="text-2xl font-bold">92%</div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="text-lg font-medium mb-2">Monthly Insights</h3>
                  <p className="text-gray-300">
                    Over the past month, your AI agent has adapted to changing
                    market conditions by adjusting its strategy multiple times.
                    The agent has been particularly successful in identifying
                    short-term opportunities in Bitcoin and Solana. Total
                    transaction volume was $112,750 with a portfolio performance
                    that outperformed the overall crypto market by 4.2%.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
