import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetDepositAPY = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [apy, setApy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); 

    const getDepositAPY = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getDepositAPY',
                args: [tokenAddress],
            });

            const apyValue = (result as bigint).toString(); 
            setApy(apyValue);
            setError(null); 
        } catch (error) {
            console.error('Error fetching deposit APY:', error);
            setError('Failed to fetch deposit APY'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Deposit APY</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    //placeholder="Enter token address"
                />
            </div>
            <button type='button' onClick={getDepositAPY}>Get APY</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="apy-info">
                <h6>Deposit APY: {apy !== null ? apy : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetDepositAPY;
