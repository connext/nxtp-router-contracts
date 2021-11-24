import { ethers } from "hardhat";
import { expect } from "chai";

import { ERC20Abi } from "@connext/nxtp-utils";
import { arrayify, splitSignature, defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils";
import { Wallet, BigNumber, constants, Contract, ContractFactory, ContractReceipt, Signer, providers } from "ethers";
import { InvariantTransactionData, InvariantTransactionDataEncoding, tidy } from "@connext/nxtp-utils";
import { Artifact } from "hardhat/types";

export const MAX_FEE_PER_GAS = BigNumber.from("975000000");
export const deployContract = async <T extends Contract = Contract>(
  factoryInfo: string | Artifact,
  ...args: any[]
): Promise<T> => {
  let factory: ContractFactory;
  if (typeof factoryInfo === "string") {
    factory = (await ethers.getContractFactory(factoryInfo)) as ContractFactory;
  } else {
    factory = await ethers.getContractFactory(factoryInfo.abi, factoryInfo.bytecode);
  }
  const contract = await factory.deploy(...args, {
    maxFeePerGas: MAX_FEE_PER_GAS,
  });
  await contract.deployed();
  return contract as T;
};

export const getOnchainBalance = async (
  assetId: string,
  address: string,
  provider: providers.Provider,
): Promise<BigNumber> => {
  return assetId === constants.AddressZero
    ? provider.getBalance(address)
    : new Contract(assetId, ERC20Abi, provider).balanceOf(address);
};

export const setBlockTime = async (desiredTimestamp: number) => {
  await ethers.provider.send("evm_setNextBlockTimestamp", [desiredTimestamp]);
};

export const assertObject = (expected: any, returned: any) => {
  const keys = Object.keys(expected);
  keys.map((k) => {
    if (typeof expected[k] === "object" && !BigNumber.isBigNumber(expected[k])) {
      expect(typeof returned[k] === "object");
      assertObject(expected[k], returned[k]);
    } else {
      expect(returned[k]).to.be.deep.eq((expected as any)[k]);
    }
  });
};

export const assertReceiptEvent = async (receipt: ContractReceipt, eventName: string, expected: any) => {
  expect(receipt.status).to.be.eq(1);
  const idx = receipt.events?.findIndex((e) => e.event === eventName) ?? -1;
  expect(idx).to.not.be.eq(-1);
  const decoded = receipt.events![idx].decode!(receipt.events![idx].data, receipt.events![idx].topics);
  assertObject(expected, decoded);
};

// TODO: MOVE THESE INTO nxtp-utils

const SignedPrepareDataEncoding = tidy(`tuple(
    ${InvariantTransactionDataEncoding} invariantData,
    uint256 amount,
    uint256 expiry,
    bytes encryptedCallData,
    bytes encodedBid,
    bytes bidSignature,
    bytes encodedMeta
  )`);

const SignedAddLiqudityDataEncoding = tidy(`tuple(
    uint256 amount,
    address assetId
  )`);

const encodeAddLiqudityData = (amount: string, assetId: string): string => {
  return defaultAbiCoder.encode([SignedAddLiqudityDataEncoding], [{ amount, assetId }]);
};

const encodePrepareData = (
  invariantData: InvariantTransactionData,
  amount: string,
  expiry: number,
  encryptedCallData: string,
  encodedBid: string,
  bidSignature: string,
  encodedMeta: string,
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
    ],
  );
};

const getAddLiquidityHashToSign = (amount: string, assetId: string): string => {
  const payload = encodeAddLiqudityData(amount, assetId);
  const hash = solidityKeccak256(["bytes"], [payload]);
  return hash;
};

const getPrepareTransactionHashToSign = (
  invariantData: InvariantTransactionData,
  amount: string,
  expiry: number,
  encryptedCallData: string,
  encodedBid: string,
  bidSignature: string,
  encodedMeta: string,
): string => {
  const payload = encodePrepareData(
    invariantData,
    amount,
    expiry,
    encryptedCallData,
    encodedBid,
    bidSignature,
    encodedMeta,
  );
  const hash = solidityKeccak256(["bytes"], [payload]);
  return hash;
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

const sign = async (hash: string, signer: Wallet | Signer): Promise<string> => {
  const msg = arrayify(hash);
  const addr = await signer.getAddress();
  if (typeof (signer.provider as providers.Web3Provider)?.send === "function") {
    try {
      return sanitizeSignature(await (signer.provider as providers.Web3Provider).send("personal_sign", [hash, addr]));
    } catch (err) {
      // console.error("Error using personal_sign, falling back to signer.signMessage: ", err);
    }
  }

  return sanitizeSignature(await signer.signMessage(msg));
};

export const signPrepareTransactionPayload = async (
  invariantData: InvariantTransactionData,
  amount: string,
  expiry: number,
  encryptedCallData: string,
  encodedBid: string,
  bidSignature: string,
  encodedMeta: string,
  signer: Wallet | Signer,
): Promise<string> => {
  const hash = getPrepareTransactionHashToSign(
    invariantData,
    amount,
    expiry,
    encryptedCallData,
    encodedBid,
    bidSignature,
    encodedMeta,
  );

  return sign(hash, signer);
};

export const signAddLiquidityTransactionPayload = (
  amount: string,
  assetId: string,
  signer: Wallet | Signer,
): Promise<string> => {
  const hash = getAddLiquidityHashToSign(amount, assetId);

  return sign(hash, signer);
};
