import * as chains from "viem/chains";

export type BaseConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  burnerWalletMode: "localNetworksOnly" | "allNetworks" | "disabled";
};

export type ScaffoldConfig = BaseConfig;

export const DEFAULT_ALCHEMY_API_KEY = "IZYEU2cWBgnFmgiTAgpWD";

const scaffoldConfig = {
  // The networks on which the DApp is live
  targetNetworks: [chains.sepolia],
  // The interval at which the front-end polls the RPC servers for new data.
  pollingInterval: 4000,

  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  rpcOverrides: {
    // Example:
    // [chains.mainnet.id]: "https://mainnet.rpc.buidlguidl.com",
  },

  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  burnerWalletMode: "localNetworksOnly",
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
