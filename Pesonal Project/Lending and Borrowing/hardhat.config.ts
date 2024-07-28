import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  gasReporter: {
    enabled: false,
    currency: 'USD',
    gasPrice: 21,
  },
};

export default config;
