import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  paths: {
    artifacts: "./src",
  },
  networks: {
    "edu-chain-testnet": {
      // Testnet configuration
      url: `https://rpc.open-campus-codex.gelato.digital`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    "edu-chain": {
      // Mainnet configuration
      url: `https://rpc.edu-chain.raas.gelato.cloud`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      "edu-chain-testnet": "XXXX",
      "edu-chain": "XXXX",
    },
    customChains: [
      {
        network: "edu-chain-testnet",
        chainId: 656476,
        urls: {
          apiURL: "https://edu-chain-testnet.blockscout.com/api",
          browserURL: "https://edu-chain-testnet.blockscout.com",
        },
      },
      {
        network: "edu-chain",
        chainId: 41923, // Replace with the correct mainnet chain ID if different
        urls: {
          apiURL: "https://educhain.blockscout.com/api",
          browserURL: "https://educhain.blockscout.com",
        },
      },
    ],
  },
};

export default config;
