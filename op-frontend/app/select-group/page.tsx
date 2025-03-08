"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

// Demo groups data
const demoGroups = [
  {
    id: "group1",
    name: "Crypto Traders",
    members: 24,
    description: "Discussion and analysis of cryptocurrency markets",
    lastActive: "2 hours ago",
  },
  {
    id: "group2",
    name: "Stock Market Pros",
    members: 42,
    description: "Professional stock market analysis and discussions",
    lastActive: "5 minutes ago",
  },
  {
    id: "group3",
    name: "Forex Insights",
    members: 18,
    description: "Foreign exchange market trends and strategies",
    lastActive: "1 day ago",
  },
  {
    id: "group4",
    name: "Options Trading",
    members: 31,
    description: "Options trading strategies and market analysis",
    lastActive: "3 hours ago",
  },
  {
    id: "group5",
    name: "Commodity Futures",
    members: 15,
    description: "Analysis and discussion of commodity futures markets",
    lastActive: "Yesterday",
  },
  {
    id: "group6",
    name: "Algorithmic Trading",
    members: 27,
    description: "Automated trading strategies and algorithm development",
    lastActive: "4 hours ago",
  },
];

export default function SelectGroupPage() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  const handleContinue = () => {
    if (selectedGroup) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <style jsx global>{`
        .neon-border-thick {
          box-shadow: 0 0 5px #8b5cf6, 0 0 10px #8b5cf6;
          border: 2px solid #8b5cf6;
        }
      `}</style>

      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-4xl space-y-8 px-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter">
              Select a <span className="neon-text-purple">Group</span>
            </h1>
            <p className="text-muted-foreground">
              Choose a group to access AI-powered market insights and
              discussions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoGroups.map((group) => (
              <div
                key={group.id}
                className={`glass-card p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedGroup === group.id
                    ? "neon-border-thick"
                    : "neon-border hover:scale-[1.01]"
                }`}
                onClick={() => handleGroupSelect(group.id)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{group.members}</span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">
                  {group.description}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Last active: {group.lastActive}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              className="bg-primary hover:bg-primary/80 neon-glow group transition-all duration-300 ease-in-out z-20 relative px-8"
              disabled={!selectedGroup}
              onClick={handleContinue}
            >
              Continue to Group
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
