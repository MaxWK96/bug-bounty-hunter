"use client";

import { Address } from "@scaffold-ui/components";
import { formatEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const fmt = (v?: bigint) => (v !== undefined ? Number(formatEther(v)).toLocaleString() : "…");

export const TokenInfo = () => {
  const { data: token } = useDeployedContractInfo({ contractName: "BugToken" });
  const { data: totalSupply } = useScaffoldReadContract({ contractName: "BugToken", functionName: "totalSupply" });
  const { data: cap } = useScaffoldReadContract({ contractName: "BugToken", functionName: "cap" });

  return (
    <section id="token" className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Token info</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow p-5">
          <p className="opacity-70">Total supply</p>
          <p className="text-2xl font-bold">{fmt(totalSupply)} BUG</p>
        </div>
        <div className="card bg-base-100 shadow p-5">
          <p className="opacity-70">Max supply</p>
          <p className="text-2xl font-bold">{fmt(cap)} BUG</p>
        </div>
        <div className="card bg-base-100 shadow p-5">
          <p className="opacity-70">Network</p>
          <p className="text-2xl font-bold">Ethereum Sepolia</p>
        </div>
      </div>
      <div className="card bg-base-100 shadow p-5 mt-4">
        <p className="opacity-70">Contract address</p>
        {token && <Address address={token.address} />}
        {token && (
          <a
            className="link link-primary mt-2"
            target="_blank"
            rel="noreferrer"
            href={`https://sepolia.etherscan.io/token/${token.address}`}
          >
            View on Etherscan ↗
          </a>
        )}
      </div>
      <h3 className="text-xl font-bold mt-8 mb-2">Tokenomics</h3>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Allocation</th>
              <th>Amount</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Faucet (free for everyone)</td>
              <td>4,000,000</td>
              <td>40%</td>
            </tr>
            <tr>
              <td>Bounty prize pool</td>
              <td>2,000,000</td>
              <td>20%</td>
            </tr>
            <tr>
              <td>Audit fund (owner)</td>
              <td>1,000,000</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Not minted yet</td>
              <td>3,000,000</td>
              <td>30%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
