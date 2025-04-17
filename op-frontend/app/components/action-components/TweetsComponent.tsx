import { Card, CardContent } from "@/components/ui/card";
import { Twitter, MessageCircle, Repeat2, Heart, Share } from "lucide-react";

interface TweetsComponentProps {
  tweets: string[];
}

const randomNames = [
  "Crypto Chad",
  "Moon Girl 🌙",
  "WAGMI Queen",
  "Degen Maximus",
  "Crypto Karen",
  "Based Trader",
  "NFT Princess",
  "Alpha Hunter",
  "Crypto Crusader",
  "Diamond Hands 💎",
  "Rug Pull Survivor",
  "Crypto Wizard 🧙‍♂️",
  "Moon Shot Mike",
  "Crypto Queen 👑",
  "Based Chad",
  "Crypto Ninja",
  "WAGMI Warrior",
  "Degen Ape",
  "Crypto Sensei",
  "Moon Boy 🌙"
];

const randomHandles = [
  "defi_degen420",
  "moon.rocket.btc",
  "wagmi_warrior.eth",
  "chaostrader69", 
  "fomo.master_x",
  "based_degen",
  "nft.degenerate",
  "alpha_seeker420",
  "cryptorebel",
  "diamond.hands_lfg",
  "rug_survivor.x",
  "crypto.mysticeth",
  "moonchaser69",
  "crypto_degen.btc", 
  "basedape.eth",
  "crypto.phantom",
  "wagmilegend",
  "degen_vibes",
  "crypto.sage",
  "moon.wanderer_x"
];

export function TweetsComponent({ tweets }: TweetsComponentProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Twitter className="h-5 w-5" />
        Recent Tweets
      </h3>
      <div className="space-y-3">
        {tweets.map((tweet, index) => {
          const nameIndex = Math.floor(Math.random() * randomNames.length);
          const handleIndex = Math.floor(Math.random() * randomHandles.length);
          return (
            <Card
              key={index}
              className="glass-card hover:bg-gray-800/50 transition-colors"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Twitter className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{randomNames[nameIndex]}</span>
                      <span className="text-gray-400 text-sm">
                        @{randomHandles[handleIndex]}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{tweet}</p>
                    <div className="flex items-center gap-6 text-gray-400">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">
                          {Math.floor(Math.random() * 50)}
                        </span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        <Repeat2 className="h-4 w-4" />
                        <span className="text-xs">
                          {Math.floor(Math.random() * 100)}
                        </span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span className="text-xs">
                          {Math.floor(Math.random() * 200)}
                        </span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Share className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
