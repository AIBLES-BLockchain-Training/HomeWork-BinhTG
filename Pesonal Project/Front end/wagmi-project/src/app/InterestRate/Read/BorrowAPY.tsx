import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css';

const CalculateBorrowAPY = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [apy, setApy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAPY = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateBorrowAPY',
                args: [tokenAddress as Address],
            });

            const apyValue: bigint = result as bigint;
            setApy(apyValue.toString()); 
            setError(null);
        } catch (error) {
            console.error('Error fetching APY:', error);
            setError('Failed to fetch APY.');
        }
    }

    return (
        <div className="form-container">
            <h2>Calculate Borrow APY</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchAPY}>Get Borrow APY</button>
            {error && <p className="error">{error}</p>}
            <div className="contract-info">
                <h6>APY: {apy !== null ? apy : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default CalculateBorrowAPY;
