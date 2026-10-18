const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Deploy",
    done: true,
    items: ["Ship $BUG to Sepolia", "Chainlink VRF picks the bounties", "Faucet so nobody has to beg the owner"],
  },
  {
    phase: "Phase 2",
    title: "Get audited",
    done: true,
    items: ["Write Foundry tests", "Fix the bugs the tests found", "Pretend that never happened"],
  },
  {
    phase: "Phase 3",
    title: "Community",
    done: false,
    items: ["Every intern hunts at least once", "Everyone becomes gambling addicts"],
  },
  {
    phase: "Phase 4",
    title: "Moon",
    done: false,
    items: ["Launch on Pump.fun and become rich"],
  },
];

export const Community = () => {
  return (
    <section id="community" className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold font-mono text-center mb-8">Community</h2>

      <div className="card bg-base-100 shadow-md p-6">
        <h3 className="text-xl font-bold font-mono mb-2">About the meme</h3>
        <p className="opacity-80">
          Many smart contract has bugs. The industry pays auditors big sums to find them, and then the protocol gets
          drained anyway. $BUG flips the script: you are the auditor. Pay a small fee, go hunting, and let Chainlink VRF
          decide whether you found a harmless gas optimization or the reentrancy that would have ended everything.
        </p>
        <p className="opacity-80 mt-3">Our mascot has seen every bug. He survived them all. He is the bug.</p>
      </div>

      <h3 className="text-xl font-bold font-mono mt-10 mb-4 text-center">Roadmap</h3>
      <ul className="timeline timeline-vertical md:timeline-horizontal">
        {ROADMAP.map((step, i) => (
          <li key={step.phase}>
            {i > 0 && <hr className={step.done ? "bg-primary" : ""} />}
            <div className="timeline-middle">{step.done ? "✅" : "⏳"}</div>
            <div className={`card bg-base-100 shadow p-4 my-2 ${i % 2 === 0 ? "timeline-start" : "timeline-end"}`}>
              <p className="text-sm opacity-70">{step.phase}</p>
              <p className="font-bold font-mono">{step.title}</p>
              <ul className="list-disc list-inside text-sm mt-1 opacity-80">
                {step.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {i < ROADMAP.length - 1 && <hr className={ROADMAP[i + 1].done ? "bg-primary" : ""} />}
          </li>
        ))}
      </ul>
    </section>
  );
};
