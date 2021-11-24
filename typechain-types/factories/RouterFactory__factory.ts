/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { RouterFactory, RouterFactoryInterface } from "../RouterFactory";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "router",
        type: "address",
      },
    ],
    name: "RouterCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "createRouter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "assetId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "createRouterAndAddLiquidity",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transactionManager",
        type: "address",
      },
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "transactionManager",
    outputs: [
      {
        internalType: "contract ITransactionManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611ec6806100206000396000f3fe60806040526004361061003f5760003560e01c806319ab453c146100445780633b716452146100835780637b72b13c146100bf5780637f629efc146100d2575b600080fd5b34801561005057600080fd5b5061008161005f3660046102c2565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b005b34801561008f57600080fd5b506000546100a3906001600160a01b031681565b6040516001600160a01b03909116815260200160405180910390f35b6100a36100cd366004610339565b6100f2565b3480156100de57600080fd5b506100a36100ed366004610301565b610208565b604051631fd8a7bf60e21b81526001600160a01b0380881660048301528616602482015260009081903090637f629efc90604401602060405180830381600087803b15801561014057600080fd5b505af1158015610154573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061017891906102e5565b9050806001600160a01b031663977fceb861019a886001600160a01b03161590565b6101a55760006101a7565b865b878988886040518663ffffffff1660e01b81526004016101ca94939291906103e7565b6000604051808303818588803b1580156101e357600080fd5b505af11580156101f7573d6000803e3d6000fd5b50939b9a5050505050505050505050565b6000805460405182916001600160a01b03169085908590339061022a906102b5565b6001600160a01b039485168152928416602084015290831660408301529091166060820152608001604051809103906000f08015801561026e573d6000803e3d6000fd5b506040516001600160a01b03821681529091507f59490ddc6330cd50a9703c0b77827ff51b21e7a8592eb50d5252a4d20188cfd39060200160405180910390a19392505050565b611a4a8061044783390190565b6000602082840312156102d3578081fd5b81356102de8161042e565b9392505050565b6000602082840312156102f6578081fd5b81516102de8161042e565b60008060408385031215610313578081fd5b823561031e8161042e565b9150602083013561032e8161042e565b809150509250929050565b60008060008060008060a08789031215610351578182fd5b863561035c8161042e565b9550602087013561036c8161042e565b9450604087013561037c8161042e565b935060608701359250608087013567ffffffffffffffff8082111561039f578384fd5b818901915089601f8301126103b2578384fd5b8135818111156103c0578485fd5b8a60208285010111156103d1578485fd5b6020830194508093505050509295509295509295565b8481526001600160a01b03841660208201526060604082018190528101829052818360808301376000818301608090810191909152601f909201601f191601019392505050565b6001600160a01b038116811461044357600080fd5b5056fe60c06040523480156200001157600080fd5b5060405162001a4a38038062001a4a8339810160408190526200003491620001cd565b6200003f336200008b565b6001600160601b0319606085811b821660805284901b1660a052600180546001600160a01b0384166001600160a01b03199091161790556200008181620000db565b5050505062000229565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000546001600160a01b031633146200013b5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064015b60405180910390fd5b6001600160a01b038116620001a25760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b606482015260840162000132565b620001ad816200008b565b50565b80516001600160a01b0381168114620001c857600080fd5b919050565b60008060008060808587031215620001e3578384fd5b620001ee85620001b0565b9350620001fe60208601620001b0565b92506200020e60408601620001b0565b91506200021e60608601620001b0565b905092959194509250565b60805160601c60a05160601c6117b06200029a600039600081816102370152818161033d015281816104620152818161057b01528181610638015261079a01526000818160be0152818161038e015281816104c8015281816105e101528181610691015261081a01526117b06000f3fe6080604052600436106100a75760003560e01c80639da42bac116100645780639da42bac14610185578063c48bf4a6146101b2578063d2baa168146101d2578063d4132a0b146101e5578063f2fde38b14610205578063f887ea401461022557600080fd5b80633b716452146100ac5780633bbed4a0146100fd57806366d003ac1461011f578063715018a61461013f5780638da5cb5b14610154578063977fceb814610172575b600080fd5b3480156100b857600080fd5b506100e07f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b34801561010957600080fd5b5061011d610118366004610ea2565b610259565b005b34801561012b57600080fd5b506001546100e0906001600160a01b031681565b34801561014b57600080fd5b5061011d6102ae565b34801561016057600080fd5b506000546001600160a01b03166100e0565b61011d6101803660046110b5565b6102e4565b34801561019157600080fd5b506101a56101a0366004610f33565b610440565b6040516100f491906115b1565b3480156101be57600080fd5b506101a56101cd366004610ec5565b610559565b6101a56101e0366004610f72565b610616565b3480156101f157600080fd5b5061011d6102003660046110b5565b610753565b34801561021157600080fd5b5061011d610220366004610ea2565b610880565b34801561023157600080fd5b506100e07f000000000000000000000000000000000000000000000000000000000000000081565b6000546001600160a01b0316331461028c5760405162461bcd60e51b8152600401610283906112a1565b60405180910390fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055565b6000546001600160a01b031633146102d85760405162461bcd60e51b8152600401610283906112a1565b6102e2600061091b565b565b6040805180820182528581526001600160a01b038086166020808401918252845190810189905290519091169281019290925290600090610339906060015b604051602081830303815290604052858561096b565b90507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316816001600160a01b03161461038c5760405162461bcd60e51b815260040161028390611271565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663c95f9d0e6103cc876001600160a01b03161590565b6103d75760006103d9565b345b6040516001600160e01b031960e084901b168152600481018a90526001600160a01b03891660248201526044016000604051808303818588803b15801561041f57600080fd5b505af1158015610433573d6000803e3d6000fd5b5050505050505050505050565b610448610dc3565b600061045e856040516020016103239190611344565b90507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316816001600160a01b0316146104b15760405162461bcd60e51b815260040161028390611271565b6040516301362a3560e71b81526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690639b151a80906104fd908890600401611344565b61020060405180830381600087803b15801561051857600080fd5b505af115801561052c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105509190610fb1565b95945050505050565b610561610dc3565b60006105778560405160200161032391906112d6565b90507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316816001600160a01b0316146105ca5760405162461bcd60e51b815260040161028390611271565b604051635f48d15d60e11b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063be91a2ba906104fd9088906004016112d6565b61061e610dc3565b60006106348560405160200161032391906113e0565b90507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316816001600160a01b0316146106875760405162461bcd60e51b815260040161028390611271565b6001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001663d94593726106d66106c960a0890160808a01610ea2565b6001600160a01b03161590565b6106e15760006106e3565b345b876040518363ffffffff1660e01b815260040161070091906113e0565b610200604051808303818588803b15801561071a57600080fd5b505af115801561072e573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906105509190610fb1565b6040805180820182528581526001600160a01b03808616602080840191825284519081018990529051909116928101929092529060009061079690606001610323565b90507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316816001600160a01b0316146107e95760405162461bcd60e51b815260040161028390611271565b600154604051633cc6af3160e21b8152600481018890526001600160a01b03878116602483015291821660448201527f00000000000000000000000000000000000000000000000000000000000000009091169063f31abcc490606401600060405180830381600087803b15801561086057600080fd5b505af1158015610874573d6000803e3d6000fd5b50505050505050505050565b6000546001600160a01b031633146108aa5760405162461bcd60e51b8152600401610283906112a1565b6001600160a01b03811661090f5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610283565b6109188161091b565b50565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000610a0a6109ce85805190602001206040517f19457468657265756d205369676e6564204d6573736167653a0a3332000000006020820152603c8101829052600090605c01604051602081830303815290604052805190602001209050919050565b84848080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250610a1292505050565b949350505050565b6000806000610a218585610a36565b91509150610a2e81610aa6565b509392505050565b600080825160411415610a6d5760208301516040840151606085015160001a610a6187828585610ca7565b94509450505050610a9f565b825160401415610a975760208301516040840151610a8c868383610d94565b935093505050610a9f565b506000905060025b9250929050565b6000816004811115610ac857634e487b7160e01b600052602160045260246000fd5b1415610ad15750565b6001816004811115610af357634e487b7160e01b600052602160045260246000fd5b1415610b415760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610283565b6002816004811115610b6357634e487b7160e01b600052602160045260246000fd5b1415610bb15760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610283565b6003816004811115610bd357634e487b7160e01b600052602160045260246000fd5b1415610c2c5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608401610283565b6004816004811115610c4e57634e487b7160e01b600052602160045260246000fd5b14156109185760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b6064820152608401610283565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610cde5750600090506003610d8b565b8460ff16601b14158015610cf657508460ff16601c14155b15610d075750600090506004610d8b565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610d5b573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610d8457600060019250925050610d8b565b9150600090505b94509492505050565b6000806001600160ff1b03831660ff84901c601b01610db587828885610ca7565b935093505050935093915050565b6040805161020081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c0810182905260e08101829052610100810182905261012081018290526101408101829052610160810182905261018081018290526101a081018290526101c081018290526101e081019190915290565b8035610e5281611765565b919050565b8051610e5281611765565b60008083601f840112610e73578182fd5b50813567ffffffffffffffff811115610e8a578182fd5b602083019150836020828501011115610a9f57600080fd5b600060208284031215610eb3578081fd5b8135610ebe81611765565b9392505050565b600080600060408486031215610ed9578182fd5b833567ffffffffffffffff80821115610ef0578384fd5b908501906102408288031215610f04578384fd5b90935060208501359080821115610f19578384fd5b50610f2686828701610e62565b9497909650939450505050565b600080600060408486031215610f47578283fd5b833567ffffffffffffffff80821115610f5e578485fd5b908501906102808288031215610f04578485fd5b600080600060408486031215610f86578283fd5b833567ffffffffffffffff80821115610f9d578485fd5b908501906102608288031215610f04578485fd5b60006102008284031215610fc3578081fd5b610fcb6116e8565b610fd483610e57565b8152610fe260208401610e57565b6020820152610ff360408401610e57565b604082015261100460608401610e57565b606082015261101560808401610e57565b608082015261102660a08401610e57565b60a082015261103760c08401610e57565b60c082015261104860e08401610e57565b60e082015261010061105b818501610e57565b9082015261012083810151908201526101408084015190820152610160808401519082015261018080840151908201526101a080840151908201526101c080840151908201526101e0928301519281019290925250919050565b600080600080606085870312156110ca578081fd5b8435935060208501356110dc81611765565b9250604085013567ffffffffffffffff8111156110f7578182fd5b61110387828801610e62565b95989497509550505050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b6111528261114583610e47565b6001600160a01b03169052565b61115e60208201610e47565b6001600160a01b0316602083015261117860408201610e47565b6001600160a01b0316604083015261119260608201610e47565b6001600160a01b031660608301526111ac60808201610e47565b6001600160a01b031660808301526111c660a08201610e47565b6001600160a01b031660a08301526111e060c08201610e47565b6001600160a01b031660c08301526111fa60e08201610e47565b6001600160a01b031660e0830152610100611216828201610e47565b6001600160a01b03169083015261012081810135908301526101408082013590830152610160808201359083015261018080820135908301526101a080820135908301526101c080820135908301526101e090810135910152565b60208082526016908201527514da59db985d1d5c99481a5cc81b9bdd081d985b1a5960521b604082015260600190565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b602081526112e76020820183611138565b60006112f7610200840184611720565b61024061022081818701526113116102608701848661110f565b935061131f81880188611720565b878603601f1901848901529350905061133984848361110f565b979650505050505050565b602081526113556020820183611138565b60006102206102008401358184015261137081850185611720565b9150610280610240818187015261138c6102a08701858561110f565b935061139a81880188611720565b93509050601f196102608188870301818901526113b886868561110f565b95506113c6818a018a611720565b95509250508087860301838801525061133984848361110f565b602081526113f46020820161114584610e47565b600061140260208401610e47565b6001600160a01b03811660408401525061141e60408401610e47565b6001600160a01b03811660608401525061143a60608401610e47565b6001600160a01b03811660808401525061145660808401610e47565b6001600160a01b03811660a08401525061147260a08401610e47565b6001600160a01b03811660c08401525061148e60c08401610e47565b6001600160a01b03811660e0840152506114aa60e08401610e47565b6101006114c1818501836001600160a01b03169052565b6114cc818601610e47565b9150506101206114e6818501836001600160a01b03169052565b6101409150808501358285015250610160818501358185015261018091508085013582850152506101a081850135818501526101c091508085013582850152506101e0818501358185015261153d81860186611720565b92509050610260610200818187015261155b6102808701858561110f565b935061156981880188611720565b93509050601f1961022081888703018189015261158786868561110f565b9550611595818a018a611720565b95509250506102408188870301818901526113b886868561110f565b81516001600160a01b03168152610200810160208301516115dd60208401826001600160a01b03169052565b5060408301516115f860408401826001600160a01b03169052565b50606083015161161360608401826001600160a01b03169052565b50608083015161162e60808401826001600160a01b03169052565b5060a083015161164960a08401826001600160a01b03169052565b5060c083015161166460c08401826001600160a01b03169052565b5060e083015161167f60e08401826001600160a01b03169052565b50610100838101516001600160a01b03169083015261012080840151908301526101408084015190830152610160808401519083015261018080840151908301526101a080840151908301526101c080840151908301526101e092830151929091019190915290565b604051610200810167ffffffffffffffff8111828210171561171a57634e487b7160e01b600052604160045260246000fd5b60405290565b6000808335601e19843603018112611736578283fd5b830160208101925035905067ffffffffffffffff81111561175657600080fd5b803603831315610a9f57600080fd5b6001600160a01b038116811461091857600080fdfea2646970667358221220a13af2500161ad7d2cd9f18f0445f63644577f43f4adbb0059d4a2483cb2c14f64736f6c63430008040033a26469706673582212209ea6297f6d8e490a9580c1daacfe8bd3fc43a24a7f6507e4d7052b3fb7bc242964736f6c63430008040033";

type RouterFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RouterFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RouterFactory__factory extends ContractFactory {
  constructor(...args: RouterFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<RouterFactory> {
    return super.deploy(overrides || {}) as Promise<RouterFactory>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): RouterFactory {
    return super.attach(address) as RouterFactory;
  }
  connect(signer: Signer): RouterFactory__factory {
    return super.connect(signer) as RouterFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RouterFactoryInterface {
    return new utils.Interface(_abi) as RouterFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RouterFactory {
    return new Contract(address, _abi, signerOrProvider) as RouterFactory;
  }
}
