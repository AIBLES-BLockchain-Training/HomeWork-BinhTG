import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const Withdraw = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [ethValue, setEthValue] = useState<string>(''); 
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tokenAddress || !amount || !ethValue) {
            alert('Please provide token address, amount, and ETH value.');
            return;
        }

        const withdrawAmount = parseInt(amount, 10);
        const ethAmount = BigInt(parseFloat(ethValue) * 1e18); 

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            alert('Please provide a valid amount.');
            return;
        }

        if (ethAmount <= 0) {
            alert('Please provide a valid ETH value.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'withDraw',
                args: [tokenAddress as Address, withdrawAmount],
                value: ethAmount, 
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling withDraw:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Withdraw Asset</h2>
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
                <button type="submit" className="submit-button">Withdraw</button>
            </form>
        </div>
    );
}

export default Withdraw;
