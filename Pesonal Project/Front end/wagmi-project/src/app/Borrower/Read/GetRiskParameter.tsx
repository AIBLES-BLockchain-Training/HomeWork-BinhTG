import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetRiskParameters = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [ltv, setLtv] = useState<string | null>(null); 
    const [liquidationThreshold, setLiquidationThreshold] = useState<string | null>(null); 
    const [error, setError] = useState<string | null>(null); 

    const fetchRiskParameters = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'riskParameters',
                args: [tokenAddress],
            });

            const [ltvValue, liquidationThresholdValue] = result as [bigint, bigint];
            setLtv(ltvValue.toString()); 
            setLiquidationThreshold(liquidationThresholdValue.toString()); 
            setError(null); 
        } catch (error) {
            console.error('Error fetching risk parameters:', error);
            setError('Failed to fetch data'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Risk Parameters</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchRiskParameters}>Get Risk Parameters</button>
            {error && <p className="error">{error}</p>} {}
            <div className="contract-info">
                <h6>LTV: {ltv !== null ? ltv : 'N/A'}</h6>
                <h6>Liquidation Threshold: {liquidationThreshold !== null ? liquidationThreshold : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetRiskParameters;
