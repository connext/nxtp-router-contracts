import { ethers } from "hardhat";
import { expect } from "chai";

import { ERC20Abi } from "@connext/nxtp-utils";

import {
  BigNumber,
  constants,
  Contract,
  ContractFactory,
  ContractReceipt,
  providers,
} from "ethers/lib/ethers";

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
    factory = await ethers.getContractFactory(
      factoryInfo.abi,
      factoryInfo.bytecode
    );
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
  provider: providers.Provider
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
    if (
      typeof expected[k] === "object" &&
      !BigNumber.isBigNumber(expected[k])
    ) {
      expect(typeof returned[k] === "object");
      assertObject(expected[k], returned[k]);
    } else {
      expect(returned[k]).to.be.deep.eq((expected as any)[k]);
    }
  });
};

export const assertReceiptEvent = async (
  receipt: ContractReceipt,
  eventName: string,
  expected: any
) => {
  expect(receipt.status).to.be.eq(1);
  const idx = receipt.events?.findIndex((e) => e.event === eventName) ?? -1;
  expect(idx).to.not.be.eq(-1);
  const decoded = receipt.events![idx].decode!(
    receipt.events![idx].data,
    receipt.events![idx].topics
  );
  assertObject(expected, decoded);
};
