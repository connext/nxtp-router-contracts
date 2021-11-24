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
      router.address,
      routerReceipient.address,
      router.address,
    );

    routerContractReceiverSide = await deployContract<Router>(
      "Router",
      transactionManagerReceiverSide.address,
      router.address,
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

    it("should set transactionManagerAddress", async () => {
        expect(await routerContract.router()).to.eq(router.address);
        expect(await routerContractReceiverSide.router()).to.eq(router.address);
      });

    
    it("should set recipient", async () => {
      expect(await routerContract.recipient()).to.eq(routerReceipient.address);
      expect(await routerContractReceiverSide.recipient()).to.eq(routerReceipient.address);
    });
  });

  describe("addLiquidity", () => {
     it("should add liquidity", async () => {}) 
  });
});



// const convertToPrepareArgs = (
//     transaction: InvariantTransactionData,
//     record: VariantTransactionData
//   ) => {
//     const args = {
//       invariantData: transaction,
//       amount: record.amount,
//       expiry: record.expiry,
//       encryptedCallData: EmptyBytes,
//       encodedBid: EmptyBytes,
//       bidSignature: EmptyBytes,
//       encodedMeta: EmptyBytes,
//     };
//     return args;
//   };
  
//   const convertToFulfillArgs = (
//     transaction: InvariantTransactionData,
//     record: VariantTransactionData,
//     relayerFee: string,
//     signature: string,
//     callData: string = EmptyBytes
//   ) => {
//     const args = {
//       txData: {
//         ...transaction,
//         ...record,
//       },
//       relayerFee,
//       signature,
//       callData,
//       encodedMeta: EmptyBytes,
//     };
//     return args;
//   };
  
//   const convertToCancelArgs = (
//     transaction: InvariantTransactionData,
//     record: VariantTransactionData,
//     signature: string
//   ) => {
//     const args = {
//       txData: {
//         ...transaction,
//         ...record,
//       },
//       signature,
//       encodedMeta: EmptyBytes,
//     };
//     return args;
//   };
  
//   const setupTest = deployments.createFixture(
//     async ({ deployments, getNamedAccounts, ethers }, options) => {
//       await deployments.fixture(); // ensure you start from a fresh deployments
//       const factory = await ethers.getContractFactory("TransactionManager");
//       txManager = (await factory.deploy(1338)) as TransactionManager;
//       console.log("txManager: ", txManager.address);
  
//       const { deployer, alice, bob } = await getNamedAccounts();
  
//       const routerFactory = await ethers.getContractFactory("Router", deployer);
//       router = (await routerFactory.deploy(
//         txManager.address,
//         alice,
//         bob,
//         deployer
//       )) as Router;
//       const txM = await router.transactionManager();
//       console.log("txM: ", txM);
//       expect(txM).to.eq(txManager.address);
  
//       const tokenFactory = await ethers.getContractFactory("TestERC20", deployer);
//       token = (await tokenFactory.deploy()) as TestERC20;
//       console.log("token: ", token.address);
  
//       await txManager.addAssetId(token.address);
//       await txManager.addRouter(router.address);
//     }
//   );


// beforeEach(async () => {
//     await setupTest();

//     const amt = ethers.utils.parseEther("1");

//     await token.approve(txManager.address, amt);
//     await txManager.addLiquidityFor(amt, token.address, router.address);

//     const liq = await txManager.routerBalances(router.address, token.address);
//     expect(liq.toString()).to.eq(amt.toString());
//   });

//   it("should prepare tx with the correct sig and a diff tx sender", async () => {
//     const { transaction, record } = await getTransactionData();
//     // Send tx
//     const args = {
//       invariantData: transaction,
//       amount: record.amount,
//       expiry: record.expiry,
//       encryptedCallData: EmptyBytes,
//       encodedBid: EmptyBytes,
//       bidSignature: EmptyBytes,
//       encodedMeta: EmptyBytes,
//     };

//     const routerSig = await signPrepareTransactionPayload(
//       transaction,
//       args.amount,
//       args.expiry,
//       args.encryptedCallData,
//       args.encodedBid,
//       args.bidSignature,
//       args.encodedMeta,
//       alice
//     );
//     const prepareTx = await router.connect(rando).prepare(args, routerSig);
//     console.log("prepareTx: ", prepareTx);
//   });
// });

// // TODO: MOVE THESE INTO nxtp-utils

// export const SignedPrepareDataEncoding = tidy(`tuple(
//   ${InvariantTransactionDataEncoding} invariantData,
//   uint256 amount,
//   uint256 expiry,
//   bytes encryptedCallData,
//   bytes encodedBid,
//   bytes bidSignature,
//   bytes encodedMeta
// )`);

// export const encodePrepareData = (
//   invariantData: InvariantTransactionData,
//   amount: string,
//   expiry: number,
//   encryptedCallData: string,
//   encodedBid: string,
//   bidSignature: string,
//   encodedMeta: string
// ): string => {
//   return defaultAbiCoder.encode(
//     [SignedPrepareDataEncoding],
//     [
//       {
//         invariantData,
//         amount,
//         expiry,
//         encryptedCallData,
//         encodedBid,
//         bidSignature,
//         encodedMeta,
//       },
//     ]
//   );
// };

// export const getPrepareTransactionHashToSign = (
//   invariantData: InvariantTransactionData,
//   amount: string,
//   expiry: number,
//   encryptedCallData: string,
//   encodedBid: string,
//   bidSignature: string,
//   encodedMeta: string
// ): string => {
//   const payload = encodePrepareData(
//     invariantData,
//     amount,
//     expiry,
//     encryptedCallData,
//     encodedBid,
//     bidSignature,
//     encodedMeta
//   );
//   const hash = solidityKeccak256(["bytes"], [payload]);
//   return hash;
// };

// export const signPrepareTransactionPayload = async (
//   invariantData: InvariantTransactionData,
//   amount: string,
//   expiry: number,
//   encryptedCallData: string,
//   encodedBid: string,
//   bidSignature: string,
//   encodedMeta: string,
//   signer: Wallet | Signer
// ): Promise<string> => {
//   const hash = getPrepareTransactionHashToSign(
//     invariantData,
//     amount,
//     expiry,
//     encryptedCallData,
//     encodedBid,
//     bidSignature,
//     encodedMeta
//   );

//   return sign(hash, signer);
// };

// const sign = async (hash: string, signer: Wallet | Signer): Promise<string> => {
//   const msg = arrayify(hash);
//   const addr = await signer.getAddress();
//   if (typeof (signer.provider as providers.Web3Provider)?.send === "function") {
//     try {
//       return sanitizeSignature(
//         await (signer.provider as providers.Web3Provider).send(
//           "personal_sign",
//           [hash, addr]
//         )
//       );
//     } catch (err) {
//       // console.error("Error using personal_sign, falling back to signer.signMessage: ", err);
//     }
//   }

//   return sanitizeSignature(await signer.signMessage(msg));
// };

// const sanitizeSignature = (sig: string): string => {
//   if (sig.endsWith("1c") || sig.endsWith("1b")) {
//     return sig;
//   }

//   // Must be sanitized
//   const { v } = splitSignature(sig);
//   const hex = BigNumber.from(v).toHexString();
//   return sig.slice(0, sig.length - 2) + hex.slice(2);
// };