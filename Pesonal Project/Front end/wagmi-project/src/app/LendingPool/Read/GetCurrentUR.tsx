import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetCurrentUtilizationRate = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [utilizationRate, setUtilizationRate] = useState<string | null>(null); 
    const [error, setError] = useState<string | null>(null); 

    const fetchUtilizationRate = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCurrentUtilizationRate',
                args: [tokenAddress],
            });

            const rate = (result as bigint).toString(); 
            setUtilizationRate(rate);
            setError(null); 
        } catch (error) {
            console.error('Error fetching borrowed and supplied amounts:', error);
            setError('Failed to fetch data'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Current Utilization Rate</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchUtilizationRate}>Get Utilization Rate</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="utilization-rate">
                <h6>Utilization Rate: {utilizationRate !== null ? utilizationRate : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCurrentUtilizationRate;
