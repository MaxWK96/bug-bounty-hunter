"use client";

import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const FAUCET_AMOUNT = parseEther("500");

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(n => String(n).padStart(2, "0")).join(":");
};

export const Faucet = () => {
  const { address } = useAccount();

  // tick every second for the countdown
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: nextClaim } = useScaffoldReadContract({
    contractName: "BugToken",
    functionName: "nextClaimTime",
    args: [address],
  });
  const { data: faucetBalance } = useScaffoldReadContract({
    contractName: "BugToken",
    functionName: "faucetBalance",
  });
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "BugToken" });

  const secondsLeft = nextClaim ? Math.max(0, Number(nextClaim) - now) : 0;
  const faucetEmpty = faucetBalance !== undefined && faucetBalance < FAUCET_AMOUNT;
  const canClaim = !!address && secondsLeft === 0 && !faucetEmpty && !isMining;

  const handleClaim = async () => {
    try {
      await writeContractAsync({ functionName: "claim" });
    } catch (e) {
      console.error("Claim failed", e); // scaffold already shows a toast
    }
  };

  return (
    <div className="card bg-base-100 shadow-md p-5 w-full max-w-md text-center">
      <h3 className="text-xl font-bold font-mono">Free $BUG faucet</h3>
      <p className="opacity-70">500 BUG every 24 hours</p>
      <button className="btn btn-primary mt-4" disabled={!canClaim} onClick={handleClaim}>
        {isMining && <span className="loading loading-spinner" />}
        {!address
          ? "Connect wallet first"
          : faucetEmpty
            ? "Faucet is empty"
            : secondsLeft > 0
              ? `Next claim in ${formatTime(secondsLeft)}`
              : "Claim 500 BUG"}
      </button>
    </div>
  );
};
