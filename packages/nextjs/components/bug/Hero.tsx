"use client";

import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export const Hero = () => {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <section id="hero" className="flex flex-col md:flex-row items-center gap-8 py-12 max-w-5xl mx-auto px-4">
      <Image src="/bug-mascot.png" alt="$BUG mascot" width={260} height={260} priority />
      <div className="text-center md:text-left">
        <h1 className="text-5xl font-bold font-mono">$BUG</h1>
        <p className="text-xl font-semibold mt-1">Bug Bounty Token</p>
        <p className="mt-4 opacity-80">
          Every smart contract has bugs. Most auditors charge for finding them. We pay you. Spend 100 $BUG, hunt for
          vulnerabilities, and find out if you just found a gas optimization or a protocol-ending Critical.
        </p>
        <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
          <a href="#game" className="btn btn-primary">
            Start hunting
          </a>
          {!address && (
            <button className="btn btn-outline" onClick={openConnectModal}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
