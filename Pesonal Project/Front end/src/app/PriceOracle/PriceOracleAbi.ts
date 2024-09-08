export const contract = {
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "asset",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "CustomPriceSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "asset",
          type: "address",
        },
      ],
      name: "OracleReset",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "asset",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "oracle",
          type: "address",
        },
      ],
      name: "OracleSet",
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
      name: "assetOracles",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "customPrices",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "asset", type: "address" }],
      name: "getAssetPrice",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "asset", type: "address" }],
      name: "resetAssetOracle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "asset", type: "address" },
        { internalType: "address", name: "oracle", type: "address" },
      ],
      name: "setAssetOracle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "asset", type: "address" },
        { internalType: "uint256", name: "price", type: "uint256" },
      ],
      name: "setCustomPrice",
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
  ],
  address: "0x7E06c54d2f51dd9d8443E98EAf3E98BE86984cb6",
};
