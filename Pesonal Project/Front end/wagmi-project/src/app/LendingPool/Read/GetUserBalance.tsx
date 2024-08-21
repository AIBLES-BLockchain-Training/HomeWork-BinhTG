import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetTotalBalance1 = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [totalBalance, setTotalBalance1] = useState<string | null>(null); 
    const [currentLiquidityIndex, setcurrentLiquidityIndex] = useState<string | null>(null); 
    const [error, setError] = useState<string | null>(null); 
    
    const getTotalBalance2 = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getTotalBalance',
                args: [tokenAddress],
            });

            const [balance, currentLiquidityIndex] = result as [bigint, bigint];
console.log(balance);
console.log(currentLiquidityIndex);

            setTotalBalance1(balance.toString()); 
            setcurrentLiquidityIndex(currentLiquidityIndex.toString());
            setError(null); 
        } catch (error) {
            console.error('Error fetching total balance:', error);
            setError('Failed to fetch total balance'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get User Balance</h2>
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
            <button type='button' onClick={getTotalBalance2}>Get Balance</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="balance-info">
                <h6>Total Balance 1: {totalBalance !== null ? totalBalance : 'N/A'}</h6>
                <h6>Current Liquidity Index: {currentLiquidityIndex !== null ? currentLiquidityIndex : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetTotalBalance1;
