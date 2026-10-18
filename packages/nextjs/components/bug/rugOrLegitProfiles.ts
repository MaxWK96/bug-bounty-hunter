// Token profiles for the "Rug or Legit?" mini-game.
// RUG   = red flags that let insiders take users' money (or trap them).
// LEGIT = safeguards that make a rug pull hard or impossible.

export type Verdict = "rug" | "legit";

export type TokenProfile = {
  name: string;
  ticker: string;
  emoji: string;
  facts: string[];
  verdict: Verdict;
  why: string;
};

export const TOKEN_PROFILES: TokenProfile[] = [
  // rugs
  {
    name: "SafeMoonShot",
    ticker: "SMS",
    emoji: "🌙",
    facts: ["Owner can mint unlimited tokens", "Liquidity is not locked", "Telegram admin says: trust me bro"],
    verdict: "rug",
    why: "Unlimited minting lets the owner print tokens and dump them on buyers. Unlocked liquidity can be pulled anytime.",
  },
  {
    name: "Honey Pot Finance",
    ticker: "HONEY",
    emoji: "🍯",
    facts: ["Buy tax: 0%", "Sell tax: 99%", "Contract is verified on Etherscan"],
    verdict: "rug",
    why: "A 99% sell tax means you can buy but never really sell. Classic honeypot. Verified code does not mean safe code.",
  },
  {
    name: "ElonDogeInu",
    ticker: "EDI",
    emoji: "🐕",
    facts: ["Dev wallet holds 94% of supply", "No vesting schedule", "Logo made in MS Paint"],
    verdict: "rug",
    why: "One wallet holding almost everything can crash the price whenever it wants.",
  },
  {
    name: "YieldFarm9000",
    ticker: "Y9K",
    emoji: "🚜",
    facts: ["APY: 400,000%", "Contract source code not verified", "Anonymous team"],
    verdict: "rug",
    why: "Unverified code means nobody can check what it does, and impossible yields are usually paid with new depositors' money.",
  },
  {
    name: "TrustMe Vault",
    ticker: "TRUST",
    emoji: "🏦",
    facts: ["Owner can withdraw all user deposits", "Function is called emergencyWithdraw()", "Audit: coming soon"],
    verdict: "rug",
    why: "An owner-only function that drains user funds is a rug button, no matter how friendly its name is.",
  },
  {
    name: "BlacklistBoi",
    ticker: "BLK",
    emoji: "🚫",
    facts: ["Owner can blacklist any wallet from selling", "Liquidity locked for 7 days", "1,000 happy holders"],
    verdict: "rug",
    why: "A blacklist lets the owner stop you from selling, and a 7-day lock expires almost immediately.",
  },
  {
    name: "Upgrade Anytime Protocol",
    ticker: "UAP",
    emoji: "🔁",
    facts: ["Upgradeable proxy contract", "Upgrade key held by a single wallet", "No timelock on upgrades"],
    verdict: "rug",
    why: "One key can swap the contract code instantly, including for a version that steals everything.",
  },
  {
    name: "PausePlease",
    ticker: "PAWS",
    emoji: "🐾",
    facts: ["Owner can pause all transfers", "The owner's wallet is exempt from the pause", "Very cute cat logo"],
    verdict: "rug",
    why: "If only the owner can move tokens while everyone else is frozen, the owner can sell and you can't.",
  },
  {
    name: "FreeAirdrop",
    ticker: "FREE",
    emoji: "🎁",
    facts: ["Claiming requires approving unlimited USDC", "Website registered 2 days ago", "Already 50k followers"],
    verdict: "rug",
    why: "An unlimited approval to an unknown contract lets it take all your USDC. That is how wallet drainers work.",
  },
  {
    name: "Origin Story",
    ticker: "ORIGIN",
    emoji: "🎭",
    facts: ["Admin check uses tx.origin", "Audited by the dev's cousin", "Ownership not renounced"],
    verdict: "rug",
    why: "tx.origin authentication can be tricked through a malicious contract, letting an attacker act as the admin.",
  },
  {
    name: "MaxTx Meme",
    ticker: "MAXX",
    emoji: "📉",
    facts: ["Owner can set the max sell amount at any time", "Liquidity locked for 1 year", "Team is doxxed"],
    verdict: "rug",
    why: "Even with locked liquidity, an owner who can set max sell to 0 can stop everyone from selling.",
  },
  {
    name: "Spot Price Lending",
    ticker: "SPOT",
    emoji: "🔮",
    facts: ["Prices read from one DEX pool's spot price", "$5M of deposits", "Slick UI"],
    verdict: "rug",
    why: "A single pool's spot price can be pushed around with a flash loan, letting attackers borrow far more than they should.",
  },
  {
    name: "Mirror Mirror",
    ticker: "MIRR",
    emoji: "🪞",
    facts: ["Code identical to a known scam token", "Renamed from $SCAM yesterday", "Liquidity not locked"],
    verdict: "rug",
    why: "Copy-pasted scam code with a fresh name is still scam code.",
  },
  {
    name: "ReflectFi",
    ticker: "RFL",
    emoji: "💸",
    facts: ["Hidden 10% fee to the dev on every transfer", "Fee not mentioned on the website", "Contract is verified"],
    verdict: "rug",
    why: "A fee you are not told about is a slow rug, even if the code is public.",
  },
  {
    name: "Reentrant Rewards",
    ticker: "REENT",
    emoji: "🌀",
    facts: ["Sends ETH before updating balances", "No ReentrancyGuard", "Holds 800 ETH"],
    verdict: "rug",
    why: "Paying out before updating state is a reentrancy bug. An attacker can withdraw again and again in one transaction.",
  },

  // legit
  {
    name: "Bug Bounty Token",
    ticker: "BUG",
    emoji: "🪲",
    facts: ["Max supply hard-capped at 10M", "Contract verified on Etherscan", "Faucet with a 24h cooldown"],
    verdict: "legit",
    why: "Capped supply, public code and no function that lets the owner take your tokens. Also: it's us.",
  },
  {
    name: "SteadyStable",
    ticker: "STDY",
    emoji: "🧱",
    facts: ["Audited by two independent firms", "Liquidity locked for 2 years", "Team tokens vest over 3 years"],
    verdict: "legit",
    why: "Locked liquidity and long vesting mean the team cannot cash out quickly, and two audits reduce hidden bugs.",
  },
  {
    name: "MultiSig DAO",
    ticker: "MSD",
    emoji: "🗳️",
    facts: ["Treasury controlled by a 4-of-7 multisig", "Upgrades need a 48h timelock", "Open-source code"],
    verdict: "legit",
    why: "No single person can move funds, and users get 48 hours to exit before any upgrade happens.",
  },
  {
    name: "Renounced Pepe",
    ticker: "RPEPE",
    emoji: "🐸",
    facts: ["Ownership renounced", "Fixed supply, no mint function", "Liquidity tokens burned"],
    verdict: "legit",
    why: "No owner, no minting, burned liquidity: nobody can pull the rug. The price can still go to zero though.",
  },
  {
    name: "Fair Lily",
    ticker: "LILY",
    emoji: "🌸",
    facts: ["No presale, no team allocation", "Contract verified", "Liquidity locked for 1 year"],
    verdict: "legit",
    why: "A fair launch with locked liquidity gives insiders no head start and no exit button.",
  },
  {
    name: "Solid Lend",
    ticker: "SLND",
    emoji: "🏛️",
    facts: [
      "Prices from a decentralized oracle network",
      "Time-weighted average price as fallback",
      "Public bug bounty program",
    ],
    verdict: "legit",
    why: "Decentralized oracles with a TWAP fallback are hard to manipulate, and a bug bounty pays people to report bugs instead of exploiting them.",
  },
  {
    name: "Timelock Token",
    ticker: "TIME",
    emoji: "⏳",
    facts: [
      "All owner actions delayed 72h by a timelock",
      "Changes announced publicly in advance",
      "Verified contract",
    ],
    verdict: "legit",
    why: "A timelock gives every holder 72 hours to see a change coming and leave if they don't like it.",
  },
  {
    name: "Boring Index",
    ticker: "BORE",
    emoji: "😴",
    facts: ["No owner functions at all", "Immutable contract", "Extremely boring website"],
    verdict: "legit",
    why: "Boring is good. Immutable code with no admin keys cannot be rugged by anyone.",
  },
  {
    name: "Vesting Vault",
    ticker: "VEST",
    emoji: "🔒",
    facts: ["Team tokens unlock monthly over 4 years", "Unlock schedule enforced on-chain", "Audit report is public"],
    verdict: "legit",
    why: "On-chain vesting means the team physically cannot dump their tokens early.",
  },
  {
    name: "Capped Mint Cat",
    ticker: "CMC",
    emoji: "🐱",
    facts: [
      "Owner can mint, but a hard cap is enforced in the contract",
      "95% of the cap already minted",
      "Minting controlled by a multisig",
    ],
    verdict: "legit",
    why: "Minting is limited by code, almost used up, and needs several signers. Minting alone is not a red flag; unlimited minting is.",
  },
  {
    name: "Bounty Shield",
    ticker: "SHLD",
    emoji: "🛡️",
    facts: ["Pays up to $1M for critical bugs", "Three independent audits", "Upgrades go through a timelock"],
    verdict: "legit",
    why: "Big bug bounties and multiple audits show the team expects scrutiny and pays for it.",
  },
  {
    name: "Burnable Bonk",
    ticker: "BURN",
    emoji: "🔥",
    facts: ["Holders can burn their own tokens", "No admin burn function", "Supply can only go down"],
    verdict: "legit",
    why: "Burning your own tokens is your choice. The red flag would be an admin who can burn yours.",
  },
  {
    name: "Guarded Pool",
    ticker: "GUARD",
    emoji: "💂",
    facts: [
      "Uses ReentrancyGuard on all withdrawals",
      "Checks-effects-interactions everywhere",
      "Audited by Softstack 😉",
    ],
    verdict: "legit",
    why: "Protected against reentrancy twice over, and audited. This is what good contracts look like.",
  },
];
