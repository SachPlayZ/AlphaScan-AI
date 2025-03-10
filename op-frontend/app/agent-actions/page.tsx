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
  Copy,
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
import { useAccount } from "wagmi";

interface AgentAction {
  timestamp: Date;
  action: string;
  input: any;
  output: any;
}

export default function AgentActionsPage() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    const fetchLogs = async () => {
      try {
        const response = await fetch(`http://localhost:8000/get-logs/${address}`); // Replace with actual user ID
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const data = await response.json();
        console.log(data);
        
        // Transform the logs into the correct format
        const transformedLogs = data.map((log: any) => ({
          timestamp: new Date(log.timestamp),
          action: log.action,
          input: log.input,
          output: log.output
        }));
        
        setAgentActions(transformedLogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [address]);

  const filteredActions = agentActions.filter((action) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      action.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(action.input).toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(action.output).toLowerCase().includes(searchQuery.toLowerCase());

    // Apply type filter
    const matchesType = filterType === "all" || action.action === filterType;

    // Apply status filter
    const matchesStatus =
      filterStatus === "all" || 
      (action.output && action.output.status && action.output.status === filterStatus);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort actions by timestamp
  const sortedActions = [...filteredActions].sort((a, b) => {
    return sortOrder === "desc"
      ? b.timestamp.getTime() - a.timestamp.getTime()
      : a.timestamp.getTime() - b.timestamp.getTime();
  });

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp.getTime() - (5.5 * 60 * 60 * 1000)) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatDateTime = (timestamp: Date) => {
    // Convert UTC to IST by adding 5 hours and 30 minutes
    const istDate = new Date(timestamp.getTime() + (5.5 * 60 * 60 * 1000));
    
    return istDate.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ' IST';
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case "Get Alpha from Group Texts":
        return <MessageSquare className="h-4 w-4" />;
      case "Analyse Texts":
        return <BarChart className="h-4 w-4" />;
      case "Analyse Each Alpha":
        return <BarChart className="h-4 w-4" />;
      case "Check EDU Balance":
        return <ShoppingCart className="h-4 w-4" />;
      case "Check Token Balance":
        return <ShoppingCart className="h-4 w-4" />;
      case "Validation Layer":
        return <CheckCircle className="h-4 w-4" />;
      case "Trust Layer":
        return <CheckCircle className="h-4 w-4" />;
      case "Get Historical Data":
        return <BarChart className="h-4 w-4" />;
      case "Detect Trends":
        return <BarChart className="h-4 w-4" />;
      case "Get PNL Potential":
        return <BarChart className="h-4 w-4" />;
      case "Get Tweets":
        return <Twitter className="h-4 w-4" />;
      case "Analyse Tweets":
        return <Twitter className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionStatusIcon = (status: string | undefined) => {
    if (!status) return <AlertCircle className="h-4 w-4 text-gray-500" />;
    
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case "Get Alpha from Group Texts":
        return "bg-blue-500/20 text-blue-500";
      case "Analyse Texts":
        return "bg-purple-500/20 text-purple-500";
      case "Analyse Each Alpha":
        return "bg-purple-500/20 text-purple-500";
      case "Check EDU Balance":
        return "bg-green-500/20 text-green-500";
      case "Check Token Balance":
        return "bg-green-500/20 text-green-500";
      case "Validation Layer":
        return "bg-yellow-500/20 text-yellow-500";
      case "Trust Layer":
        return "bg-yellow-500/20 text-yellow-500";
      case "Get Historical Data":
        return "bg-blue-500/20 text-blue-500";
      case "Detect Trends":
        return "bg-blue-500/20 text-blue-500";
      case "Get PNL Potential":
        return "bg-blue-500/20 text-blue-500";
      case "Get Tweets":
        return "bg-blue-500/20 text-blue-500";
      case "Analyse Tweets":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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

              <div className="relative">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Get Alpha from Group Texts">Get Alpha</SelectItem>
                    <SelectItem value="Analyse Texts">Analyse Texts</SelectItem>
                    <SelectItem value="Analyse Each Alpha">Analyse Alpha</SelectItem>
                    <SelectItem value="Check EDU Balance">Check EDU</SelectItem>
                    <SelectItem value="Check Token Balance">Check Token</SelectItem>
                    <SelectItem value="Validation Layer">Validation</SelectItem>
                    <SelectItem value="Trust Layer">Trust</SelectItem>
                    <SelectItem value="Get Historical Data">Historical Data</SelectItem>
                    <SelectItem value="Detect Trends">Trends</SelectItem>
                    <SelectItem value="Get PNL Potential">PNL Potential</SelectItem>
                    <SelectItem value="Get Tweets">Get Tweets</SelectItem>
                    <SelectItem value="Analyse Tweets">Analyse Tweets</SelectItem>
                    <SelectItem value="Buy Token ALT">Buy Token ALT</SelectItem>
                    <SelectItem value="Buy Token DEAL">Buy Token DEAL</SelectItem>
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
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
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
          ) : error ? (
            <Card className="glass-card neon-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  Error Loading Logs
                </h3>
                <p className="text-gray-400 text-center max-w-md">
                  {error}
                </p>
              </CardContent>
            </Card>
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
                key={action.timestamp.toISOString()}
                className="glass-card neon-border overflow-hidden"
              >
                <div className="border-l-4 border-primary">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center">
                        <Badge
                          className={`mr-3 ${getActionTypeColor(action.action)}`}
                        >
                          <span className="flex items-center">
                            {getActionTypeIcon(action.action)}
                            <span className="ml-1">
                              {action.action}
                            </span>
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="flex items-center mr-4">
                          {getActionStatusIcon(action.output?.status)}
                          <span className="ml-1 text-sm capitalize">
                            {action.output?.status || "unknown"}
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Input Data
                        </h4>
                        {typeof action.input === 'object' ? (
                          <ul className="space-y-1 text-sm">
                            {Object.entries(action.input).map(([key, value], index) => (
                              <li key={index} className="flex items-start">
                                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                                  {index + 1}
                                </span>
                                <span>
                                  <span className="font-medium">{key}:</span>{" "}
                                  {Array.isArray(value) ? (
                                    <ul className="mt-1 space-y-1">
                                      {value.map((item, itemIndex) => (
                                        <li key={itemIndex} className="ml-4">
                                          {Array.isArray(item) ? (
                                            <ul className="mt-1 space-y-1">
                                              {item.map((subItem, subIndex) => (
                                                <li key={subIndex} className="ml-4">
                                                  {typeof subItem === "object" ? (
                                                    <pre className="inline-block">
                                                      {JSON.stringify(subItem, null, 2)}
                                                    </pre>
                                                  ) : subItem !== undefined ? (
                                                    subItem.toString()
                                                  ) : (
                                                    "undefined"
                                                  )}
                                                </li>
                                              ))}
                                            </ul>
                                          ) : typeof item === "object" ? (
                                            <pre className="inline-block">
                                              {JSON.stringify(item, null, 2)}
                                            </pre>
                                          ) : item !== undefined ? (
                                            item.toString()
                                          ) : (
                                            "undefined"
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : typeof value === "object" ? (
                                    <pre className="inline-block">
                                      {JSON.stringify(value, null, 2)}
                                    </pre>
                                  ) : value !== undefined ? (
                                    key.toLowerCase().includes('hash') ? (
                                      <div className="flex items-center gap-2">
                                        <span>{value.toString()}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(value.toString(), `hash-${value}-${action.timestamp.toISOString()}`)}
                                          className="h-6 w-6 p-0 hover:bg-primary/10 transition-all duration-300 relative"
                                        >
                                          {copied === `hash-${value}-${action.timestamp.toISOString()}` ? (
                                            "✓"
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    ) : (
                                      value.toString()
                                    )
                                  ) : (
                                    "undefined"
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm">
                            {action.input !== undefined ? action.input.toString() : "undefined"}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Output Data
                        </h4>
                        {typeof action.output === 'object' ? (
                          <ul className="space-y-1 text-sm">
                            {Object.entries(action.output).map(([key, value], index) => (
                              <li key={index} className="flex items-start">
                                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                                  {index + 1}
                                </span>
                                <span>
                                  <span className="font-medium">{key}:</span>{" "}
                                  {Array.isArray(value) ? (
                                    <ul className="mt-1 space-y-1">
                                      {value.map((item, itemIndex) => (
                                        <li key={itemIndex} className="ml-4">
                                          {Array.isArray(item) ? (
                                            <ul className="mt-1 space-y-1">
                                              {item.map((subItem, subIndex) => (
                                                <li key={subIndex} className="ml-4">
                                                  {typeof subItem === "object" ? (
                                                    <pre className="inline-block">
                                                      {JSON.stringify(subItem, null, 2)}
                                                    </pre>
                                                  ) : subItem !== undefined ? (
                                                    subItem.toString()
                                                  ) : (
                                                    "undefined"
                                                  )}
                                                </li>
                                              ))}
                                            </ul>
                                          ) : typeof item === "object" ? (
                                            <pre className="inline-block">
                                              {JSON.stringify(item, null, 2)}
                                            </pre>
                                          ) : item !== undefined ? (
                                            item.toString()
                                          ) : (
                                            "undefined"
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : typeof value === "object" ? (
                                    <pre className="inline-block">
                                      {JSON.stringify(value, null, 2)}
                                    </pre>
                                  ) : value !== undefined ? (
                                    key.toLowerCase().includes('hash') ? (
                                      <div className="flex items-center gap-2">
                                        <span>{value.toString()}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(value.toString(), `hash-${value}-${action.timestamp.toISOString()}`)}
                                          className="h-6 w-6 p-0 hover:bg-primary/10 transition-all duration-300 relative"
                                        >
                                          {copied === `hash-${value}-${action.timestamp.toISOString()}` ? (
                                            "✓"
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    ) : (
                                      value.toString()
                                    )
                                  ) : (
                                    "undefined"
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm">
                            {action.output !== undefined ? action.output.toString() : "undefined"}
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
