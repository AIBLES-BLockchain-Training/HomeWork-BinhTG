import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css'; 

const AddCollateral = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [tokenAmount, setTokenAmount] = useState<string>('');
    const [ethValue, setEthValue] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tokenAddress || !tokenAmount || !ethValue) {
            alert('Please provide token address, amount, and ETH value.');
            return;
        }

        const collateralAmount = parseInt(tokenAmount, 10);
        const serviceFee = BigInt(parseFloat(ethValue) * 1e18); 

        if (isNaN(collateralAmount) || collateralAmount <= 0) {
            alert('Please provide a valid token amount.');
            return;
        }

        if (serviceFee <= 0) {
            alert('Please provide a valid ETH value.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'addCollateral',
                args: [tokenAddress as Address, collateralAmount],
                value: serviceFee, 
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling addCollateral:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Add Collateral</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="tokenAddress">Token Address</label>
                    <input 
                        type="text" 
                        id="tokenAddress" 
                        name="tokenAddress" 
                        value={tokenAddress} 
                        onChange={(e) => setTokenAddress(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="tokenAmount">Token Amount</label>
                    <input 
                        type="number" 
                        id="tokenAmount" 
                        name="tokenAmount" 
                        value={tokenAmount} 
                        onChange={(e) => setTokenAmount(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="ethValue">ETH Value (in ETH)</label>
                    <input 
                        type="number" 
                        id="ethValue" 
                        name="ethValue" 
                        step="0.01" 
                        value={ethValue} 
                        onChange={(e) => setEthValue(e.target.value)} 
                    />
                </div>
                <button type="submit" className="submit-button">Add Collateral</button>
            </form>
        </div>
    );
}

export default AddCollateral;
