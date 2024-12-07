import { createPublicClient, createWalletClient, custom, http } from "viem";
import { mainnet, sepolia, bsc } from "viem/chains";
// import "viem/window"

let transport = null; 
if (typeof window !== 'undefined' && window.ethereum) {
  transport = custom(window.ethereum);
} else {
  transport = http()
}

export const publicClient = createPublicClient({
  chain: sepolia,        
  transport: http(),
});


export const walletClient = createWalletClient({
    chain: sepolia,
    transport: transport!,
});
