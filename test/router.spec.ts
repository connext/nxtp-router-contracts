import { waffle, deployments, ethers } from "hardhat";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { TransactionManager, TestERC20 } from "@connext/nxtp-contracts/typechain";
use(solidity);

import { Wallet } from "ethers";
import { Router } from "../typechain-types";

let router: Router;
let token: TestERC20;
let txManager: TransactionManager;

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    await deployments.fixture(); // ensure you start from a fresh deployments
    const factory = await ethers.getContractFactory("TransactionManager");
    txManager = await factory.deploy(1337) as TransactionManager;
    console.log("txManager: ", txManager.address);

    const { deployer, alice, bob } = await getNamedAccounts();

    const routerFactory = await ethers.getContractFactory("Router", deployer);
    router = (await routerFactory.deploy(
      txManager.address,
      alice,
      deployer
      bob,
    )) as Router;
    const txM = await router.transactionManager();
    console.log("txM: ", txM);
    expect(txM).to.eq(txManager.address);

    const tokenFactory = await ethers.getContractFactory("TestERC20", deployer);
    token = (await tokenFactory.deploy()) as TestERC20;
    console.log("token: ", token.address);

    await txManager.addAssetId(token.address);
    await txManager.addRouter(router.address);
  }
);

describe("Router", function () {
  const [deployer] = waffle.provider.getWallets() as Wallet[];

  beforeEach(async () => {
    await setupTest();

    const amt = ethers.utils.parseEther("1")

    await token.approve(txManager.address, amt);
    await txManager.addLiquidityFor(amt, token.address, router.address);

    const liq = await txManager.routerBalances(router.address, token.address);
    expect(liq.toString()).to.eq(amt.toString());
  });

  it("should prepare tx with the correct sig", async () => {
    
  })
});
