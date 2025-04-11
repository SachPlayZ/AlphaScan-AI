import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { type Chain } from "viem";

export const eduTestnet = {
  id: 656476,
  name: "EDU Chain Testnet",
  nativeCurrency: { name: "EDU", symbol: "EDU", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:3000/api/proxy"] },
  },
  blockExplorers: {
    default: {
      name: "EduScan",
      url: "https://edu-chain-testnet.blockscout.com/",
    },
  },
} as const satisfies Chain;

export function getConfig() {
  return createConfig({
    chains: [eduTestnet],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [eduTestnet.id]: http(),
    },
  });
}
