"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { RugOrLegit } from "~~/components/bug/RugOrLegit";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const HUNT_COST = parseEther("100");
const MAX_BOUNTY = parseEther("1000");
const APPROVE_AMOUNT = parseEther("1000"); // 10 hunts

// Same order as the Severity enum in the contract
const SEVERITIES = [
  { label: "No findings", emoji: "😴", line: "Clean code. No bounty this time.", color: "" },
  { label: "Gas optimization", emoji: "⛽", line: "Saved a few gwei. Small tip.", color: "text-info" },
  { label: "Low", emoji: "🟢", line: "Minor issue found.", color: "text-success" },
  { label: "Medium", emoji: "🟡", line: "Solid find!", color: "text-warning" },
  { label: "High", emoji: "🟠", line: "That could have hurt someone.", color: "text-orange-500" },
  { label: "Critical", emoji: "🔴", line: "CRITICAL! You saved the protocol!", color: "text-error" },
];

// pick flavor text from requestId so a refresh shows the same finding
const FINDINGS: Record<number, string[]> = {
  1: ["Use calldata instead of memory", "Cache array length in loops", "Pack storage variables"],
  2: ["Missing zero-address check", "Floating pragma", "Event not emitted on state change"],
  3: ["Unchecked return value", "Centralization risk in onlyOwner", "Front-running on approve()"],
  4: ["Oracle price manipulation", "Missing slippage protection", "Signature replay"],
  5: ["Reentrancy in withdraw()", "Unprotected initializer", "Arbitrary delegatecall"],
};

const findingTitle = (severity: number, requestId: bigint) => {
  const list = FINDINGS[severity];
  return list ? list[Number(requestId % BigInt(list.length))] : "Clean code. Nothing found.";
};

// rug or legit score is just local state, nothing on-chain
type RugScore = { correct: number; total: number; streak: number; best: number };
const EMPTY_SCORE: RugScore = { correct: 0, total: 0, streak: 0, best: 0 };

export const HuntGame = () => {
  const { address } = useAccount();
  const { data: gameInfo } = useDeployedContractInfo({ contractName: "BugBountyHunter" });
  const gameAddress = gameInfo?.address;

  const { data: balance } = useScaffoldReadContract({
    contractName: "BugToken",
    functionName: "balanceOf",
    args: [address],
  });
  const { data: allowance } = useScaffoldReadContract({
    contractName: "BugToken",
    functionName: "allowance",
    args: [address, gameAddress],
  });
  const { data: isHunting } = useScaffoldReadContract({
    contractName: "BugBountyHunter",
    functionName: "isHunting",
    args: [address],
  });
  const { data: lastHunt } = useScaffoldReadContract({
    contractName: "BugBountyHunter",
    functionName: "lastHunt",
    args: [address],
  });
  const { data: poolAvailable } = useScaffoldReadContract({
    contractName: "BugBountyHunter",
    functionName: "poolAvailable",
  });

  const { writeContractAsync: writeToken, isMining: isApproving } = useScaffoldWriteContract({
    contractName: "BugToken",
  });
  const { writeContractAsync: writeGame, isMining: isSending } = useScaffoldWriteContract({
    contractName: "BugBountyHunter",
  });

  // Show the result when isHunting flips from true to false
  const [showResult, setShowResult] = useState(false);
  const wasHunting = useRef(false);
  useEffect(() => {
    if (wasHunting.current && isHunting === false) setShowResult(true);
    wasHunting.current = isHunting === true;
  }, [isHunting]);

  const [rugScore, setRugScore] = useState<RugScore>(EMPTY_SCORE);
  const handleRugAnswer = useCallback((correct: boolean) => {
    setRugScore(s => {
      const streak = correct ? s.streak + 1 : 0;
      return {
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
        streak,
        best: Math.max(s.best, streak),
      };
    });
  }, []);

  const notEnoughBug = balance !== undefined && balance < HUNT_COST;
  const needsApproval = allowance !== undefined && allowance < HUNT_COST;
  const poolTooLow = poolAvailable !== undefined && poolAvailable < MAX_BOUNTY;
  const busy = isApproving || isSending || isHunting === true;
  const result = lastHunt ? SEVERITIES[lastHunt[0]] : undefined;

  const approve = async () => {
    if (!gameAddress) return;
    try {
      await writeToken({ functionName: "approve", args: [gameAddress, APPROVE_AMOUNT] });
    } catch (e) {
      console.error("Approve failed", e);
    }
  };

  const hunt = async () => {
    setShowResult(false);
    setRugScore(EMPTY_SCORE);
    try {
      await writeGame({ functionName: "hunt" });
    } catch (e) {
      console.error("Hunt failed", e);
    }
  };

  if (!address) {
    return (
      <div className="card bg-base-100 shadow-md p-6 w-full max-w-md text-center">
        Connect your wallet to start hunting.
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md p-6 w-full max-w-md text-center">
      <Image
        src="/bug-mascot.png"
        alt="$BUG mascot"
        width={80}
        height={80}
        className={`mx-auto ${isHunting ? "animate-bounce" : ""}`}
      />
      <h3 className="text-2xl font-bold font-mono mt-2">Hunt for bugs</h3>
      <p className="opacity-70">Pay 100 BUG, find a bug, earn a bounty.</p>
      <p className="text-sm mt-1">
        Prize pool: {poolAvailable !== undefined ? Number(formatEther(poolAvailable)).toLocaleString() : "…"} BUG
      </p>

      {isHunting ? (
        <div className="my-4">
          <p className="font-mono">Auditors are reviewing your code… (1–3 min)</p>
          <RugOrLegit onAnswer={handleRugAnswer} />
          <p className="text-sm font-mono">
            Score: {rugScore.correct}/{rugScore.total} · Streak: {rugScore.streak} 🔥
          </p>
        </div>
      ) : showResult && result && lastHunt ? (
        <div className="my-6">
          <p className="text-5xl">{result.emoji}</p>
          <p className={`text-2xl font-bold ${result.color}`}>{result.label}</p>
          <p className="font-mono mt-1">{findingTitle(lastHunt[0], lastHunt[2])}</p>
          <p className="text-sm opacity-80">{result.line}</p>
          <p className="text-xl mt-2">+{Number(formatEther(lastHunt[1])).toLocaleString()} BUG</p>
          {rugScore.total > 0 && (
            <p className="text-sm mt-3 opacity-80">
              Rug check: {rugScore.correct}/{rugScore.total} correct · best streak {rugScore.best}
            </p>
          )}
        </div>
      ) : null}

      {notEnoughBug ? (
        <p className="text-error mt-4">You need at least 100 BUG. Use the faucet.</p>
      ) : poolTooLow ? (
        <p className="text-error mt-4">The prize pool is too low right now. Try again later.</p>
      ) : needsApproval ? (
        <button className="btn btn-secondary mt-4" disabled={busy} onClick={approve}>
          {isApproving && <span className="loading loading-spinner" />}
          Step 1: Approve 1,000 BUG (10 hunts)
        </button>
      ) : (
        <button className="btn btn-primary mt-4" disabled={busy} onClick={hunt}>
          {isSending && <span className="loading loading-spinner" />}
          {isHunting ? "Hunt in progress…" : "Hunt for bugs (100 BUG)"}
        </button>
      )}
    </div>
  );
};
