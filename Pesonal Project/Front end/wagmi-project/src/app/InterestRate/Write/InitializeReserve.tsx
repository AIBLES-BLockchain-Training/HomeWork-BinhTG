import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css';

const InitializeReserve = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [error, setError] = useState<string | null>(null); 
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tokenAddress) {
            setError('Please provide a token address.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'initializeReserve',
                args: [tokenAddress as Address],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
            setError(null); 
        } catch (error) {
            console.error('Error calling initializeReserve:', error);
            setError('Failed to initialize reserve.'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Initialize Reserve</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="tokenAddress">Token Address:</label>
                    <input 
                        type="text" 
                        id="tokenAddress" 
                        name="tokenAddress" 
                        value={tokenAddress} 
                        onChange={(e) => setTokenAddress(e.target.value)} 
                        //placeholder="Enter token address"
                    />
                </div>
                <button type="submit" className="submit-button">Initialize Reserve</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default InitializeReserve;
