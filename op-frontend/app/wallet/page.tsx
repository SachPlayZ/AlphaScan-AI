"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Wallet as WalletIcon,
  ExternalLink,
  Send,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getOrCreateWallet,
  WalletData,
  updateEduBalance,
  sendEduTokens,
} from "@/lib/wallet";
import { pharosDevnet } from "@/app/config";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { abi, contractAddress } from "@/app/abi";
import { useReadContract, useWriteContract } from "wagmi";

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [isSendingTokens, setIsSendingTokens] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const { writeContractAsync: mapWallet } = useWriteContract();

  const { data: agentPublicKey, isLoading: isPublicKeyLoading } =
    useReadContract({
      address: contractAddress,
      abi: abi,
      functionName: "getPublicKey",
      args: [],
    });
  const { data: agentPrivateKey, isLoading: isPrivateKeyLoading } =
    useReadContract({
      address: contractAddress,
      abi: abi,
      functionName: "getPrivateKey",
      args: [],
    });

  useEffect(() => {
    // Get or create wallet on component mount
    const fetchWallet = async () => {
      // Check if agent keys exist on the blockchain
      if (agentPublicKey && agentPrivateKey) {
        // Use the keys from the blockchain
        const walletData: WalletData = {
          address: agentPublicKey as string,
          privateKey: agentPrivateKey as string,
          balance: 0,
          eduBalance: 0,
          transactions: [],
        };

        try {
          // Update EDU balance for the wallet from blockchain
          const updatedWallet = await updateEduBalance(walletData);

          // Save blockchain keys to localStorage if they don't exist or are different
          const existingWallet = localStorage.getItem("wallet");
          if (
            !existingWallet ||
            JSON.parse(existingWallet).address !== agentPublicKey ||
            JSON.parse(existingWallet).privateKey !== agentPrivateKey
          ) {
            localStorage.setItem(
              "wallet",
              JSON.stringify({
                address: agentPublicKey,
                privateKey: agentPrivateKey,
              })
            );
          }

          setWallet(updatedWallet);
        } catch (error) {
          console.error("Error updating EDU balance:", error);
          setWallet(walletData);
        }
      } else {
        // No keys on blockchain, check localStorage first
        const existingWallet = localStorage.getItem("wallet");
        let walletData: WalletData;

        if (existingWallet) {
          // Use existing wallet from localStorage
          const parsedWallet = JSON.parse(existingWallet);
          walletData = {
            address: parsedWallet.address,
            privateKey: parsedWallet.privateKey,
            balance: 0,
            eduBalance: 0,
            transactions: [],
          };
        } else {
          // No wallet in localStorage, create a new one
          walletData = getOrCreateWallet();
        }

        try {
          // Update EDU balance
          const updatedWallet = await updateEduBalance(walletData);
          setWallet(updatedWallet);
        } catch (error) {
          console.error("Error updating EDU balance:", error);
          setWallet(walletData);
        }
      }

      setIsLoading(false);
    };

    fetchWallet();
  }, [agentPublicKey, agentPrivateKey]);

  const refreshEduBalance = async () => {
    if (!wallet) return;

    setIsRefreshingBalance(true);

    try {
      const updatedWallet = await updateEduBalance(wallet);
      setWallet(updatedWallet);
    } catch (error) {
      console.error("Error refreshing EDU balance:", error);
    }

    setIsRefreshingBalance(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatKey = (key: string) => {
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  };

  const getExplorerAddressUrl = (address: string) => {
    return `${pharosDevnet.blockExplorers.default.url}/address/${address}`;
  };

  const handleSendEduTokens = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) return;

    if (!recipientAddress || !sendAmount) {
      toast({
        title: "Error",
        description: "Please enter a recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(sendAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > wallet.eduBalance) {
      toast({
        title: "Error",
        description: "Insufficient EDU balance",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTokens(true);

    try {
      const result = await sendEduTokens(
        wallet,
        recipientAddress,
        amount,
        "EDU Transfer"
      );

      if (result.success) {
        toast({
          title: "Success",
          description: "EDU tokens sent successfully",
          variant: "default",
          action: result.txHash ? (
            <ToastAction altText="View on Explorer">
              <a
                href={`${pharosDevnet.blockExplorers.default.url}/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </ToastAction>
          ) : undefined,
        });

        // Refresh wallet data
        const updatedWallet = await updateEduBalance(wallet);
        setWallet(updatedWallet);

        // Reset form
        setRecipientAddress("");
        setSendAmount("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send EDU tokens",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending EDU tokens:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setIsSendingTokens(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              <span className="neon-text-purple">Agent Wallet</span>
            </h1>
          </div>

          {wallet && (
            <div className="space-y-6">
              {/* Wallet Overview */}
              <div className="glass-card p-6 rounded-lg neon-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <WalletIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Your Wallet</h2>
                      <p className="text-sm text-muted-foreground">
                        Manage your assets and transactions
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="glass p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        USD Balance
                      </p>
                      <p className="text-2xl font-bold neon-text-purple">
                        ${wallet.balance.toLocaleString()}
                      </p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          EDU Balance
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshEduBalance}
                          disabled={isRefreshingBalance}
                          className="ml-2 hover:bg-primary/10 transition-all duration-300"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${
                              isRefreshingBalance ? "animate-spin" : ""
                            }`}
                          />
                        </Button>
                      </div>
                      <p className="text-2xl font-bold neon-text-green">
                        {wallet.eduBalance.toLocaleString()} EDU
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Wallet Button */}
                <div className="mb-4">
                  <Button
                    variant="outline"
                    className="w-full neon-border-button relative"
                    disabled={
                      isPublicKeyLoading ||
                      isPrivateKeyLoading ||
                      !!(
                        agentPublicKey &&
                        agentPrivateKey &&
                        agentPublicKey !== "" &&
                        agentPrivateKey !== ""
                      )
                    }
                    onClick={async () => {
                      if (!wallet) return;

                      // Additional check to prevent mapping if already mapped
                      if (
                        agentPublicKey &&
                        agentPrivateKey &&
                        agentPublicKey !== "" &&
                        agentPrivateKey !== ""
                      ) {
                        toast({
                          title: "Already Mapped",
                          description:
                            "This wallet is already mapped to the agent service.",
                          variant: "default",
                        });
                        return;
                      }

                      try {
                        // Call the linkKeys function from the contract
                        const tx = await mapWallet({
                          address: contractAddress,
                          abi: abi,
                          functionName: "linkKeys",
                          args: [wallet.privateKey, wallet.address],
                        });

                        toast({
                          title: "Wallet Mapped Successfully",
                          description:
                            "Your wallet has been linked to the agent service.",
                          variant: "default",
                          action: (
                            <ToastAction altText="View on Explorer">
                              <a
                                href={`${pharosDevnet.blockExplorers.default.url}/tx/${tx}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on Explorer
                              </a>
                            </ToastAction>
                          ),
                        });

                        // Refresh the page to load the new wallet
                        window.location.reload();
                      } catch (error) {
                        console.error("Error mapping wallet:", error);
                        toast({
                          title: "Error",
                          description:
                            "Failed to map wallet. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    {isPublicKeyLoading || isPrivateKeyLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Fetching Wallet Info...
                      </>
                    ) : agentPublicKey &&
                      agentPrivateKey &&
                      agentPublicKey !== "" &&
                      agentPrivateKey !== "" ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Wallet Already Mapped
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Map Wallet to Agent
                      </>
                    )}
                  </Button>
                </div>

                {/* Wallet Keys and Address */}
                <div className="space-y-4">
                  <div className="glass p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Wallet Address
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm truncate">
                        {wallet.address}
                      </p>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(wallet.address, "address")
                          }
                          className="ml-2 hover:bg-primary/10 transition-all duration-300"
                        >
                          {copied === "address" ? (
                            "Copied!"
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <a
                          href={getExplorerAddressUrl(wallet.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 hover:bg-primary/10 transition-all duration-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Private Key
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm truncate">
                        {showPrivateKey
                          ? wallet.privateKey
                          : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                      </p>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="ml-2 hover:bg-primary/10 transition-all duration-300"
                        >
                          {showPrivateKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(wallet.privateKey, "private")
                          }
                          className="ml-2 hover:bg-primary/10 transition-all duration-300"
                          disabled={!showPrivateKey}
                        >
                          {copied === "private" ? (
                            "Copied!"
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="text-yellow-500">
                    ⚠️ Never share your private key with anyone. Keep it secure.
                  </p>
                </div>
              </div>

              {/* Send EDU Tokens */}
              <div className="glass-card p-6 rounded-lg neon-border">
                <h2 className="text-xl font-semibold mb-4">Send EDU Tokens</h2>

                <form onSubmit={handleSendEduTokens} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (EDU)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.000001"
                      min="0"
                      placeholder="0.0"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="glass"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full neon-border-button relative"
                    disabled={isSendingTokens}
                  >
                    {isSendingTokens ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send EDU
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Transaction History */}
              <div className="glass-card p-6 rounded-lg neon-border">
                <h2 className="text-xl font-semibold mb-4">
                  Transaction History
                </h2>

                {wallet.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {wallet.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="glass p-4 rounded-lg flex items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            tx.type === "deposit"
                              ? "bg-green-500/20"
                              : "bg-red-500/20"
                          }`}
                        >
                          {tx.type === "deposit" ? (
                            <ArrowDownCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowUpCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{tx.description}</p>
                            <p
                              className={`font-semibold ${
                                tx.type === "deposit"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {tx.type === "deposit" ? "+" : "-"}${tx.amount}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(tx.timestamp)}
                          </p>
                          {tx.hash && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Hash: {formatKey(tx.hash)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No transactions yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
