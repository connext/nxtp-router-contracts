import { ethers, waffle } from "hardhat";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";

use(solidity);

import { hexlify, keccak256, randomBytes } from "ethers/lib/utils";
import { Wallet, BigNumber, BigNumberish, constants, Contract, providers, ContractReceipt } from "ethers";
import { RevertableERC20, TransactionManager, FeeERC20, ERC20 } from "@connext/nxtp-contracts";
import TransactionManagerArtifact from "@connext/nxtp-contracts/artifacts/contracts/TransactionManager.sol/TransactionManager.json";
import RevertableERC20Artifact from "@connext/nxtp-contracts/artifacts/contracts/test/RevertableERC20.sol/RevertableERC20.json";

import { InvariantTransactionData, VariantTransactionData } from "@connext/nxtp-utils";
import {
  deployContract,
  MAX_FEE_PER_GAS,
  convertToPrepareArgs,
  signRemoveLiquidityTransactionPayload,
  signPrepareTransactionPayload,
  encodePrepareData,
} from "./utils";

// import types
import { Router, RouterFactory } from "../typechain-types";

const { AddressZero } = constants;
const EmptyBytes = "0x";
const EmptyCallDataHash = keccak256(EmptyBytes);

const createFixtureLoader = waffle.createFixtureLoader;
describe("Router Contract", function () {
  const [wallet, router, routerReceipient, user, receiver, gelato, other] = waffle.provider.getWallets() as Wallet[];
  let routerContract: Router;
  let transactionManagerReceiverSide: TransactionManager;
  let token: RevertableERC20;
  const sendingChainId = 1337;
  const receivingChainId = 1338;

  const fixture = async () => {
    transactionManagerReceiverSide = await deployContract<TransactionManager>(
      TransactionManagerArtifact,
      receivingChainId,
    );

    routerContract = await deployContract<Router>(
      "Router",
      transactionManagerReceiverSide.address,
      router.address,
      routerReceipient.address,
      router.address,
    );

    token = await deployContract<RevertableERC20>(RevertableERC20Artifact);

    return {
      routerContract,
      transactionManagerReceiverSide,
      token,
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

  const approveTokens = async (amount: BigNumberish, approver: Wallet, spender: string, asset: ERC20 = token) => {
    const approveTx = await asset.connect(approver).approve(spender, amount);
    await approveTx.wait();
    const allowance = await asset.allowance(approver.address, spender);
    expect(allowance).to.be.at.least(amount);
  };

  let loadFixture: ReturnType<typeof createFixtureLoader>;
  before("create fixture loader", async () => {
    loadFixture = createFixtureLoader([wallet, router, user, receiver, other]);
  });

  beforeEach(async function () {
    ({ transactionManagerReceiverSide, token } = await loadFixture(fixture));

    // Prep contracts with router and assets
    await addPrivileges(transactionManagerReceiverSide, [routerContract.address], [AddressZero, token.address]);

    const liq = "10000";
    let tx = await token.connect(wallet).transfer(router.address, liq);
    await tx.wait();

    await approveTokens(liq, router, transactionManagerReceiverSide.address);
    let addLiquidityTx = await transactionManagerReceiverSide
      .connect(router)
      .addLiquidityFor(liq, token.address, routerContract.address);
    await addLiquidityTx.wait();
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
      router: routerContract.address,
      initiator: user.address,
      sendingAssetId: AddressZero,
      receivingAssetId: token.address,
      sendingChainFallback: user.address,
      callTo: AddressZero,
      receivingAddress: receiver.address,
      callDataHash: EmptyCallDataHash,
      transactionId: hexlify(randomBytes(32)),
      sendingChainId: sendingChainId,
      receivingChainId: receivingChainId,
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

  describe("constructor", async () => {
    it("should deploy", async () => {
      expect(routerContract.address).to.be.a("string");
    });

    it("should set transactionManagerAddress", async () => {
      expect(await routerContract.transactionManager()).to.eq(transactionManagerReceiverSide.address);
    });

    // it("should set routerSigner", async () => {
    //   expect(await routerContract.signer()).to.eq(router.address);
    // });

    it("should set recipient", async () => {
      expect(await routerContract.recipient()).to.eq(routerReceipient.address);
    });
  });

  describe("removeLiquidity", () => {
    it("should remove liquidity", async () => {
      const amount = "100";
      const assetId = token.address;
      const signature = await signRemoveLiquidityTransactionPayload(amount, assetId, router);
      const tx = await routerContract.removeLiquidity(amount, assetId, signature);
      console.log("removeLiquidityTx: ", tx);
    });
  });

  const prepare = async (
    transaction: InvariantTransactionData,
    record: VariantTransactionData,
  ): Promise<ContractReceipt> => {
    const args = convertToPrepareArgs(transaction, record);

    const signature = await signPrepareTransactionPayload(
      transaction,
      args.amount,
      args.expiry,
      args.encryptedCallData,
      args.encodedBid,
      args.bidSignature,
      args.encodedMeta,
      router,
    );
    const prepareTx = await routerContract.connect(gelato).prepare(args, signature);

    const receipt = await prepareTx.wait();
    expect(receipt.status).to.be.eq(1);

    return receipt;
  };

  describe("prepare", () => {
    it("should prepare: ERC20", async () => {
      const { transaction, record } = await getTransactionData();
      await prepare(transaction, record);
    });
  });

  // // TODO: internal function need to create test contract
  //   describe("recoverSignature", () => {
  //     it("should work", async () => {
  //       const { transaction, record } = await getTransactionData();
  //       const args = convertToPrepareArgs(transaction, record);

  //       const encodedPayload = encodePrepareData(
  //         transaction,
  //         args.amount,
  //         args.expiry,
  //         args.encryptedCallData,
  //         args.encodedBid,
  //         args.bidSignature,
  //         args.encodedMeta,
  //       );

  //       const signature = await signPrepareTransactionPayload(
  //         transaction,
  //         args.amount,
  //         args.expiry,
  //         args.encryptedCallData,
  //         args.encodedBid,
  //         args.bidSignature,
  //         args.encodedMeta,
  //         router,
  //       );

  //       const res = await routerContract.recoverSignature(encodedPayload, signature);

  //       expect(res).to.be.eq(router.address);
  //     });
  //   });
});
