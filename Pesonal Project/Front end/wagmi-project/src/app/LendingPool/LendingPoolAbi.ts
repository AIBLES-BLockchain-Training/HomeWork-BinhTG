export const contract = {
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "lender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "AssetDeposit",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "lender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "AssetWithdraw",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "priceOracle",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "collateralManager",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "borrower",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "interestRate",
          type: "address",
        },
      ],
      name: "ContractAddressesUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "ExcessAmountTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "LoanTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "serviceFeeBalance",
          type: "uint256",
        },
      ],
      name: "ServiceFeeSet",
      type: "event",
    },
    {
      inputs: [],
      name: "admin",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "assetBalances",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "borrower",
      outputs: [
        { internalType: "contract IBorrower", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "collateralManager",
      outputs: [
        {
          internalType: "contract ICollateralManager",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "depositAsset",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllowedTokens",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "getCurrentUtilizationRate",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "getDepositAPY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "getTotalBalance",
      outputs: [
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "interestRate",
      outputs: [
        { internalType: "contract IInterestRate", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "isTokenAllowed",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "address", name: "", type: "address" },
      ],
      name: "lenderAssets",
      outputs: [
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "priceOracle",
      outputs: [
        { internalType: "contract IPriceOracle", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "serviceFee",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "serviceFeeBalance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_priceOracle", type: "address" },
        {
          internalType: "address",
          name: "_collateralManager",
          type: "address",
        },
        { internalType: "address", name: "_borrower", type: "address" },
        { internalType: "address", name: "_interestRate", type: "address" },
      ],
      name: "setContractAddresses",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_serviceFee", type: "uint256" },
      ],
      name: "setServiceFee",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "totalBorrowed",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "totalSupplied",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newAdmin", type: "address" }],
      name: "transferAdmin",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
        { internalType: "address", name: "user", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferExcessAmount",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
        { internalType: "address", name: "user", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferLoan",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "withDraw",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "withdrawServiceFee",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { stateMutability: "payable", type: "receive" },
  ],
  address: "0xA27B9424D5909869CBDFce9B870A2AD44Dd715F0",
};
