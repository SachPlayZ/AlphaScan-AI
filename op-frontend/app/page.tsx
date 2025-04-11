import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  MessageSquare,
  Search,
  Twitter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Market Intelligence{" "}
                    <span className="neon-text-purple">Powered by AI</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    AlphaScan AI analyzes market trends across social platforms
                    to provide you with data-driven insights for smarter trading
                    decisions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/80 neon-glow group transition-all duration-300 ease-in-out"
                    asChild
                  >
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="neon-border">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-full overflow-hidden rounded-xl glass p-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-4 rounded-lg glass-card p-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold neon-text-cyan">
                          Market Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Our AI has detected increased activity for token ABC
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">
                                Social Mentions
                              </span>
                            </div>
                            <span className="text-sm font-medium text-accent">
                              +245%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[85%] rounded-full bg-primary" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Twitter className="h-4 w-4 text-secondary" />
                              <span className="text-sm font-medium">
                                Twitter Sentiment
                              </span>
                            </div>
                            <span className="text-sm font-medium text-accent">
                              Positive
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[75%] rounded-full bg-accent" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-secondary" />
                              <span className="text-sm font-medium">
                                Trading Volume
                              </span>
                            </div>
                            <span className="text-sm font-medium text-accent">
                              +178%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[65%] rounded-full bg-secondary" />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-background/50 p-3 neon-border">
                        <p className="text-sm">
                          <strong className="neon-text-cyan">
                            AI Insight:
                          </strong>{" "}
                          Token ABC shows strong community growth with positive
                          sentiment across platforms. Consider reviewing for
                          potential opportunity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg glass px-3 py-1 text-sm neon-border">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Powered by{" "}
                  <span className="neon-text-purple">Advanced AI</span>
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines multiple data sources with AI analysis
                  to provide you with actionable market intelligence.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg glass-card p-6 neon-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold neon-text-purple">
                  Social Scanning
                </h3>
                <p className="text-center text-muted-foreground">
                  Monitors conversations across platforms to identify emerging
                  trends and opportunities.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg glass-card p-6 neon-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                  <BrainCircuit className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold neon-text-cyan">
                  AI Analysis
                </h3>
                <p className="text-center text-muted-foreground">
                  Advanced language models process information to separate
                  signal from noise.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg glass-card p-6 neon-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                  <BarChart3 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold neon-text-green">
                  Market Insights
                </h3>
                <p className="text-center text-muted-foreground">
                  Receive detailed reports on why certain assets are trending
                  with supporting data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg glass px-3 py-1 text-sm neon-border">
                  Process
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  How <span className="neon-text-cyan">AlphaScan AI</span> Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our transparent process helps you understand exactly how we
                  generate insights.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2">
              <div className="flex flex-col space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground neon-glow">
                    <span className="h-4 w-10 text-center text-sm leading-none">
                      1
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold neon-text-purple">
                      Data Collection
                    </h3>
                    <p className="text-muted-foreground">
                      Our system continuously monitors social platforms for
                      discussions about market trends and specific assets.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                    style={{ boxShadow: "0 0 5px #00c8ff, 0 0 20px #00c8ff" }}
                  >
                    <span className="h-4 w-10 text-center text-sm leading-none">
                      2
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold neon-text-cyan">
                      AI Processing
                    </h3>
                    <p className="text-muted-foreground">
                      Our language models analyze the collected data to identify
                      meaningful patterns and filter out noise.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"
                    style={{ boxShadow: "0 0 5px #00ff4c, 0 0 20px #00ff4c" }}
                  >
                    <span className="h-4 w-10 text-center text-sm leading-none">
                      3
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold neon-text-green">
                      Cross-Verification
                    </h3>
                    <p className="text-muted-foreground">
                      The system cross-references information across multiple
                      sources to validate trends and reduce false positives.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground neon-glow">
                    <span className="h-4 w-10 text-center text-sm leading-none">
                      4
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold neon-text-purple">
                      Insight Generation
                    </h3>
                    <p className="text-muted-foreground">
                      You receive detailed reports with the reasoning behind
                      each insight, including the data sources used.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-full overflow-hidden rounded-xl glass p-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=400&width=400"
                      height={400}
                      width={400}
                      alt="AI Analysis Process Visualization"
                      className="rounded-lg shadow-lg neon-border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg glass px-3 py-1 text-sm neon-border">
                  FAQ
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Frequently Asked{" "}
                  <span className="neon-text-green">Questions</span>
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get answers to common questions about our platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <div className="space-y-2 glass-card p-6 rounded-lg neon-border">
                <h3 className="text-xl font-bold neon-text-purple">
                  How accurate are the insights?
                </h3>
                <p className="text-muted-foreground">
                  Our system achieves over 85% accuracy in trend identification.
                  However, all market analysis comes with inherent uncertainty,
                  and we provide confidence scores with each insight.
                </p>
              </div>
              <div className="space-y-2 glass-card p-6 rounded-lg neon-border">
                <h3 className="text-xl font-bold neon-text-cyan">
                  What data sources do you use?
                </h3>
                <p className="text-muted-foreground">
                  We analyze public conversations from major social platforms,
                  news sources, and market data. All data collection complies
                  with platform terms of service.
                </p>
              </div>
              <div className="space-y-2 glass-card p-6 rounded-lg neon-border">
                <h3 className="text-xl font-bold neon-text-green">
                  How often are insights updated?
                </h3>
                <p className="text-muted-foreground">
                  Our system continuously monitors and processes data, with new
                  insights typically generated every 15-30 minutes depending on
                  market activity.
                </p>
              </div>
              <div className="space-y-2 glass-card p-6 rounded-lg neon-border">
                <h3 className="text-xl font-bold neon-text-purple">
                  Is my data secure?
                </h3>
                <p className="text-muted-foreground">
                  Yes, we employ enterprise-grade encryption and security
                  practices. Your account information and preferences are never
                  shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to <span className="neon-text-cyan">Transform</span>{" "}
                  Your Market Analysis?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of traders using AI-powered insights to stay
                  ahead of market trends.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/80 neon-glow group transition-all duration-300 ease-in-out"
                  asChild
                >
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="neon-border">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full glass py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 <span className="neon-text-purple">AlphaScan AI</span>. All
            rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-secondary"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-accent"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
