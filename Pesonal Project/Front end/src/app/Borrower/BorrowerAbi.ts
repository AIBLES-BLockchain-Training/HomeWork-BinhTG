export const contract = {
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
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
          name: "lendingPool",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "interestRate",
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
          indexed: false,
          internalType: "uint256",
          name: "loanId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "borrower",
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
          name: "tokenAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "collateralAddresses",
          type: "address[]",
        },
      ],
      name: "LoanCreated",
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
          internalType: "uint256",
          name: "loanId",
          type: "uint256",
        },
      ],
      name: "LoanIdRemovedFromBorrower",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "loanId",
          type: "uint256",
        },
      ],
      name: "LoanIdRemovedFromGlobalList",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "loanId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "borrower",
          type: "address",
        },
      ],
      name: "LoanLiquidated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "loanId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "borrower",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "LoanRepaid",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "ltv",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "liquidationThreshold",
          type: "uint256",
        },
      ],
      name: "RiskParametersSet",
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
      inputs: [],
      name: "admin",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "loanId", type: "uint256" }],
      name: "calculateTotalRepayment",
      outputs: [
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "loanId", type: "uint256" }],
      name: "checkHealthFactor",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      name: "checkUpkeep",
      outputs: [
        { internalType: "bool", name: "upkeepNeeded", type: "bool" },
        { internalType: "bytes", name: "performData", type: "bytes" },
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
        { internalType: "uint256", name: "tokenAmount", type: "uint256" },
        {
          internalType: "address[]",
          name: "collateralAddresses",
          type: "address[]",
        },
      ],
      name: "createLoan",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "decimal",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllLoanIds",
      outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "getCurrentVariableBorrowRate",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "getUserLoanIds",
      outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
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
      inputs: [],
      name: "lendingPool",
      outputs: [
        { internalType: "contract ILendingPool", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "loanCounter",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "loanIds",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "loans",
      outputs: [
        { internalType: "uint256", name: "loanId", type: "uint256" },
        { internalType: "address", name: "borrower", type: "address" },
        { internalType: "address", name: "tokenAddress", type: "address" },
        { internalType: "uint256", name: "tokenAmount", type: "uint256" },
        {
          internalType: "uint256",
          name: "variableBorrowIndex",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "performData", type: "bytes" }],
      name: "performUpkeep",
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
        { internalType: "uint256", name: "loanId", type: "uint256" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "repayLoan",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "riskParameters",
      outputs: [
        { internalType: "uint256", name: "ltv", type: "uint256" },
        {
          internalType: "uint256",
          name: "liquidationThreshold",
          type: "uint256",
        },
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
      inputs: [
        { internalType: "address", name: "_priceOracle", type: "address" },
        {
          internalType: "address",
          name: "_collateralManager",
          type: "address",
        },
        { internalType: "address", name: "_lendingPool", type: "address" },
        { internalType: "address", name: "_interestRate", type: "address" },
      ],
      name: "setContractAddresses",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "token", type: "address" },
        { internalType: "uint256", name: "_ltv", type: "uint256" },
        {
          internalType: "uint256",
          name: "_liquidationThreshold",
          type: "uint256",
        },
      ],
      name: "setRiskParameters",
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
        { internalType: "address", name: "", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      name: "userLoans",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ],

  address: "0x96F3Df119f2ae6056F6646Bb53DA5dcE43e85e72",
};
