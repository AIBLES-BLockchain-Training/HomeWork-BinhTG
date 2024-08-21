import { createPublicClient, createWalletClient, custom, http } from "viem";
import { mainnet, sepolia, bsc } from "viem/chains";
// import "viem/window"

export const publicClient = createPublicClient({
  chain: sepolia,        
  transport: http(),
});


export const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
});
