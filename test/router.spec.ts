import { ethers, waffle } from "hardhat";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";

use(solidity);

import { hexlify, keccak256, randomBytes } from "ethers/lib/utils";
import { Wallet, BigNumber, BigNumberish, constants, Contract, ContractReceipt, utils, providers } from "ethers";
import { RevertableERC20, TransactionManager, FeeERC20, ERC20 } from "@connext/nxtp-contracts";
import TransactionManagerArtifact from "@connext/nxtp-contracts/artifacts/contracts/TransactionManager.sol/TransactionManager.json";
import RevertableERC20Artifact from "@connext/nxtp-contracts/artifacts/contracts/test/RevertableERC20.sol/RevertableERC20.json";
import FeeERC20Artifact from "@connext/nxtp-contracts/artifacts/contracts/test/FeeERC20.sol/FeeERC20.json";


import {
  InvariantTransactionData,
  signCancelTransactionPayload,
  signFulfillTransactionPayload,
  VariantTransactionData,
  getInvariantTransactionDigest,
  getVariantTransactionDigest,
} from "@connext/nxtp-utils";
import { deployContract, MAX_FEE_PER_GAS, getOnchainBalance, assertReceiptEvent } from "./utils";

// import types
import { Router, RouterFactory } from "../typechain-types";

const { AddressZero } = constants;
const EmptyBytes = "0x";
const EmptyCallDataHash = keccak256(EmptyBytes);

const createFixtureLoader = waffle.createFixtureLoader;
describe("Router Contract", function () {
  const [wallet, router, routerReceipient, user, receiver, other] = waffle.provider.getWallets() as Wallet[];
  let routerContract: Router;
  let routerContractReceiverSide: Router;
  let transactionManager: TransactionManager;
  let transactionManagerReceiverSide: TransactionManager;
  //   let routerFactoryContract: RouterFactory;
  let tokenA: RevertableERC20;
  let tokenB: RevertableERC20;
  let feeToken: FeeERC20;
  const sendingChainId = 1337;
  const receivingChainId = 1338;

  const fixture = async () => {
    transactionManager = await deployContract<TransactionManager>(TransactionManagerArtifact, sendingChainId);

    transactionManagerReceiverSide = await deployContract<TransactionManager>(TransactionManagerArtifact, receivingChainId);

    routerContract = await deployContract<Router>(
      "Router",
      transactionManager.address,
      routerReceipient.address,
      router.address,
    );

    routerContractReceiverSide = await deployContract<Router>(
      "Router",
      transactionManagerReceiverSide.address,
      routerReceipient.address,
      router.address,
    );

    tokenA = await deployContract<RevertableERC20>(RevertableERC20Artifact);

    tokenB = await deployContract<RevertableERC20>(RevertableERC20Artifact);

    feeToken = await deployContract<FeeERC20>(FeeERC20Artifact);

    return {
      routerContract,
      routerContractReceiverSide,
      transactionManager,
      transactionManagerReceiverSide,
      tokenA,
      tokenB,
      feeToken,
    };
  };

  const addPrivileges = async (tm: TransactionManager, routers: string[], assets: string[]) => {
    for (const router of routers) {
      const tx = await tm.addRouter(router, { maxFeePerGas: MAX_FEE_PER_GAS });
      await tx.wait();
      expect(await tm.approvedRouters(router)).to.be.true;
    }

    for (const assetId of assets) {
      const tx = await tm.addAssetId(assetId, {
        maxFeePerGas: MAX_FEE_PER_GAS,
      });
      await tx.wait();
      expect(await tm.approvedAssets(assetId)).to.be.true;
    }
  };

  let loadFixture: ReturnType<typeof createFixtureLoader>;
  before("create fixture loader", async () => {
    loadFixture = createFixtureLoader([wallet, router, user, receiver, other]);
  });

  beforeEach(async function () {
    ({ transactionManager, transactionManagerReceiverSide, tokenA, tokenB } = await loadFixture(fixture));

    const liq = "10000";
    let tx = await tokenA.connect(wallet).transfer(router.address, liq);
    await tx.wait();
    tx = await tokenB.connect(wallet).transfer(router.address, liq);
    await tx.wait();

    const prepareFunds = "10000";
    tx = await tokenA.connect(wallet).transfer(user.address, prepareFunds);
    await tx.wait();
    tx = await tokenB.connect(wallet).transfer(user.address, prepareFunds);
    await tx.wait();

    const feeFunds = "10000";
    tx = await feeToken.connect(wallet).transfer(user.address, feeFunds);
    await tx.wait();
    tx = await feeToken.connect(wallet).transfer(router.address, feeFunds);
    await tx.wait();

    // Prep contracts with router and assets
    await addPrivileges(
      transactionManager,
      [router.address],
      [AddressZero, tokenA.address, tokenB.address, feeToken.address],
    );

    await addPrivileges(
      transactionManagerReceiverSide,
      [router.address],
      [AddressZero, tokenA.address, tokenB.address, feeToken.address],
    );
  });

  const getTransactionData = async (
    txOverrides: Partial<InvariantTransactionData> = {},
    recordOverrides: Partial<VariantTransactionData> = {},
  ): Promise<{
    transaction: InvariantTransactionData;
    record: VariantTransactionData;
  }> => {
    const transaction = {
      receivingChainTxManagerAddress: transactionManagerReceiverSide.address,
      user: user.address,
      router: router.address,
      initiator: user.address,
      sendingAssetId: AddressZero,
      receivingAssetId: AddressZero,
      sendingChainFallback: user.address,
      callTo: AddressZero,
      receivingAddress: receiver.address,
      callDataHash: EmptyCallDataHash,
      transactionId: hexlify(randomBytes(32)),
      sendingChainId: (await transactionManager.getChainId()).toNumber(),
      receivingChainId: (await transactionManagerReceiverSide.getChainId()).toNumber(),
      ...txOverrides,
    };

    const day = 24 * 60 * 60;
    const block = await ethers.provider.getBlock("latest");
    const record = {
      amount: "10",
      expiry: block.timestamp + day + 5_000,
      preparedBlockNumber: 10,
      ...recordOverrides,
    };

    return { transaction, record };
  };

  const approveTokens = async (amount: BigNumberish, approver: Wallet, spender: string, token: ERC20 = tokenA) => {
    const approveTx = await token.connect(approver).approve(spender, amount);
    await approveTx.wait();
    const allowance = await token.allowance(approver.address, spender);
    expect(allowance).to.be.at.least(amount);
  };

  const addAndAssertLiquidity = async (
    amount: BigNumberish,
    assetId: string = AddressZero,
    _router: Wallet = router,
    instance: Contract = transactionManagerReceiverSide,
    useMsgSender: boolean = false,
    fee: BigNumberish = 0,
  ) => {
    // Get starting + expected  balance
    const routerAddr = router.address;
    const startingBalance = await getOnchainBalance(assetId, routerAddr, ethers.provider);
    const expectedBalance = startingBalance.sub(amount);

    const startingLiquidity = await instance.routerBalances(routerAddr, assetId);
    const expectedLiquidity = startingLiquidity.add(amount).sub(fee);

    const tx: providers.TransactionResponse = useMsgSender
      ? await instance
          .connect(_router)
          .addLiquidity(amount, assetId, assetId === AddressZero ? { value: BigNumber.from(amount) } : {})
      : await instance
          .connect(_router)
          .addLiquidityFor(
            amount,
            assetId,
            router.address,
            assetId === AddressZero ? { value: BigNumber.from(amount) } : {},
          );

    const receipt = await tx.wait();
    // const [receipt, payload] = await Promise.all([tx.wait(), event]);
    // expect(payload).to.be.ok;

    // Verify receipt + attached events
    expect(receipt.status).to.be.eq(1);
    await assertReceiptEvent(receipt, "LiquidityAdded", {
      router: routerAddr,
      assetId,
      amount: BigNumber.from(amount).sub(fee),
      caller: receipt.from,
    });

    // Check liquidity
    const liquidity = await instance.routerBalances(routerAddr, assetId);
    expect(liquidity).to.be.eq(expectedLiquidity);

    // Check balances
    const balance = await getOnchainBalance(assetId, routerAddr, ethers.provider);
    expect(balance).to.be.eq(
      expectedBalance.sub(assetId === AddressZero ? receipt.effectiveGasPrice.mul(receipt.gasUsed) : 0),
    );
  };

  describe("constructor", async () => {
    it("should deploy", async () => {
      expect(routerContract.address).to.be.a("string");
      expect(routerContractReceiverSide.address).to.be.a("string");
    });

    it("should set transactionManagerAddress", async () => {
      expect(await routerContract.transactionManager()).to.eq(transactionManager.address);
      expect(await routerContractReceiverSide.transactionManager()).to.eq(transactionManagerReceiverSide.address);
    });

    it("should set recipient", async () => {
      expect(await routerContract.recipient()).to.eq(routerReceipient.address);
      expect(await routerContractReceiverSide.recipient()).to.eq(routerReceipient.address);
    });
  });

  describe("addLiquidity", () => {});
});
