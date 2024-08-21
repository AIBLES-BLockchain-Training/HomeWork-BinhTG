import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css';

const CalculateBorrowAPR = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [apr, setApr] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAPR = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateBorrowAPR',
                args: [tokenAddress as Address],
            });
            const aprValue: bigint = result as bigint;
            setApr(aprValue.toString()); 
            setError(null);
        } catch (error) {
            console.error('Error fetching APR:', error);
            setError('Failed to fetch APR.');
        }
    }

    return (
        <div className="form-container">
            <h2>Calculate Borrow APR</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchAPR}>Get Borrow APR</button>
            {error && <p className="error">{error}</p>}
            <div className="contract-info">
                <h6>APR: {apr !== null ? apr : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default CalculateBorrowAPR;
