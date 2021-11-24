import { waffle, deployments, ethers } from "hardhat";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import {
  TransactionManager,
  TestERC20,
} from "@connext/nxtp-contracts/typechain";
import {
  encodeFulfillData,
  InvariantTransactionData,
  InvariantTransactionDataEncoding,
  PrepareParams,
  tidy,
  VariantTransactionData,
} from "@connext/nxtp-utils";
import {
  arrayify,
  defaultAbiCoder,
  hexlify,
  keccak256,
  randomBytes,
  solidityKeccak256,
  splitSignature,
} from "ethers/lib/utils";
use(solidity);

import { BigNumber, constants, providers, Signer, Wallet } from "ethers";
import { Router } from "../typechain-types";

let router: Router;
let token: TestERC20;
let txManager: TransactionManager;

const EmptyBytes = "0x";
const EmptyCallDataHash = keccak256(EmptyBytes);

const convertToPrepareArgs = (
  transaction: InvariantTransactionData,
  record: VariantTransactionData
) => {
  const args = {
    invariantData: transaction,
    amount: record.amount,
    expiry: record.expiry,
    encryptedCallData: EmptyBytes,
    encodedBid: EmptyBytes,
    bidSignature: EmptyBytes,
    encodedMeta: EmptyBytes,
  };
  return args;
};

const convertToFulfillArgs = (
  transaction: InvariantTransactionData,
  record: VariantTransactionData,
  relayerFee: string,
  signature: string,
  callData: string = EmptyBytes
) => {
  const args = {
    txData: {
      ...transaction,
      ...record,
    },
    relayerFee,
    signature,
    callData,
    encodedMeta: EmptyBytes,
  };
  return args;
};

const convertToCancelArgs = (
  transaction: InvariantTransactionData,
  record: VariantTransactionData,
  signature: string
) => {
  const args = {
    txData: {
      ...transaction,
      ...record,
    },
    signature,
    encodedMeta: EmptyBytes,
  };
  return args;
};

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    await deployments.fixture(); // ensure you start from a fresh deployments
    const factory = await ethers.getContractFactory("TransactionManager");
    txManager = (await factory.deploy(1338)) as TransactionManager;
    console.log("txManager: ", txManager.address);

    const { deployer, alice, bob } = await getNamedAccounts();

    const routerFactory = await ethers.getContractFactory("Router", deployer);
    router = (await routerFactory.deploy(
      txManager.address,
      alice,
      bob,
      deployer
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
  const [deployer, alice, bob, rando] =
    waffle.provider.getWallets() as Wallet[];

  const getTransactionData = async (): Promise<{
    transaction: InvariantTransactionData;
    record: VariantTransactionData;
  }> => {
    const transaction = {
      receivingChainTxManagerAddress: txManager.address,
      user: rando.address,
      router: router.address,
      initiator: rando.address,
      sendingAssetId: token.address,
      receivingAssetId: token.address,
      sendingChainFallback: rando.address,
      callTo: constants.AddressZero,
      receivingAddress: rando.address,
      callDataHash: EmptyCallDataHash,
      transactionId: hexlify(randomBytes(32)),
      sendingChainId: 1337,
      receivingChainId: 1338,
    };

    const day = 24 * 60 * 60;
    const block = await ethers.provider.getBlock("latest");
    const record = {
      amount: "10",
      expiry: block.timestamp + day + 5_000,
      preparedBlockNumber: 10,
    };

    return { transaction, record };
  };

  beforeEach(async () => {
    await setupTest();

    const amt = ethers.utils.parseEther("1");

    await token.approve(txManager.address, amt);
    await txManager.addLiquidityFor(amt, token.address, router.address);

    const liq = await txManager.routerBalances(router.address, token.address);
    expect(liq.toString()).to.eq(amt.toString());
  });

  it("should prepare tx with the correct sig and a diff tx sender", async () => {
    const { transaction, record } = await getTransactionData();
    // Send tx
    const args = {
      invariantData: transaction,
      amount: record.amount,
      expiry: record.expiry,
      encryptedCallData: EmptyBytes,
      encodedBid: EmptyBytes,
      bidSignature: EmptyBytes,
      encodedMeta: EmptyBytes,
    };

    const routerSig = await signPrepareTransactionPayload(
      transaction,
      args.amount,
      args.expiry,
      args.encryptedCallData,
      args.encodedBid,
      args.bidSignature,
      args.encodedMeta,
      alice
    );
    const prepareTx = await router.connect(rando).prepare(args, routerSig);
    console.log("prepareTx: ", prepareTx);
  });
});

// TODO: MOVE THESE INTO nxtp-utils

export const SignedPrepareDataEncoding = tidy(`tuple(
  ${InvariantTransactionDataEncoding} invariantData,
  uint256 amount,
  uint256 expiry,
  bytes encryptedCallData,
  bytes encodedBid,
  bytes bidSignature,
  bytes encodedMeta
)`);

export const encodePrepareData = (
  invariantData: InvariantTransactionData,
  amount: string,
  expiry: number,
  encryptedCallData: string,
  encodedBid: string,
  bidSignature: string,
  encodedMeta: string
): string => {
  return defaultAbiCoder.encode(
    [SignedPrepareDataEncoding],
    [
      {
        invariantData,
        amount,
        expiry,
        encryptedCallData,
        encodedBid,
        bidSignature,
        encodedMeta,
      },
    ]
  );
};

export const getPrepareTransactionHashToSign = (
  invariantData: InvariantTransactionData,
  amount: string,
  expiry: number,
  encryptedCallData: string,
  encodedBid: string,
  bidSignature: string,
  encodedMeta: string
): string => {
  const payload = encodePrepareData(
    invariantData,
    amount,
    expiry,
    encryptedCallData,
    encodedBid,
    bidSignature,
    encodedMeta
  );
  const hash = solidityKeccak256(["bytes"], [payload]);
  return hash;
};

export const signPrepareTransactionPayload = async (
  invariantData: InvariantTransactionData,
  amount: string,
  expiry: number,
  encryptedCallData: string,
  encodedBid: string,
  bidSignature: string,
  encodedMeta: string,
  signer: Wallet | Signer
): Promise<string> => {
  const hash = getPrepareTransactionHashToSign(
    invariantData,
    amount,
    expiry,
    encryptedCallData,
    encodedBid,
    bidSignature,
    encodedMeta
  );

  return sign(hash, signer);
};

const sign = async (hash: string, signer: Wallet | Signer): Promise<string> => {
  const msg = arrayify(hash);
  const addr = await signer.getAddress();
  if (typeof (signer.provider as providers.Web3Provider)?.send === "function") {
    try {
      return sanitizeSignature(
        await (signer.provider as providers.Web3Provider).send(
          "personal_sign",
          [hash, addr]
        )
      );
    } catch (err) {
      // console.error("Error using personal_sign, falling back to signer.signMessage: ", err);
    }
  }

  return sanitizeSignature(await signer.signMessage(msg));
};

const sanitizeSignature = (sig: string): string => {
  if (sig.endsWith("1c") || sig.endsWith("1b")) {
    return sig;
  }

  // Must be sanitized
  const { v } = splitSignature(sig);
  const hex = BigNumber.from(v).toHexString();
  return sig.slice(0, sig.length - 2) + hex.slice(2);
};
