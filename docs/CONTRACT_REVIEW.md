# KaseiCoin Contract Review and Demonstration Checklist

## Contract layout

- `KaseiCoin.sol` defines `KaseiCoin`, inheriting ERC20, ERC20Detailed, and ERC20Mintable from OpenZeppelin Contracts **v2.5.0**. It passes the token name, symbol, and 18 decimals into the base constructor. Its `initial_supply` parameter is unused; no tokens are minted by that constructor.
- `KaseiCoinCrowdsale.sol` defines `KaseiCoinCrowdsale`, inheriting Crowdsale and MintedCrowdsale from the historical library. Its `KaseiCoinCrowdsaleDeployer` deploys a token, configures a crowdsale rate of 1, grants the sale contract the minting role, then renounces the deployer's minting role.

## Suggested manual test plan (local simulated network only)

1. Select a Solidity **0.5.x** compiler compatible with the source and resolve OpenZeppelin v2.5.0 imports.
2. Deploy the deployer with a name, symbol, and nonzero payable wallet.
3. Read `kasei_token_address` and `kasei_crowdsale_address`. Verify these point to deployed contracts and that the recipient wallet is configured.
4. Inspect `totalSupply()` **before** the first purchase. The constructor's `initial_supply` is unused, so no issuance is expected solely from its value.
5. From a separate test purchaser, send small amounts of *simulated* wei to the crowdsale. Verify the purchaser's ERC-20 balance and total supply change according to the fixed `rate`.
6. Verify a non-minter cannot invoke `mint` and the deploying address has renounced the minting role.
7. Test invalid or zero deployment parameters and failed purchases, noting which conditions the archived OpenZeppelin library enforces.

These are **test instructions**, not recorded test results. Automated CI, static-analysis results, and successful Remix deployment are not asserted.

## Security and maintenance limits

- OpenZeppelin's old Crowdsale design and Solidity 0.5.x are **legacy dependencies**. Avoid using the code as a current sale template.
- The rate is a fixed unit conversion, not live market pricing.
- There are no vesting rules, time limits, hard caps, supply caps, refund policies, or purchase authorization controls in the project-specific contracts.
- A token sale in the real world may trigger legal, regulatory, and security obligations that are outside this learning exercise.
- Modernization should be a separate reviewed change using supported library versions, new deployment scripts, thorough automated testing, and a defined sale specification.
