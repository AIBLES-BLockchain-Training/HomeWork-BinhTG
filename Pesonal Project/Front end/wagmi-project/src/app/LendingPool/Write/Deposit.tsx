import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const DepositAsset = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [ethValue, setEthValue] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tokenAddress || !amount) {
            alert('Please provide token address and amount.');
            return;
        }

        const depositAmount = BigInt(amount); 
        const ethAmount = ethValue ? BigInt(parseFloat(ethValue) * 1e18) : BigInt(0); 

        if (isNaN(Number(depositAmount)) || depositAmount <= 0) {
            alert('Please provide a valid amount.');
            return;
        }

        if (isNaN(Number(ethAmount)) || ethAmount < 0) {
            alert('Please provide a valid ETH value.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'depositAsset',
                args: [tokenAddress as Address, depositAmount],
                value: ethAmount,
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling depositAsset:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Deposit Asset</h2>
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
                    <label htmlFor="amount">Amount (in wei)</label>
                    <input 
                        type="number" 
                        id="amount" 
                        name="amount" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
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
                <button type="submit" className="submit-button">Deposit</button>
            </form>
        </div>
    );
}

export default DepositAsset;
