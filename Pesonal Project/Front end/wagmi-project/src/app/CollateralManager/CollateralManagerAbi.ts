export const contract = {
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address[]",
          name: "newTokens",
          type: "address[]",
        },
      ],
      name: "AllowedTokensUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "collateralAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "CollateralAdded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "collateralAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLocked",
          type: "bool",
        },
      ],
      name: "CollateralLocked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "collateralAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "CollateralRemoved",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "borrower",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "collateralAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "CollateralTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "collateralAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLocked",
          type: "bool",
        },
      ],
      name: "CollateralUnlocked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "priceOracle",
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
          name: "lendingPool",
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
          indexed: false,
          internalType: "uint256",
          name: "serviceFee",
          type: "uint256",
        },
      ],
      name: "ServiceFeeSet",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "collateralAddress", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "addCollateral",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "admin",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "allowedTokens",
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
      inputs: [],
      name: "getAllowedTokens",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "user", type: "address" },
        { internalType: "address", name: "collateralAddress", type: "address" },
      ],
      name: "getCollateralAmount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "user", type: "address" },
        {
          internalType: "address[]",
          name: "tokenAddresses",
          type: "address[]",
        },
      ],
      name: "getCollateralValueForTokens",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "getUserCollateralAddresses",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "isTokenAllowed",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
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
      inputs: [
        { internalType: "address", name: "user", type: "address" },
        {
          internalType: "address[]",
          name: "collateralAddresses",
          type: "address[]",
        },
      ],
      name: "lockCollaterals",
      outputs: [],
      stateMutability: "nonpayable",
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
      inputs: [
        { internalType: "address", name: "collateralAddress", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "removeCollateral",
      outputs: [],
      stateMutability: "payable",
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
      inputs: [
        { internalType: "address[]", name: "tokens", type: "address[]" },
      ],
      name: "setAllowedToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_priceOracle", type: "address" },
        { internalType: "address", name: "_borrower", type: "address" },
        { internalType: "address", name: "_lendingPool", type: "address" },
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
      inputs: [{ internalType: "address", name: "newAdmin", type: "address" }],
      name: "transferAdmin",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "collateralAddress", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferCollateral",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "user", type: "address" },
        {
          internalType: "address[]",
          name: "collateralAddresses",
          type: "address[]",
        },
      ],
      name: "unlockCollaterals",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      name: "userCollateralAddresses",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "address", name: "", type: "address" },
      ],
      name: "userCollaterals",
      outputs: [
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bool", name: "isLocked", type: "bool" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  address: "0x58D214B77aAF8cB3A8406ea420598491Ba10C83c",
};
