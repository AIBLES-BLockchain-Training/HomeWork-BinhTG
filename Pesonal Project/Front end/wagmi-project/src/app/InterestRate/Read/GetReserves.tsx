import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css';

const GetReserves = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [reserves, setReserves] = useState<{ liquidityIndex: string; variableBorrowIndex: string; currentLiquidityRate: string; currentVariableBorrowRate: string; lastUpdateTimestamp: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchReserves = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'reserves',
                args: [tokenAddress as Address],
            });

            console.log('Result from contract:', result);

            const [liquidityIndex, variableBorrowIndex, currentLiquidityRate, currentVariableBorrowRate, lastUpdateTimestamp] = result as [bigint, bigint, bigint, bigint, bigint];

            setReserves({
                liquidityIndex: liquidityIndex.toString(),
                variableBorrowIndex: variableBorrowIndex.toString(),
                currentLiquidityRate: currentLiquidityRate.toString(),
                currentVariableBorrowRate: currentVariableBorrowRate.toString(),
                lastUpdateTimestamp: lastUpdateTimestamp.toString(),
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching reserves:', error);
            setError('Failed to fetch reserves.');
        }
    }

    return (
        <div className="form-container">
            <h2>Get Reserves</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchReserves}>Get Reserves</button>
            {error && <p className="error">{error}</p>}
            {reserves && (
                <div className="contract-info">
                    <h6>Liquidity Index: {reserves.liquidityIndex}</h6>
                    <h6>Variable Borrow Index: {reserves.variableBorrowIndex}</h6>
                    <h6>Current Liquidity Rate: {reserves.currentLiquidityRate}</h6>
                    <h6>Current Variable BorrowRate: {reserves.currentVariableBorrowRate}</h6>
                    <h6>Last Update Timestamp: {reserves.lastUpdateTimestamp}</h6>
                </div>
            )}
        </div>
    );
};

export default GetReserves;
