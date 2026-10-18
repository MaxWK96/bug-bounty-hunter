"use client";

import { Address } from "@scaffold-ui/components";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const Leaderboard = () => {
  const { data } = useScaffoldReadContract({
    contractName: "BugBountyHunter",
    functionName: "getLeaderboard",
  });

  const rows = data
    ? data[0]
        .map((player, i) => ({ player, won: data[1][i], criticals: data[2][i], hunts: data[3][i] }))
        .sort((a, b) => (b.won > a.won ? 1 : b.won < a.won ? -1 : 0))
        .slice(0, 10)
    : [];

  return (
    <div className="card bg-base-100 shadow-md p-6 w-full max-w-2xl">
      <h3 className="text-2xl font-bold text-center">🏆 Top auditors</h3>
      {rows.length === 0 ? (
        <p className="text-center opacity-70 mt-2">No hunts yet. Be the first!</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Auditor</th>
                <th>Hunts</th>
                <th>Criticals</th>
                <th>Won</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.player}>
                  <td>{i + 1}</td>
                  <td>
                    <Address address={r.player} />
                  </td>
                  <td>{r.hunts}</td>
                  <td>{r.criticals}</td>
                  <td>{Number(formatEther(r.won)).toLocaleString()} BUG</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
