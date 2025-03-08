"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MarketAnalysisPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="glass-card p-8 rounded-lg neon-border max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold mb-6">
            <span className="neon-text-purple">Market Analysis</span>
          </h1>
          <p className="text-lg mb-8">
            This page is under construction. Advanced market analysis features
            coming soon!
          </p>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/80 neon-glow group transition-all duration-300 ease-in-out relative">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
