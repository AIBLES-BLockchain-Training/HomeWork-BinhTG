export const contract = {
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "lendingPool",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "borrower",
          type: "address",
        },
      ],
      name: "ContractAddressesSet",
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
          indexed: false,
          internalType: "uint256",
          name: "slope1",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "slope2",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "baseRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_utilizationOptimal",
          type: "uint256",
        },
      ],
      name: "InterestRateSet",
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
          indexed: false,
          internalType: "uint256",
          name: "liquidityRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "variableBorrowRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "liquidityIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
      ],
      name: "ReserveDataUpdated",
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
          indexed: false,
          internalType: "uint256",
          name: "currentLiquidityRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "currentVariableBorrowRate",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "liquidityIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lastUpdateTimestamp",
          type: "uint256",
        },
      ],
      name: "ReserveInitialized",
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
      inputs: [],
      name: "borrower",
      outputs: [
        { internalType: "contract IBorrower", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "calculateBorrowAPR",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "calculateBorrowAPY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "calculateDepositAPY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "getInterestRateParams",
      outputs: [
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "getReserveData",
      outputs: [
        { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
        {
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentLiquidityRate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentVariableBorrowRate",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "initializeReserve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "interestParams",
      outputs: [
        { internalType: "uint256", name: "slope1", type: "uint256" },
        { internalType: "uint256", name: "slope2", type: "uint256" },
        { internalType: "uint256", name: "baseRate", type: "uint256" },
        {
          internalType: "uint256",
          name: "utilizationOptimal",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "lendingPool",
      outputs: [
        { internalType: "contract ILendingPool", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "reserves",
      outputs: [
        { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
        {
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentLiquidityRate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "currentVariableBorrowRate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lastUpdateTimestamp",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_lendingPool", type: "address" },
        { internalType: "address", name: "_borrower", type: "address" },
      ],
      name: "setContractAddresses",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
        { internalType: "uint256", name: "_slope1", type: "uint256" },
        { internalType: "uint256", name: "_slope2", type: "uint256" },
        { internalType: "uint256", name: "_baseRate", type: "uint256" },
        {
          internalType: "uint256",
          name: "_utilizationOptimal",
          type: "uint256",
        },
      ],
      name: "setInterestRateParams",
      outputs: [],
      stateMutability: "nonpayable",
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
      ],
      name: "updateInterestRates",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  address: "0xe04A860b119Bda6deeA80452B3E6835F32F45D9E",
};
