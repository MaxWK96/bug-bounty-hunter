"use client";

import { Address } from "@scaffold-ui/components";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const WalletInfo = () => {
  const { address, chain } = useAccount();
  const { data: balance } = useScaffoldReadContract({
    contractName: "BugToken",
    functionName: "balanceOf",
    args: [address],
  });

  if (!address) {
    return <p className="text-center">Connect your wallet (top right) to start hunting.</p>;
  }

  return (
    <div className="card bg-base-100 shadow-md p-5 w-full max-w-md">
      <p className="text-sm opacity-70">Connected wallet</p>
      <Address address={address} />
      <p className="text-sm opacity-70 mt-2">Network: {chain?.name ?? "Unknown"}</p>
      <p className="text-3xl font-bold mt-2">
        {balance !== undefined ? Number(formatEther(balance)).toLocaleString() : "…"} BUG
      </p>
    </div>
  );
};
