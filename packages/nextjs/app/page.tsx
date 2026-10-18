"use client";

import type { NextPage } from "next";
import { Faucet } from "~~/components/bug/Faucet";
import { Hero } from "~~/components/bug/Hero";
import { HuntGame } from "~~/components/bug/HuntGame";
import { Leaderboard } from "~~/components/bug/Leaderboard";
import { TokenInfo } from "~~/components/bug/TokenInfo";
import { WalletInfo } from "~~/components/bug/WalletInfo";

const Home: NextPage = () => {
  return (
    <main>
      <Hero />
      <TokenInfo />
      <section id="game" className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Play: Bug Bounty Hunter</h2>
        <div className="flex flex-col items-center gap-6">
          <WalletInfo />
          <Faucet />
          <HuntGame />
          <Leaderboard />
        </div>
      </section>
    </main>
  );
};

export default Home;
