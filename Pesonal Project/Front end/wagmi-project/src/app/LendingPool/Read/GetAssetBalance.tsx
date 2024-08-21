import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetAssetBalances = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [assetBalance, setAssetBalance] = useState<string | null>(null); 
    const [error, setError] = useState<string | null>(null);

    const fetchAssetBalance = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'assetBalances',
                args: [tokenAddress],
            });

            const balance = (result as bigint).toString(); 
            setAssetBalance(balance);
            setError(null); 
        } catch (error) {
            console.error('Error fetching allowed tokens:', error);
            setError('Failed to fetch tokens'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Asset Balance</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchAssetBalance}>Get Balance</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="asset-balance">
                <h6>Asset Balance: {assetBalance !== null ? assetBalance : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAssetBalances;
