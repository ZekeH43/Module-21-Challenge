"use strict";
/* Compiler, dependency-import, and local-EVM checks for the historical demo. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const solc = require("solc");
const ganache = require("ganache");
const { ethers } = require("ethers");

const root = path.resolve(__dirname, "..");
const contracts = path.join(root, "Starter_Code", "Starter_Code");
const ozRoot = path.join(root, "node_modules", "@openzeppelin", "contracts");

function importResolver(name) {
  // Preserve the original GitHub URL imports in the teaching files, but use a
  // locally installed *exact* OpenZeppelin 2.5.0 release for reproducible tests.
  const marker = "/contracts/";
  const markerIndex = name.indexOf(marker);
  if (markerIndex !== -1) {
    const rel = name.slice(markerIndex + marker.length);
    if (rel.includes("..")) return { error: "Invalid dependency path" };
    const local = path.join(ozRoot, rel);
    if (fs.existsSync(local)) return { contents: fs.readFileSync(local, "utf8") };
  }
  const local = path.join(contracts, path.basename(name));
  if (fs.existsSync(local)) return { contents: fs.readFileSync(local, "utf8") };
  return { error: "Unknown import: " + name };
}

function compile() {
  assert.match(solc.version(), /^0\.5\.17/);
  const inputs = ["KaseiCoin.sol", "KaseiCoinCrowdsale.sol"];
  const sources = Object.fromEntries(
    inputs.map(filename => [filename, { content: fs.readFileSync(path.join(contracts, filename), "utf8") }])
  );
  const output = JSON.parse(solc.compile(JSON.stringify({
    language: "Solidity",
    sources,
    settings: {
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    }
  }), importResolver));
  const errors = (output.errors || []).filter(x => x.severity === "error");
  assert.equal(errors.length, 0, errors.map(x => x.formattedMessage).join("\n"));
  function artifact(name, filename) {
    const object = output.contracts[filename][name];
    assert.ok(object?.evm?.bytecode?.object, "Missing compiled contract " + name);
    return object;
  }
  return {
    token: artifact("KaseiCoin", "KaseiCoin.sol"),
    sale: artifact("KaseiCoinCrowdsale", "KaseiCoinCrowdsale.sol"),
    deployer: artifact("KaseiCoinCrowdsaleDeployer", "KaseiCoinCrowdsale.sol"),
  };
}

test("KaseiCoin token, crowdsale and deployer compile", () => {
  const compiled = compile();
  assert.ok(compiled.token.abi.length > 0);
  assert.ok(compiled.sale.abi.length > 0);
});

test("deployer delegates minting and buyer gets tokens on a local EVM", async () => {
  const compiled = compile();
  const provider = new ethers.providers.Web3Provider(
    ganache.provider({
      logging: { quiet: true },
      chain: { chainId: 1338, hardfork: "istanbul" },
      miner: { blockGasLimit: 30000000 },
      wallet: { totalAccounts: 7, defaultBalance: 100 }
    })
  );
  const accounts = await provider.listAccounts();
  const owner = provider.getSigner(accounts[0]);
  const purchaser = provider.getSigner(accounts[3]);
  const beneficiary = accounts[4];
  const fundsWallet = accounts[5];

  const factory = new ethers.ContractFactory(
    compiled.deployer.abi, "0x" + compiled.deployer.evm.bytecode.object, owner
  );
  const deployment = await factory.deploy("Kasei Coin", "KASEI", fundsWallet, { gasLimit: 12000000 });
  await deployment.deployed();

  const tokenAddress = await deployment.kasei_token_address();
  const saleAddress = await deployment.kasei_crowdsale_address();
  assert.notEqual(tokenAddress, ethers.constants.AddressZero);
  assert.notEqual(saleAddress, ethers.constants.AddressZero);

  const token = new ethers.Contract(tokenAddress, compiled.token.abi, provider);
  const sale = new ethers.Contract(saleAddress, compiled.sale.abi, provider);
  assert.equal(await token.name(), "Kasei Coin");
  assert.equal(await token.symbol(), "KASEI");
  assert.equal((await token.decimals()).toNumber(), 18);
  assert.equal((await token.totalSupply()).toString(), "0");
  assert.equal((await sale.rate()).toString(), "1");
  assert.equal(await token.isMinter(saleAddress), true);
  assert.equal(await token.isMinter(deployment.address), false);

  const walletBefore = await provider.getBalance(fundsWallet);
  // Rate 1 is ONE BASE UNIT of token per wei, not one whole 18-decimal token.
  await (await sale.connect(purchaser).buyTokens(beneficiary, { value: 5 })).wait();
  assert.equal((await token.balanceOf(beneficiary)).toString(), "5");
  assert.equal((await token.totalSupply()).toString(), "5");
  assert.equal((await provider.getBalance(fundsWallet)).sub(walletBefore).toString(), "5");

  await assert.rejects(token.connect(purchaser).mint(beneficiary, 10));
  await assert.rejects(sale.connect(purchaser).buyTokens(ethers.constants.AddressZero, { value: 5 }));
  await assert.rejects(sale.connect(purchaser).buyTokens(beneficiary, { value: 0 }));
});
