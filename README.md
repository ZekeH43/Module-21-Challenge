# KaseiCoin and Crowdsale — Solidity Coursework

A historical smart-contract assignment that demonstrates an ERC-20 token and crowdsale using **Solidity 0.5.5-era syntax** and **OpenZeppelin Contracts 2.5.0**. This is a preserved learning artifact, not a modern token sale implementation or an audited contract.

## Repository contents

- [KaseiCoin.sol](Starter_Code/Starter_Code/KaseiCoin.sol) — a mintable ERC-20 token with 18 decimals
- [KaseiCoinCrowdsale.sol](Starter_Code/Starter_Code/KaseiCoinCrowdsale.sol) — crowdsale and deployer contracts
- [Original assignment instructions](Starter_Code/README.md)
- [Architecture, testing and security notes](docs/CONTRACT_REVIEW.md)

## Intended demonstration

The deployer creates a `KaseiCoin` token and a `KaseiCoinCrowdsale` contract. It grants the crowdsale token-minting permission and gives up its own minting role. During a successful purchase, the crowdsale contract may mint tokens according to its configured rate.

The deployer hardcodes a rate of `1` (the unit is token base units per wei in the historical OpenZeppelin API). The token constructor accepts an `initial_supply` argument **but does not use it** to mint supply. That parameter is a legacy artifact and should not be mistaken for circulating tokens.

## Local exploration (historical toolchain)

1. Review the imported dependencies in the Solidity files. They reference a historical OpenZeppelin v2.5.0 GitHub release.
2. Open the files in [Remix IDE](https://remix.ethereum.org/) and use a compatible Solidity 0.5.x compiler such as 0.5.17.
3. If Remix cannot resolve remote imports, use the archived release of OpenZeppelin **2.5.0** in a local toolchain rather than silently substituting a modern incompatible release.
4. Run experiments only in a local simulated chain with test accounts and test Ether. Deploy the crowdsale deployer with a nonzero recipient wallet and inspect its published token and crowdsale addresses.
5. Check minting permissions, token balance changes, sale rate, purchaser behavior, and failure cases described in [the test plan](docs/CONTRACT_REVIEW.md).

Automated tests are now included to resolve the historical imports against the **exact locally installed OpenZeppelin 2.5.0** package, compile both source contracts using `solc@0.5.17`, and deploy/purchase on a disposable Ganache chain. See `tests/kaseicoin.test.cjs` and the GitHub Actions workflow. Check the latest CI result before merging. This does not verify the old GitHub URL imports in modern Remix, and does not establish production security.

## Run automated compilation and local purchase tests

With Node.js 22 installed, from the repository root:

```bash
npm install --no-package-lock
npm test
```

The tests use a local EVM and simulated funds only. The direct package versions are fixed in `package.json`; without a committed lockfile, transitive dependencies are not fully pinned. This is an educational verification environment, not a live-network deployment.

## Risks and current limitations

Crowdsale contracts from this OpenZeppelin era are no longer supported as a modern production pattern. This exercise does **not** include purchase limits, sale windows, caps, refund logic, price oracle integration, custody review, compliance processes, a security audit, or current deployment instructions. Do not deploy it with real assets.

## Historical assignment screenshots

Successful compilation of KaseiCoin Contract 

![image](https://github.com/ZekeH43/Module-21-Challenge/assets/143846311/d31e862d-87dd-4f94-aabe-752f336ec802)


Successful compilation of KaseiCoinCrowdsale Contract

![image](https://github.com/ZekeH43/Module-21-Challenge/assets/143846311/4afdf5f9-647b-449d-ab67-36a3f4aae5b3)



![image](https://github.com/ZekeH43/Module-21-Challenge/assets/143846311/3b28e74b-e67c-4aa0-b2cb-a84fc1ca113b)



Step 1 deploy using Ganache and Metamask

![image](https://github.com/ZekeH43/Module-21-Challenge/assets/143846311/8887da44-74a5-4f1f-8aef-3dc378843d6d)
