"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Search,
  Menu,
  X,
  ArrowRight,
  Activity,
  BookOpen,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";

// Dummy market data
const marketData = [
  { symbol: "BTC/USD", price: "68,245.32", change: "+2.4%", trend: "up" },
  { symbol: "ETH/USD", price: "3,782.15", change: "+1.8%", trend: "up" },
  { symbol: "AAPL", price: "187.32", change: "-0.5%", trend: "down" },
  { symbol: "MSFT", price: "415.75", change: "+1.2%", trend: "up" },
  { symbol: "TSLA", price: "178.54", change: "-2.1%", trend: "down" },
];

// Dummy insights
const insights = [
  {
    id: "insight1",
    title: "BTC showing bullish divergence",
    description:
      "Technical indicators suggest a potential upward movement in the next 24-48 hours.",
    timestamp: "10 minutes ago",
    confidence: "High",
  },
  {
    id: "insight2",
    title: "AAPL earnings impact analysis",
    description:
      "AI analysis of recent earnings call suggests positive long-term outlook despite short-term volatility.",
    timestamp: "2 hours ago",
    confidence: "Medium",
  },
  {
    id: "insight3",
    title: "Market volatility alert",
    description:
      "Increased market volatility expected due to upcoming Federal Reserve announcement.",
    timestamp: "1 day ago",
    confidence: "High",
  },
];

// Dummy group activity
const groupActivity = [
  {
    id: "activity1",
    user: "Alex Chen",
    action: "shared an analysis on BTC/USD",
    timestamp: "5 minutes ago",
  },
  {
    id: "activity2",
    user: "Sarah Johnson",
    action: "asked about TSLA earnings impact",
    timestamp: "30 minutes ago",
  },
  {
    id: "activity3",
    user: "Michael Wong",
    action: "posted a chart analysis for ETH/USD",
    timestamp: "2 hours ago",
  },
];

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile, shown on larger screens */}
        <aside className="hidden md:flex w-64 flex-col glass-card m-4 rounded-lg p-4 neon-border z-10">
          <nav className="space-y-2 flex-1 relative z-20">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 hover:pl-4 relative z-20"
            >
              <BarChart3 className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/market-analysis"
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4 relative z-20"
            >
              <LineChart className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span>Market Analysis</span>
            </Link>
            <Link
              href="/portfolio"
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4 relative z-20"
            >
              <PieChart className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span>Portfolio</span>
            </Link>
            <Link
              href="/agent-actions"
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4 relative z-20"
            >
              <Activity className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span>Agent Actions</span>
            </Link>
            <Link
              href="/agent-lessons"
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4 relative z-20"
            >
              <BookOpen className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span>Agent Lessons</span>
            </Link>
            <Link
              href="/wallet"
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4 relative z-20"
            >
              <Wallet className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span>Wallet</span>
            </Link>
          </nav>
        </aside>

        {/* Mobile menu button */}
        <button
          className="md:hidden fixed top-20 left-4 z-50 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 hover:scale-110"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 animate-spin-once" />
          ) : (
            <Menu className="h-6 w-6 hover:rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
            <div className="glass-card h-full w-64 p-4 neon-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 hover:pl-4"
                >
                  <BarChart3 className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/market-analysis"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4"
                >
                  <LineChart className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Market Analysis</span>
                </Link>
                <Link
                  href="/portfolio"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4"
                >
                  <PieChart className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Portfolio</span>
                </Link>
                <Link
                  href="/agent-actions"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4"
                >
                  <Activity className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Agent Actions</span>
                </Link>
                <Link
                  href="/agent-lessons"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4"
                >
                  <BookOpen className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Agent Lessons</span>
                </Link>
                <Link
                  href="/wallet"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:pl-4"
                >
                  <Wallet className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Wallet</span>
                </Link>
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4">
          <div className="flex flex-col space-y-6">
            {/* Header with search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold">
                Welcome to{" "}
                <span className="neon-text-purple">AlphaScan AI</span>
              </h1>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets, insights..."
                  className="pl-10 glass w-full"
                />
              </div>
            </div>

            {/* Market overview */}
            <div className="glass-card p-6 rounded-lg neon-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Market Overview</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                >
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {marketData.map((item, index) => (
                  <div
                    key={index}
                    className="glass p-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{item.symbol}</span>
                      {item.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-bold">${item.price}</span>
                      <span
                        className={`ml-2 text-sm ${
                          item.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Two column layout for insights and activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Insights */}
              <div className="glass-card p-6 rounded-lg neon-border lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">AI Insights</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="glass p-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            insight.confidence === "High"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {insight.confidence}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {insight.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {insight.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Activity */}
              <div className="glass-card p-6 rounded-lg neon-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Group Activity</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {groupActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">
                          {activity.user
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallet Summary */}
              <div className="glass-card p-6 rounded-lg neon-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Wallet Summary</h2>
                  <Link href="/wallet">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>

                <div className="flex justify-center items-center py-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      View your wallet details and manage your assets
                    </p>
                    <Link href="/wallet">
                      <Button className="neon-border-button">
                        Go to Wallet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue button */}
            <Button
              type="button"
              className="bg-primary hover:bg-primary/80 neon-glow group transition-all duration-300 ease-in-out z-20 relative self-start"
              onClick={() => {
                /* action */
              }}
            >
              View Detailed Reports
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-2" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
