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
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface IRouterFactoryInterface extends utils.Interface {
  functions: {
    "createRouter(address,address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "createRouter",
    values: [string, string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "createRouter",
    data: BytesLike
  ): Result;

  events: {
    "RouterCreated(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "RouterCreated"): EventFragment;
}

export type RouterCreatedEvent = TypedEvent<[string], { router: string }>;

export type RouterCreatedEventFilter = TypedEventFilter<RouterCreatedEvent>;

export interface IRouterFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IRouterFactoryInterface;

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
    createRouter(
      router: string,
      recipient: string,
      chainId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  createRouter(
    router: string,
    recipient: string,
    chainId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    createRouter(
      router: string,
      recipient: string,
      chainId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "RouterCreated(address)"(router?: null): RouterCreatedEventFilter;
    RouterCreated(router?: null): RouterCreatedEventFilter;
  };

  estimateGas: {
    createRouter(
      router: string,
      recipient: string,
      chainId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    createRouter(
      router: string,
      recipient: string,
      chainId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
