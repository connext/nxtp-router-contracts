/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export type TransactionDataStruct = {
  receivingChainTxManagerAddress: string;
  user: string;
  router: string;
  initiator: string;
  sendingAssetId: string;
  receivingAssetId: string;
  sendingChainFallback: string;
  receivingAddress: string;
  callTo: string;
  callDataHash: BytesLike;
  transactionId: BytesLike;
  sendingChainId: BigNumberish;
  receivingChainId: BigNumberish;
  amount: BigNumberish;
  expiry: BigNumberish;
  preparedBlockNumber: BigNumberish;
};

export type TransactionDataStructOutput = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  receivingChainTxManagerAddress: string;
  user: string;
  router: string;
  initiator: string;
  sendingAssetId: string;
  receivingAssetId: string;
  sendingChainFallback: string;
  receivingAddress: string;
  callTo: string;
  callDataHash: string;
  transactionId: string;
  sendingChainId: BigNumber;
  receivingChainId: BigNumber;
  amount: BigNumber;
  expiry: BigNumber;
  preparedBlockNumber: BigNumber;
};

export type CancelArgsStruct = {
  txData: TransactionDataStruct;
  signature: BytesLike;
  encodedMeta: BytesLike;
};

export type CancelArgsStructOutput = [
  TransactionDataStructOutput,
  string,
  string
] & {
  txData: TransactionDataStructOutput;
  signature: string;
  encodedMeta: string;
};

export type FulfillArgsStruct = {
  txData: TransactionDataStruct;
  relayerFee: BigNumberish;
  signature: BytesLike;
  callData: BytesLike;
  encodedMeta: BytesLike;
};

export type FulfillArgsStructOutput = [
  TransactionDataStructOutput,
  BigNumber,
  string,
  string,
  string
] & {
  txData: TransactionDataStructOutput;
  relayerFee: BigNumber;
  signature: string;
  callData: string;
  encodedMeta: string;
};

export type InvariantTransactionDataStruct = {
  receivingChainTxManagerAddress: string;
  user: string;
  router: string;
  initiator: string;
  sendingAssetId: string;
  receivingAssetId: string;
  sendingChainFallback: string;
  receivingAddress: string;
  callTo: string;
  sendingChainId: BigNumberish;
  receivingChainId: BigNumberish;
  callDataHash: BytesLike;
  transactionId: BytesLike;
};

export type InvariantTransactionDataStructOutput = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  string,
  string
] & {
  receivingChainTxManagerAddress: string;
  user: string;
  router: string;
  initiator: string;
  sendingAssetId: string;
  receivingAssetId: string;
  sendingChainFallback: string;
  receivingAddress: string;
  callTo: string;
  sendingChainId: BigNumber;
  receivingChainId: BigNumber;
  callDataHash: string;
  transactionId: string;
};

export type PrepareArgsStruct = {
  invariantData: InvariantTransactionDataStruct;
  amount: BigNumberish;
  expiry: BigNumberish;
  encryptedCallData: BytesLike;
  encodedBid: BytesLike;
  bidSignature: BytesLike;
  encodedMeta: BytesLike;
};

export type PrepareArgsStructOutput = [
  InvariantTransactionDataStructOutput,
  BigNumber,
  BigNumber,
  string,
  string,
  string,
  string
] & {
  invariantData: InvariantTransactionDataStructOutput;
  amount: BigNumber;
  expiry: BigNumber;
  encryptedCallData: string;
  encodedBid: string;
  bidSignature: string;
  encodedMeta: string;
};

export interface RouterInterface extends utils.Interface {
  functions: {
    "cancel(((address,address,address,address,address,address,address,address,address,bytes32,bytes32,uint256,uint256,uint256,uint256,uint256),bytes,bytes),bytes)": FunctionFragment;
    "fulfill(((address,address,address,address,address,address,address,address,address,bytes32,bytes32,uint256,uint256,uint256,uint256,uint256),uint256,bytes,bytes,bytes),bytes)": FunctionFragment;
    "owner()": FunctionFragment;
    "prepare(((address,address,address,address,address,address,address,address,address,uint256,uint256,bytes32,bytes32),uint256,uint256,bytes,bytes,bytes,bytes),bytes)": FunctionFragment;
    "recipient()": FunctionFragment;
    "removeLiquidity(uint256,address,bytes)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setRecipient(address)": FunctionFragment;
    "signer()": FunctionFragment;
    "transactionManager()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "cancel",
    values: [CancelArgsStruct, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "fulfill",
    values: [FulfillArgsStruct, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "prepare",
    values: [PrepareArgsStruct, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "recipient", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeLiquidity",
    values: [BigNumberish, string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setRecipient",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "signer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transactionManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "cancel", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "fulfill", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "prepare", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "recipient", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setRecipient",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "signer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transactionManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface Router extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: RouterInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    cancel(
      args: CancelArgsStruct,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    fulfill(
      args: FulfillArgsStruct,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    prepare(
      args: PrepareArgsStruct,
      signature: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    recipient(overrides?: CallOverrides): Promise<[string]>;

    removeLiquidity(
      amount: BigNumberish,
      assetId: string,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setRecipient(
      _recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    signer(overrides?: CallOverrides): Promise<[string]>;

    transactionManager(overrides?: CallOverrides): Promise<[string]>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  cancel(
    args: CancelArgsStruct,
    signature: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  fulfill(
    args: FulfillArgsStruct,
    signature: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  prepare(
    args: PrepareArgsStruct,
    signature: BytesLike,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  recipient(overrides?: CallOverrides): Promise<string>;

  removeLiquidity(
    amount: BigNumberish,
    assetId: string,
    signature: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setRecipient(
    _recipient: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transactionManager(overrides?: CallOverrides): Promise<string>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    cancel(
      args: CancelArgsStruct,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<TransactionDataStructOutput>;

    fulfill(
      args: FulfillArgsStruct,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<TransactionDataStructOutput>;

    owner(overrides?: CallOverrides): Promise<string>;

    prepare(
      args: PrepareArgsStruct,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<TransactionDataStructOutput>;

    recipient(overrides?: CallOverrides): Promise<string>;

    removeLiquidity(
      amount: BigNumberish,
      assetId: string,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setRecipient(_recipient: string, overrides?: CallOverrides): Promise<void>;

    signer(overrides?: CallOverrides): Promise<string>;

    transactionManager(overrides?: CallOverrides): Promise<string>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    cancel(
      args: CancelArgsStruct,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    fulfill(
      args: FulfillArgsStruct,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    prepare(
      args: PrepareArgsStruct,
      signature: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    recipient(overrides?: CallOverrides): Promise<BigNumber>;

    removeLiquidity(
      amount: BigNumberish,
      assetId: string,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setRecipient(
      _recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    signer(overrides?: CallOverrides): Promise<BigNumber>;

    transactionManager(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    cancel(
      args: CancelArgsStruct,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    fulfill(
      args: FulfillArgsStruct,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    prepare(
      args: PrepareArgsStruct,
      signature: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    recipient(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeLiquidity(
      amount: BigNumberish,
      assetId: string,
      signature: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setRecipient(
      _recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    signer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transactionManager(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
