"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  BookOpen,
  RefreshCcw,
  Search,
  Calendar,
  Tag,
  ThumbsUp,
  ThumbsDown,
  ArrowUpDown,
  Filter,
  Bookmark,
  Share2,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// Mock data for agent lessons
interface AgentLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  category: "market" | "technical" | "risk" | "strategy";
  tags: string[];
  confidence: number;
  impact: "high" | "medium" | "low";
  timestamp: number;
  relatedAssets?: string[];
  sourcesCount: number;
}

const mockAgentLessons: AgentLesson[] = [
  {
    id: "lesson-1",
    title: "Market Sentiment Precedes Price Action",
    description:
      "Social media sentiment analysis can predict price movements by 12-24 hours",
    content:
      "After analyzing 3 months of Twitter sentiment data against price movements, the agent has identified a pattern where significant shifts in social sentiment typically precede price movements by 12-24 hours. This correlation is strongest for Bitcoin and large-cap altcoins, with a 78% accuracy rate for predicting directional movements. The agent now prioritizes real-time sentiment analysis in its decision-making process, particularly for short-term trading decisions.",
    category: "market",
    tags: ["sentiment", "social media", "prediction", "correlation"],
    confidence: 78,
    impact: "high",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    relatedAssets: ["BTC", "ETH"],
    sourcesCount: 15,
  },
  {
    id: "lesson-2",
    title: "Whale Wallet Monitoring Effectiveness",
    description:
      "Tracking large wallet movements provides actionable trading signals",
    content:
      "The agent has determined that monitoring the top 100 whale wallets for each major cryptocurrency provides valuable trading signals. When multiple whale wallets (>5) make similar movements within a 6-hour window, there is an 82% chance of a significant price movement in the same direction within 48 hours. The agent has implemented an alert system for coordinated whale movements and now factors this data into its allocation decisions with a higher weighting than previously assigned.",
    category: "market",
    tags: ["whales", "on-chain", "wallet tracking", "signals"],
    confidence: 82,
    impact: "high",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    relatedAssets: ["BTC", "ETH", "SOL"],
    sourcesCount: 8,
  },
  {
    id: "lesson-3",
    title: "Technical Indicator Combination Optimization",
    description:
      "Specific combinations of indicators perform better in different market conditions",
    content:
      "Through backtesting across various market conditions, the agent has identified optimal combinations of technical indicators for different market phases. During trending markets, a combination of MACD, Bollinger Bands, and Volume-weighted RSI outperforms other indicator sets with a 73% success rate. During sideways/ranging markets, Ichimoku Cloud combined with Accumulation/Distribution and Stochastic RSI provides the most reliable signals. The agent now dynamically switches its technical analysis approach based on detected market conditions.",
    category: "technical",
    tags: ["indicators", "technical analysis", "optimization", "backtesting"],
    confidence: 73,
    impact: "medium",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
    relatedAssets: ["BTC", "ETH", "SOL", "AVAX"],
    sourcesCount: 12,
  },
  {
    id: "lesson-4",
    title: "Risk Management During Market Volatility",
    description:
      "Optimal position sizing adjustments during high volatility periods",
    content:
      "Analysis of trading performance during high volatility periods revealed that reducing position sizes by 40-50% while increasing the number of positions (diversification) resulted in better risk-adjusted returns. When VIX or crypto volatility indices spike above 85th percentile of their 90-day range, the agent now automatically adjusts its position sizing algorithm and increases diversification. This approach has reduced drawdowns by 35% during volatile periods while maintaining 85% of the upside capture.",
    category: "risk",
    tags: ["volatility", "position sizing", "risk management", "drawdown"],
    confidence: 85,
    impact: "high",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
    relatedAssets: ["BTC", "ETH", "SOL", "AVAX"],
    sourcesCount: 10,
  },
  {
    id: "lesson-5",
    title: "Solana Ecosystem Growth Patterns",
    description:
      "Early identification of successful projects based on developer activity",
    content:
      "After tracking the development activity of 50+ projects in the Solana ecosystem, the agent has identified key patterns that correlate with successful project growth. Projects that maintain consistent GitHub commit activity (>30 commits weekly) for at least 8 consecutive weeks and have at least 3 experienced developers (with previous blockchain project history) have a 68% higher chance of achieving significant adoption within 6 months. The agent now incorporates developer activity metrics as a primary filter for early-stage project evaluation.",
    category: "strategy",
    tags: ["ecosystem", "development", "github", "adoption"],
    confidence: 68,
    impact: "medium",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
    relatedAssets: ["SOL"],
    sourcesCount: 7,
  },
  {
    id: "lesson-6",
    title: "News Impact Decay Function",
    description:
      "Quantifying how quickly markets digest different types of news",
    content:
      "By analyzing price reactions to over 200 significant news events, the agent has developed a decay function that models how quickly different types of news are priced into the market. Regulatory news has the longest impact period (3-5 days), while partnership announcements and technical updates typically see their impact diminish within 24-48 hours. The agent now applies category-specific temporal weightings to news events when calculating their expected impact on price movements, improving the timing of entry and exit decisions.",
    category: "market",
    tags: ["news", "events", "timing", "decay"],
    confidence: 71,
    impact: "medium",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 18, // 18 days ago
    relatedAssets: ["BTC", "ETH"],
    sourcesCount: 14,
  },
  {
    id: "lesson-7",
    title: "DCA Strategy Optimization",
    description: "Optimal frequency and allocation for dollar-cost averaging",
    content:
      "After simulating various dollar-cost averaging (DCA) strategies across multiple market cycles, the agent has determined that a variable-frequency approach outperforms fixed interval DCA. Specifically, increasing purchase frequency and amounts during periods of high fear (as measured by the Fear & Greed Index below 25) and reducing frequency during extreme greed (index above 75) improved returns by 18% compared to fixed-interval DCA. The agent now implements a dynamic DCA strategy that adjusts based on market sentiment indicators.",
    category: "strategy",
    tags: ["DCA", "dollar cost averaging", "timing", "sentiment"],
    confidence: 76,
    impact: "medium",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 22, // 22 days ago
    relatedAssets: ["BTC", "ETH"],
    sourcesCount: 9,
  },
];

export default function AgentLessonsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "confidence" | "impact"
  >("newest");
  const [agentLessons, setAgentLessons] = useState<AgentLesson[]>([]);
  const [savedLessons, setSavedLessons] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading agent lessons
    setTimeout(() => {
      setAgentLessons(mockAgentLessons);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredLessons = agentLessons.filter((lesson) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (lesson.relatedAssets &&
        lesson.relatedAssets.some((asset) =>
          asset.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    // Apply category filter
    const matchesCategory =
      filterCategory === "all" || lesson.category === filterCategory;

    // Apply impact filter
    const matchesImpact =
      filterImpact === "all" || lesson.impact === filterImpact;

    return matchesSearch && matchesCategory && matchesImpact;
  });

  // Sort lessons
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return b.timestamp - a.timestamp;
      case "oldest":
        return a.timestamp - b.timestamp;
      case "confidence":
        return b.confidence - a.confidence;
      case "impact":
        const impactValue = { high: 3, medium: 2, low: 1 };
        return impactValue[b.impact] - impactValue[a.impact];
      default:
        return 0;
    }
  });

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "market":
        return <Tag className="h-4 w-4" />;
      case "technical":
        return <BookOpen className="h-4 w-4" />;
      case "risk":
        return <ThumbsDown className="h-4 w-4" />;
      case "strategy":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "market":
        return "bg-blue-500/20 text-blue-500";
      case "technical":
        return "bg-purple-500/20 text-purple-500";
      case "risk":
        return "bg-red-500/20 text-red-500";
      case "strategy":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-green-500/20 text-green-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500";
      case "low":
        return "bg-gray-500/20 text-gray-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const toggleSaveLesson = (lessonId: string) => {
    if (savedLessons.includes(lessonId)) {
      setSavedLessons(savedLessons.filter((id) => id !== lessonId));
    } else {
      setSavedLessons([...savedLessons, lessonId]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Agent Lessons
            </h1>
            <p className="text-gray-400">
              Insights and lessons learned by your AI agent from its actions and
              decisions
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
                  placeholder="Search lessons..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterImpact} onValueChange={setFilterImpact}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Impact Levels</SelectItem>
                    <SelectItem value="high">High Impact</SelectItem>
                    <SelectItem value="medium">Medium Impact</SelectItem>
                    <SelectItem value="low">Low Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={sortOrder}
                  onValueChange={(value: any) => setSortOrder(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="confidence">
                      Highest Confidence
                    </SelectItem>
                    <SelectItem value="impact">Highest Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-12">
              <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedLessons.length === 0 ? (
            <div className="col-span-2">
              <Card className="glass-card neon-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    No lessons found
                  </h3>
                  <p className="text-gray-400 text-center max-w-md">
                    No agent lessons match your current filters. Try adjusting
                    your search criteria or check back later.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            sortedLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="glass-card neon-border overflow-hidden"
              >
                <div className="border-l-4 border-primary h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge
                        className={`mb-2 ${getCategoryColor(lesson.category)}`}
                      >
                        <span className="flex items-center">
                          {getCategoryIcon(lesson.category)}
                          <span className="ml-1 capitalize">
                            {lesson.category}
                          </span>
                        </span>
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleSaveLesson(lesson.id)}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${
                              savedLessons.includes(lesson.id)
                                ? "fill-primary text-primary"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Share2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {lesson.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-300">{lesson.content}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {lesson.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {lesson.relatedAssets &&
                        lesson.relatedAssets.length > 0 && (
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-400 mr-2">
                              Related Assets:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {lesson.relatedAssets.map((asset, index) => (
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
                  </CardContent>
                  <CardFooter className="border-t border-gray-800 pt-3 flex flex-col sm:flex-row justify-between">
                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          Confidence
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">
                            {lesson.confidence}%
                          </span>
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${lesson.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Impact</div>
                        <Badge className={`${getImpactColor(lesson.impact)}`}>
                          <span className="capitalize">{lesson.impact}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span title={formatDate(lesson.timestamp)}>
                        {formatTimeAgo(lesson.timestamp)}
                      </span>
                      <span className="mx-2">•</span>
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span>{lesson.sourcesCount} sources</span>
                    </div>
                  </CardFooter>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Learning Statistics */}
        <Card className="glass-card neon-border mt-8">
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
            <CardDescription>
              Overview of your AI agent's learning progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="categories">
              <TabsList className="mb-4">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="application">Application</TabsTrigger>
              </TabsList>

              <TabsContent value="categories">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Market Lessons
                    </h4>
                    <div className="text-2xl font-bold">12</div>
                    <Progress value={40} className="h-2 mt-2" />
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Technical Lessons
                    </h4>
                    <div className="text-2xl font-bold">8</div>
                    <Progress value={27} className="h-2 mt-2" />
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Risk Lessons
                    </h4>
                    <div className="text-2xl font-bold">5</div>
                    <Progress value={17} className="h-2 mt-2" />
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Strategy Lessons
                    </h4>
                    <div className="text-2xl font-bold">5</div>
                    <Progress value={17} className="h-2 mt-2" />
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="text-lg font-medium mb-2">
                    Category Insights
                  </h3>
                  <p className="text-gray-300">
                    Your AI agent has been particularly focused on
                    market-related lessons, which account for 40% of all
                    insights. This reflects the agent's emphasis on
                    understanding market sentiment and on-chain metrics to
                    inform trading decisions. The agent is building a balanced
                    knowledge base across all categories, with technical
                    analysis and risk management showing steady growth in recent
                    weeks.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Last 7 Days
                    </h4>
                    <div className="text-2xl font-bold">5</div>
                    <Progress value={17} className="h-2 mt-2" />
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Last 30 Days
                    </h4>
                    <div className="text-2xl font-bold">18</div>
                    <Progress value={60} className="h-2 mt-2" />
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Last 90 Days
                    </h4>
                    <div className="text-2xl font-bold">30</div>
                    <Progress value={100} className="h-2 mt-2" />
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Learning Rate
                    </h4>
                    <div className="text-2xl font-bold">+12%</div>
                    <div className="text-xs text-gray-400 mt-1">
                      vs previous period
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="text-lg font-medium mb-2">
                    Learning Acceleration
                  </h3>
                  <p className="text-gray-300">
                    Your AI agent's learning rate has increased by 12% compared
                    to the previous period. This acceleration is primarily
                    driven by improved data processing capabilities and expanded
                    access to market data sources. The agent is now able to
                    identify patterns and draw conclusions more quickly,
                    particularly in the areas of market sentiment analysis and
                    on-chain metrics interpretation.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="application">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Applied Lessons
                    </h4>
                    <div className="text-2xl font-bold">22</div>
                    <div className="text-xs text-gray-400 mt-1">
                      73% of total lessons
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Success Rate
                    </h4>
                    <div className="text-2xl font-bold">68%</div>
                    <div className="text-xs text-gray-400 mt-1">
                      when applied to decisions
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Performance Impact
                    </h4>
                    <div className="text-2xl font-bold">+8.5%</div>
                    <div className="text-xs text-gray-400 mt-1">
                      portfolio improvement
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Most Valuable Lesson
                    </h4>
                    <div className="text-md font-medium">
                      Whale Wallet Monitoring
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      +12.3% performance impact
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="text-lg font-medium mb-2">
                    Application Effectiveness
                  </h3>
                  <p className="text-gray-300">
                    The agent has successfully applied 73% of its learned
                    lessons to actual trading decisions, resulting in an 8.5%
                    improvement in overall portfolio performance. The most
                    impactful lessons have been in the areas of whale wallet
                    monitoring and market sentiment analysis. The agent
                    continues to refine its application of these lessons through
                    an iterative feedback loop, measuring the success of each
                    application and adjusting its confidence levels accordingly.
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
