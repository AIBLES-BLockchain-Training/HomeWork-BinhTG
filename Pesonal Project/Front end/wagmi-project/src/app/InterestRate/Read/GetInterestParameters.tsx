import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css';

const GetInterestParams = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [params, setParams] = useState<{ slope1: string; slope2: string; baseRate: string; utilizationOptimal: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchParams = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'interestParams',
                args: [tokenAddress as Address],
            });

            console.log('Result from contract:', result);

            const [slope1, slope2, baseRate, utilizationOptimal] = result as [bigint, bigint, bigint, bigint];

            setParams({
                slope1: slope1.toString(),
                slope2: slope2.toString(),
                baseRate: baseRate.toString(),
                utilizationOptimal: utilizationOptimal.toString(),
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching interest params:', error);
            setError('Failed to fetch interest params.');
        }
    }

    return (
        <div className="form-container">
            <h2>Get Interest Parameters</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchParams}>Get Interest Params</button>
            {error && <p className="error">{error}</p>}
            {params && (
                <div className="contract-info">
                    <h6>Slope1: {params.slope1}</h6>
                    <h6>Slope2: {params.slope2}</h6>
                    <h6>Base Rate: {params.baseRate}</h6>
                    <h6>Utilization Optimal: {params.utilizationOptimal}</h6>
                </div>
            )}
        </div>
    );
};

export default GetInterestParams;
