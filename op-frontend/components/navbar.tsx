"use client";

import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold neon-text-purple">
              AlphaScan AI
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              FAQ
            </button>
            <div className="ml-4">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="bg-primary hover:bg-primary/80 neon-glow text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                            >
                              Connect Wallet
                            </button>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="bg-primary/20 hover:bg-primary/30 text-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors neon-border"
                            >
                              {chain.hasIcon && (
                                <div className="w-5 h-5">
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? "Chain icon"}
                                      src={chain.iconUrl}
                                      className="w-5 h-5"
                                    />
                                  )}
                                </div>
                              )}
                              {chain.name}
                            </button>

                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="bg-primary hover:bg-primary/80 neon-glow text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ""}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
