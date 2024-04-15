/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MockERC5805Token,
  MockERC5805TokenInterface,
} from "../../contracts/MockERC5805Token";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidShortString",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string",
      },
    ],
    name: "StringTooLong",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "delegator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "fromDelegate",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "toDelegate",
        type: "address",
      },
    ],
    name: "DelegateChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "delegate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "previousBalance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newBalance",
        type: "uint256",
      },
    ],
    name: "DelegateVotesChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "EIP712DomainChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "CLOCK_MODE",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "pos",
        type: "uint32",
      },
    ],
    name: "checkpoints",
    outputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "fromBlock",
            type: "uint32",
          },
          {
            internalType: "uint224",
            name: "votes",
            type: "uint224",
          },
        ],
        internalType: "struct ERC20Votes.Checkpoint",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "clock",
    outputs: [
      {
        internalType: "uint48",
        name: "",
        type: "uint48",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
    ],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "delegateBySig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "delegates",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      {
        internalType: "bytes1",
        name: "fields",
        type: "bytes1",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "verifyingContract",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256[]",
        name: "extensions",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timepoint",
        type: "uint256",
      },
    ],
    name: "getPastTotalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timepoint",
        type: "uint256",
      },
    ],
    name: "getPastVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "numCheckpoints",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6101606040523480156200001257600080fd5b506040518060400160405280601081526020016f26b7b1b5a2a9219a9c181aaa37b5b2b760811b81525080604051806040016040528060018152602001603160f81b8152506040518060400160405280601081526020016f26b7b1b5a2a9219a9c181aaa37b5b2b760811b815250604051806040016040528060058152602001644d3538303560d81b8152508160039081620000af9190620008d8565b506004620000be8282620008d8565b50620000d091508390506005620001a7565b61012052620000e1816006620001a7565b61014052815160208084019190912060e052815190820120610100524660a0526200016f60e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60805250503060c05250620001a1336200018c6012600a62000ab7565b6200019b90620f424062000ac8565b620001e0565b62000b83565b6000602083511015620001c757620001bf83620001f0565b9050620001da565b81620001d48482620008d8565b5060ff90505b92915050565b620001ec82826200023c565b5050565b600080829050601f8151111562000227578260405163305a27a960e01b81526004016200021e919062000ae2565b60405180910390fd5b8051620002348262000b32565b179392505050565b620002488282620002e4565b6001600160e01b036200025c620003b18216565b1115620002c55760405162461bcd60e51b815260206004820152603060248201527f4552433230566f7465733a20746f74616c20737570706c79207269736b73206f60448201526f766572666c6f77696e6720766f74657360801b60648201526084016200021e565b620002de600b62000b4d620003b760201b1783620003cc565b50505050565b6001600160a01b0382166200033c5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064016200021e565b806002600082825462000350919062000b57565b90915550506001600160a01b038216600081815260208181526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3620001ec6000838362000559565b60025490565b6000620003c5828462000b57565b9392505050565b825460009081908181156200041b5760008781526020902082016000190160408051808201909152905463ffffffff8116825264010000000090046001600160e01b0316602082015262000430565b60408051808201909152600080825260208201525b905080602001516001600160e01b031693506200044e84868860201c565b92506000821180156200047b57506200046662000566565b65ffffffffffff16816000015163ffffffff16145b15620004c4576200048c8362000578565b60008881526020902083016000190180546001600160e01b03929092166401000000000263ffffffff9092169190911790556200054a565b866040518060400160405280620004f2620004e46200056660201b60201c565b65ffffffffffff16620005e7565b63ffffffff168152602001620005088662000578565b6001600160e01b0390811690915282546001810184556000938452602093849020835194909301519091166401000000000263ffffffff909316929092179101555b5050935093915050565b505050565b620005548383836200064e565b6000620005734362000682565b905090565b60006001600160e01b03821115620005e35760405162461bcd60e51b815260206004820152602760248201527f53616665436173743a2076616c756520646f65736e27742066697420696e20326044820152663234206269747360c81b60648201526084016200021e565b5090565b600063ffffffff821115620005e35760405162461bcd60e51b815260206004820152602660248201527f53616665436173743a2076616c756520646f65736e27742066697420696e203360448201526532206269747360d01b60648201526084016200021e565b6001600160a01b038381166000908152600960205260408082205485841683529120546200055492918216911683620006eb565b600065ffffffffffff821115620005e35760405162461bcd60e51b815260206004820152602660248201527f53616665436173743a2076616c756520646f65736e27742066697420696e203460448201526538206269747360d01b60648201526084016200021e565b816001600160a01b0316836001600160a01b0316141580156200070e5750600081115b1562000554576001600160a01b038316156200079b576001600160a01b0383166000908152600a602090815260408220829162000758919062000826901b62000b591785620003cc565b91509150846001600160a01b031660008051602062002aaa833981519152838360405162000790929190918252602082015260400190565b60405180910390a250505b6001600160a01b0382161562000554576001600160a01b0382166000908152600a6020908152604082208291620007df9190620003b7901b62000b4d1785620003cc565b91509150836001600160a01b031660008051602062002aaa833981519152838360405162000817929190918252602082015260400190565b60405180910390a25050505050565b6000620003c5828462000b6d565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200085f57607f821691505b6020821081036200088057634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200055457600081815260208120601f850160051c81016020861015620008af5750805b601f850160051c820191505b81811015620008d057828155600101620008bb565b505050505050565b81516001600160401b03811115620008f457620008f462000834565b6200090c816200090584546200084a565b8462000886565b602080601f8311600181146200094457600084156200092b5750858301515b600019600386901b1c1916600185901b178555620008d0565b600085815260208120601f198616915b82811015620009755788860151825594840194600190910190840162000954565b5085821015620009945787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b600181815b80851115620009fb578160001904821115620009df57620009df620009a4565b80851615620009ed57918102915b93841c9390800290620009bf565b509250929050565b60008262000a1457506001620001da565b8162000a2357506000620001da565b816001811462000a3c576002811462000a475762000a67565b6001915050620001da565b60ff84111562000a5b5762000a5b620009a4565b50506001821b620001da565b5060208310610133831016604e8410600b841016171562000a8c575081810a620001da565b62000a988383620009ba565b806000190482111562000aaf5762000aaf620009a4565b029392505050565b6000620003c560ff84168362000a03565b8082028115828204841417620001da57620001da620009a4565b600060208083528351808285015260005b8181101562000b115785810183015185820160400152820162000af3565b506000604082860101526040601f19601f8301168501019250505092915050565b80516020808301519190811015620008805760001960209190910360031b1b16919050565b80820180821115620001da57620001da620009a4565b81810381811115620001da57620001da620009a4565b60805160a05160c05160e051610100516101205161014051611ecc62000bde600039600061065a0152600061062f01526000610f8701526000610f5f01526000610eba01526000610ee401526000610f0e0152611ecc6000f3fe608060405234801561001057600080fd5b50600436106101635760003560e01c806370a08231116100ce5780639ab24eb0116100875780639ab24eb01461030c578063a457c2d71461031f578063a9059cbb14610332578063c3cda52014610345578063d505accf14610358578063dd62ed3e1461036b578063f1127ed81461037e57600080fd5b806370a082311461027b5780637ecebe00146102a457806384b0196e146102b75780638e539e8c146102d257806391ddadf4146102e557806395d89b411461030457600080fd5b8063395093511161012057806339509351146101e55780633a46b1a8146101f85780634bf5d7e91461020b578063587cde1e146102135780635c19a95c1461023e5780636fcfff451461025357600080fd5b806306fdde0314610168578063095ea7b31461018657806318160ddd146101a957806323b872dd146101bb578063313ce567146101ce5780633644e515146101dd575b600080fd5b6101706103bb565b60405161017d9190611aea565b60405180910390f35b610199610194366004611b19565b61044d565b604051901515815260200161017d565b6002545b60405190815260200161017d565b6101996101c9366004611b43565b610467565b6040516012815260200161017d565b6101ad61048b565b6101996101f3366004611b19565b61049a565b6101ad610206366004611b19565b6104bc565b61017061051e565b610226610221366004611b7f565b6105b6565b6040516001600160a01b03909116815260200161017d565b61025161024c366004611b7f565b6105d4565b005b610266610261366004611b7f565b6105e1565b60405163ffffffff909116815260200161017d565b6101ad610289366004611b7f565b6001600160a01b031660009081526020819052604090205490565b6101ad6102b2366004611b7f565b610603565b6102bf610621565b60405161017d9796959493929190611b9a565b6101ad6102e0366004611c30565b6106aa565b6102ed6106e5565b60405165ffffffffffff909116815260200161017d565b6101706106f0565b6101ad61031a366004611b7f565b6106ff565b61019961032d366004611b19565b610780565b610199610340366004611b19565b6107fb565b610251610353366004611c5a565b610809565b610251610366366004611cb2565b61093b565b6101ad610379366004611d1c565b610a9f565b61039161038c366004611d4f565b610aca565b60408051825163ffffffff1681526020928301516001600160e01b0316928101929092520161017d565b6060600380546103ca90611d8f565b80601f01602080910402602001604051908101604052809291908181526020018280546103f690611d8f565b80156104435780601f1061041857610100808354040283529160200191610443565b820191906000526020600020905b81548152906001019060200180831161042657829003601f168201915b5050505050905090565b60003361045b818585610b65565b60019150505b92915050565b600033610475858285610c89565b610480858585610d03565b506001949350505050565b6000610495610ead565b905090565b60003361045b8185856104ad8383610a9f565b6104b79190611dd9565b610b65565b60006104c66106e5565b65ffffffffffff1682106104f55760405162461bcd60e51b81526004016104ec90611dec565b60405180910390fd5b6001600160a01b0383166000908152600a602052604090206105179083610fd8565b9392505050565b6060436105296106e5565b65ffffffffffff161461057e5760405162461bcd60e51b815260206004820152601d60248201527f4552433230566f7465733a2062726f6b656e20636c6f636b206d6f646500000060448201526064016104ec565b5060408051808201909152601d81527f6d6f64653d626c6f636b6e756d6265722666726f6d3d64656661756c74000000602082015290565b6001600160a01b039081166000908152600960205260409020541690565b6105de33826110c0565b50565b6001600160a01b0381166000908152600a602052604081205461046190611156565b6001600160a01b038116600090815260076020526040812054610461565b6000606080828080836106557f000000000000000000000000000000000000000000000000000000000000000060056111bf565b6106807f000000000000000000000000000000000000000000000000000000000000000060066111bf565b60408051600080825260208201909252600f60f81b9b939a50919850469750309650945092509050565b60006106b46106e5565b65ffffffffffff1682106106da5760405162461bcd60e51b81526004016104ec90611dec565b610461600b83610fd8565b60006104954361126a565b6060600480546103ca90611d8f565b6001600160a01b0381166000908152600a6020526040812054801561076d576001600160a01b0383166000908152600a602052604090208054600019830190811061074c5761074c611e1f565b600091825260209091200154600160201b90046001600160e01b0316610770565b60005b6001600160e01b03169392505050565b6000338161078e8286610a9f565b9050838110156107ee5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084016104ec565b6104808286868403610b65565b60003361045b818585610d03565b834211156108595760405162461bcd60e51b815260206004820152601d60248201527f4552433230566f7465733a207369676e6174757265206578706972656400000060448201526064016104ec565b604080517fe48329057bfd03d55e49b547132e39cffd9c1820ad7b9d4c5307691425d15adf60208201526001600160a01b0388169181019190915260608101869052608081018590526000906108d3906108cb9060a001604051602081830303815290604052805190602001206112d1565b8585856112fe565b90506108de81611326565b86146109285760405162461bcd60e51b81526020600482015260196024820152784552433230566f7465733a20696e76616c6964206e6f6e636560381b60448201526064016104ec565b61093281886110c0565b50505050505050565b8342111561098b5760405162461bcd60e51b815260206004820152601d60248201527f45524332305065726d69743a206578706972656420646561646c696e6500000060448201526064016104ec565b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98888886109ba8c611326565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e0016040516020818303038152906040528051906020012090506000610a15826112d1565b90506000610a25828787876112fe565b9050896001600160a01b0316816001600160a01b031614610a885760405162461bcd60e51b815260206004820152601e60248201527f45524332305065726d69743a20696e76616c6964207369676e6174757265000060448201526064016104ec565b610a938a8a8a610b65565b50505050505050505050565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b60408051808201909152600080825260208201526001600160a01b0383166000908152600a60205260409020805463ffffffff8416908110610b0e57610b0e611e1f565b60009182526020918290206040805180820190915291015463ffffffff81168252600160201b90046001600160e01b0316918101919091529392505050565b60006105178284611dd9565b60006105178284611e35565b6001600160a01b038316610bc75760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b60648201526084016104ec565b6001600160a01b038216610c285760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b60648201526084016104ec565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6000610c958484610a9f565b90506000198114610cfd5781811015610cf05760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016104ec565b610cfd8484848403610b65565b50505050565b6001600160a01b038316610d675760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b60648201526084016104ec565b6001600160a01b038216610dc95760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b60648201526084016104ec565b6001600160a01b03831660009081526020819052604090205481811015610e415760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b60648201526084016104ec565b6001600160a01b03848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3610cfd848484611353565b6000306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016148015610f0657507f000000000000000000000000000000000000000000000000000000000000000046145b15610f3057507f000000000000000000000000000000000000000000000000000000000000000090565b610495604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b815460009081816005811115611032576000610ff38461135e565b610ffd9085611e35565b600088815260209020909150869082015463ffffffff16111561102257809150611030565b61102d816001611dd9565b92505b505b8082101561107f5760006110468383611446565b600088815260209020909150869082015463ffffffff16111561106b57809150611079565b611076816001611dd9565b92505b50611032565b80156110aa5760008681526020902081016000190154600160201b90046001600160e01b03166110ad565b60005b6001600160e01b03169695505050505050565b60006110cb836105b6565b905060006110ee846001600160a01b031660009081526020819052604090205490565b6001600160a01b0385811660008181526009602052604080822080546001600160a01b031916898616908117909155905194955093928616927f3134e8a2e6d97e929a7e54011ea5485d7d196dd5f0ba4d4ef95803e8e3fc257f9190a4610cfd828483611461565b600063ffffffff8211156111bb5760405162461bcd60e51b815260206004820152602660248201527f53616665436173743a2076616c756520646f65736e27742066697420696e203360448201526532206269747360d01b60648201526084016104ec565b5090565b606060ff83146111d9576111d28361159e565b9050610461565b8180546111e590611d8f565b80601f016020809104026020016040519081016040528092919081815260200182805461121190611d8f565b801561125e5780601f106112335761010080835404028352916020019161125e565b820191906000526020600020905b81548152906001019060200180831161124157829003601f168201915b50505050509050610461565b600065ffffffffffff8211156111bb5760405162461bcd60e51b815260206004820152602660248201527f53616665436173743a2076616c756520646f65736e27742066697420696e203460448201526538206269747360d01b60648201526084016104ec565b60006104616112de610ead565b8360405161190160f01b8152600281019290925260228201526042902090565b600080600061130f878787876115dd565b9150915061131c81611697565b5095945050505050565b6001600160a01b03811660009081526007602052604090208054600181018255905b50919050565b505050565b61134e8383836117dc565b60008160000361137057506000919050565b6000600161137d846117f7565b901c6001901b9050600181848161139657611396611e48565b048201901c905060018184816113ae576113ae611e48565b048201901c905060018184816113c6576113c6611e48565b048201901c905060018184816113de576113de611e48565b048201901c905060018184816113f6576113f6611e48565b048201901c9050600181848161140e5761140e611e48565b048201901c9050600181848161142657611426611e48565b048201901c90506105178182858161144057611440611e48565b0461188b565b60006114556002848418611e5e565b61051790848416611dd9565b816001600160a01b0316836001600160a01b0316141580156114835750600081115b1561134e576001600160a01b03831615611511576001600160a01b0383166000908152600a6020526040812081906114be90610b59856118a1565b91509150846001600160a01b03167fdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a7248383604051611506929190918252602082015260400190565b60405180910390a250505b6001600160a01b0382161561134e576001600160a01b0382166000908152600a60205260408120819061154790610b4d856118a1565b91509150836001600160a01b03167fdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724838360405161158f929190918252602082015260400190565b60405180910390a25050505050565b606060006115ab83611a13565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b6000806fa2a8918ca85bafe22016d0b997e4df60600160ff1b0383111561160a575060009050600361168e565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa15801561165e573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166116875760006001925092505061168e565b9150600090505b94509492505050565b60008160048111156116ab576116ab611e80565b036116b35750565b60018160048111156116c7576116c7611e80565b0361170f5760405162461bcd60e51b815260206004820152601860248201527745434453413a20696e76616c6964207369676e617475726560401b60448201526064016104ec565b600281600481111561172357611723611e80565b036117705760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e6774680060448201526064016104ec565b600381600481111561178457611784611e80565b036105de5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b60648201526084016104ec565b61134e6117e8846105b6565b6117f1846105b6565b83611461565b600080608083901c1561180c57608092831c92015b604083901c1561181e57604092831c92015b602083901c1561183057602092831c92015b601083901c1561184257601092831c92015b600883901c1561185457600892831c92015b600483901c1561186657600492831c92015b600283901c1561187857600292831c92015b600183901c156104615760010192915050565b600081831061189a5781610517565b5090919050565b825460009081908181156118ed5760008781526020902082016000190160408051808201909152905463ffffffff81168252600160201b90046001600160e01b03166020820152611902565b60408051808201909152600080825260208201525b905080602001516001600160e01b0316935061192284868863ffffffff16565b925060008211801561194c57506119376106e5565b65ffffffffffff16816000015163ffffffff16145b156119905761195a83611a3b565b60008881526020902083016000190180546001600160e01b0392909216600160201b0263ffffffff909216919091179055611a09565b8660405180604001604052806119b46119a76106e5565b65ffffffffffff16611156565b63ffffffff1681526020016119c886611a3b565b6001600160e01b039081169091528254600181018455600093845260209384902083519490930151909116600160201b0263ffffffff909316929092179101555b5050935093915050565b600060ff8216601f81111561046157604051632cd44ac360e21b815260040160405180910390fd5b60006001600160e01b038211156111bb5760405162461bcd60e51b815260206004820152602760248201527f53616665436173743a2076616c756520646f65736e27742066697420696e20326044820152663234206269747360c81b60648201526084016104ec565b6000815180845260005b81811015611aca57602081850181015186830182015201611aae565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006105176020830184611aa4565b80356001600160a01b0381168114611b1457600080fd5b919050565b60008060408385031215611b2c57600080fd5b611b3583611afd565b946020939093013593505050565b600080600060608486031215611b5857600080fd5b611b6184611afd565b9250611b6f60208501611afd565b9150604084013590509250925092565b600060208284031215611b9157600080fd5b61051782611afd565b60ff60f81b881681526000602060e081840152611bba60e084018a611aa4565b8381036040850152611bcc818a611aa4565b606085018990526001600160a01b038816608086015260a0850187905284810360c0860152855180825283870192509083019060005b81811015611c1e57835183529284019291840191600101611c02565b50909c9b505050505050505050505050565b600060208284031215611c4257600080fd5b5035919050565b803560ff81168114611b1457600080fd5b60008060008060008060c08789031215611c7357600080fd5b611c7c87611afd565b95506020870135945060408701359350611c9860608801611c49565b92506080870135915060a087013590509295509295509295565b600080600080600080600060e0888a031215611ccd57600080fd5b611cd688611afd565b9650611ce460208901611afd565b95506040880135945060608801359350611d0060808901611c49565b925060a0880135915060c0880135905092959891949750929550565b60008060408385031215611d2f57600080fd5b611d3883611afd565b9150611d4660208401611afd565b90509250929050565b60008060408385031215611d6257600080fd5b611d6b83611afd565b9150602083013563ffffffff81168114611d8457600080fd5b809150509250929050565b600181811c90821680611da357607f821691505b60208210810361134857634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b8082018082111561046157610461611dc3565b60208082526019908201527804552433230566f7465733a20667574757265206c6f6f6b757603c1b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b8181038181111561046157610461611dc3565b634e487b7160e01b600052601260045260246000fd5b600082611e7b57634e487b7160e01b600052601260045260246000fd5b500490565b634e487b7160e01b600052602160045260246000fdfea26469706673582212206360ced993ec520989b97f8adfe07e2ae888f3439236f881dca05c42cbf07b4a64736f6c63430008130033dec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724";

type MockERC5805TokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockERC5805TokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockERC5805Token__factory extends ContractFactory {
  constructor(...args: MockERC5805TokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<MockERC5805Token> {
    return super.deploy(overrides || {}) as Promise<MockERC5805Token>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MockERC5805Token {
    return super.attach(address) as MockERC5805Token;
  }
  override connect(signer: Signer): MockERC5805Token__factory {
    return super.connect(signer) as MockERC5805Token__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockERC5805TokenInterface {
    return new utils.Interface(_abi) as MockERC5805TokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockERC5805Token {
    return new Contract(address, _abi, signerOrProvider) as MockERC5805Token;
  }
}