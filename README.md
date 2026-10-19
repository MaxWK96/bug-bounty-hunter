# $BUG - Bug Bounty Hunter

Meme token + game on Sepolia. You pay 100 BUG to "hunt" for a vulnerability, and Chainlink VRF decides what you found. Most of the time it's nothing or a gas optimization, sometimes it's a Critical worth 1000 BUG.

Live site: https://bug-bounty-hunter.vercel.app/

Testnet only, the token is worth nothing.

## Why bugs

Audits cost a fortune and protocols still get drained. So the idea is: you're the auditor. The mascot is the bug that's in every codebase.

## Contracts (Sepolia)

- BugToken: [0x93af1a82681f1cc2743ee7b244764d1721aa0c39](https://sepolia.etherscan.io/address/0x93af1a82681f1cc2743ee7b244764d1721aa0c39#code)
- BugBountyHunter: [0x17200d4158cdae5d30c3dbc66fd9702b31c39870](https://sepolia.etherscan.io/address/0x17200d4158cdae5d30c3dbc66fd9702b31c39870#code)

## How to play

1. Get some Sepolia ETH for gas (see below)
2. Connect your wallet on the site, on Sepolia
3. Claim 500 BUG from the faucet (once every 24h)
4. Approve the game to spend your BUG (one approval = 10 hunts)
5. Hunt. The result shows up after 1-3 minutes once Chainlink answers. While you wait you can play "Rug or Legit", which is just for fun and not on-chain.

## How the game works

`hunt()` takes 100 BUG and asks Chainlink VRF for a random number. When Chainlink calls back, the number (mod 10000) decides the severity:

| Result | Chance | Bounty |
| --- | --- | --- |
| Nothing | 45% | 0 |
| Gas | 25% | 40 |
| Low | 15% | 100 |
| Medium | 9% | 200 |
| High | 4.5% | 400 |
| Critical | 1.5% | 1000 |

On average you get back about 76 per 100 spent, so the pool slowly refills.

Each pending hunt reserves 1000 BUG from the pool so there's always enough to pay out, and you can only have one hunt running at a time. If Chainlink never answers, the owner can refund the hunt with `clearStuckHunt()`. Stats are stored on-chain and the leaderboard reads them with `getLeaderboard()`.

## Token

OpenZeppelin ERC20 with Burnable, Capped and Ownable.

- Name/symbol: Bug Bounty Token / BUG
- Max supply: 10,000,000
- `mint()` is owner only and can't go over the cap
- `burn()` lets anyone burn their own tokens
- `claim()` is the faucet: 500 BUG per wallet every 24h, reverts if you claim too early or the faucet is empty

Tokenomics:

| | Amount | % |
| --- | --- | --- |
| Faucet (in the token contract) | 4,000,000 | 40 |
| Prize pool (in the game contract) | 2,000,000 | 20 |
| Me | 1,000,000 | 10 |
| Not minted | 3,000,000 | 30 |

## Getting Sepolia ETH

- Google Cloud faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Alchemy faucet: https://www.alchemy.com/faucets/ethereum-sepolia
- PoW faucet (no account): https://sepolia-faucet.pk910.de/

## Running it

Needs Node 20+, Yarn and Foundry.

```bash
yarn install
yarn start
```

Then open http://localhost:3000. The frontend already points at the Sepolia contracts so you don't need a local chain.

Tests:

```bash
yarn foundry:test
```

There are 23 tests covering mint/burn/transfer, the onlyOwner checks, the faucet cooldown, and the game (payouts for every severity, reverts, stuck hunt refunds, plus a fuzz test). The game tests use Chainlink's VRF mock.

To deploy your own: you need a Chainlink VRF subscription funded with Sepolia ETH. Put your subscription id and wallet in `packages/foundry/script/DeployBug.s.sol`, run `yarn deploy --network sepolia` and `yarn verify --network sepolia`, then add the game contract as a consumer on the subscription.

## Stack

Solidity, OpenZeppelin, Chainlink VRF v2.5, Foundry, Next.js, TypeScript, Tailwind/DaisyUI, wagmi, viem, RainbowKit. Started from Scaffold-ETH 2.
