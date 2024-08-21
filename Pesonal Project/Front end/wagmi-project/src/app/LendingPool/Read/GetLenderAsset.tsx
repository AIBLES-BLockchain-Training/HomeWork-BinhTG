import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetLenderAssets = () => {
    const [lenderAddress, setLenderAddress] = useState<string>(''); 
    const [collateralAddress, setCollateralAddress] = useState<string>(''); 
    const [amount, setAmount] = useState<string | null>(null);
    const [liquidityIndex, setLiquidityIndex] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); 

    const getLenderAssets = async () => {
        if (!lenderAddress || !collateralAddress) {
            setError('Please enter both addresses.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'lenderAssets',
                args: [lenderAddress, collateralAddress],
            });

            const [amount, liquidityIndex] = result as [bigint, bigint];
            setAmount(amount.toString());
            setLiquidityIndex(liquidityIndex.toString());
            setError(null); 
        } catch (error) {
            console.error('Error fetching lender assets:', error);
            setError('Failed to fetch lender assets'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Lender Assets</h2>
            <div className="input-group">
                <label htmlFor="lenderAddress">Lender Address:</label>
                <input
                    id="lenderAddress"
                    type="text"
                    value={lenderAddress}
                    onChange={(e) => setLenderAddress(e.target.value)}
                    //placeholder="Enter lender address"
                />
            </div>
            <div className="input-group">
                <label htmlFor="collateralAddress">Asset Address:</label>
                <input
                    id="collateralAddress"
                    type="text"
                    value={collateralAddress}
                    onChange={(e) => setCollateralAddress(e.target.value)}
                    //placeholder="Enter collateral address"
                />
            </div>
            <button type='button' onClick={getLenderAssets}>Get Assets</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="assets-info">
                <h6>Asset Amount: {amount !== null ? amount : 'N/A'}</h6>
                <h6>Liquidity Index: {liquidityIndex !== null ? liquidityIndex : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetLenderAssets;
