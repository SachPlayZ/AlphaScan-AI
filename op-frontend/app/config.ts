import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { type Chain } from "viem";

export const pharosDevnet = {
  id: 50002,
  name: "Pharos Devnet",
  nativeCurrency: { name: "Pharos", symbol: "PHR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://devnet.dplabs-internal.com"] },
  },
  blockExplorers: {
    default: {
      name: "Pharos Explorer",
      url: "https://pharosscan.xyz",
    },
  },
} as const satisfies Chain;

export function getConfig() {
  return createConfig({
    chains: [pharosDevnet],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [pharosDevnet.id]: http(),
    },
  });
}
