import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi'; 
import { Address } from 'viem';
import '../Function.css';

const GetUserCollateral = () => {
    const [userAddress, setUserAddress] = useState<string>(''); 
    const [collateralAddress, setCollateralAddress] = useState<string>(''); 
    const [collateralAmount, setCollateralAmount] = useState<string | null>(null); 
    const [isLocked, setIsLocked] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null); 

    const getUserCollaterals = async () => {
        if (!userAddress || !collateralAddress) {
            setError('Please enter both addresses.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'userCollaterals',
                args: [userAddress, collateralAddress],
            });

            const [amount, isLocked] = result as [bigint, boolean];
            setCollateralAmount(amount.toString()); 
            setIsLocked(isLocked);
            setError(null); 
        } catch (error) {
            console.error('Error fetching user collaterals:', error);
            setError('Failed to fetch user collaterals'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get User Collaterals</h2>
            <div className="input-group">
                <label htmlFor="userAddress">User Address:</label>
                <input
                    id="userAddress"
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    // placeholder="Enter user address"
                />
            </div>
            <div className="input-group">
                <label htmlFor="collateralAddress">Collateral Address:</label>
                <input
                    id="collateralAddress"
                    type="text"
                    value={collateralAddress}
                    onChange={(e) => setCollateralAddress(e.target.value)}
                    // placeholder="Enter collateral address"
                />
            </div>
            <button type='button' onClick={getUserCollaterals}>Get Collaterals</button>
            {error && <p className="error">{error}</p>} 
            <div className="collateral-info">
                <h6>Collateral Amount: {collateralAmount !== null ? collateralAmount : 'N/A'}</h6>
                <h6>Is Locked: {isLocked !== null ? (isLocked ? 'Yes' : 'No') : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetUserCollateral;
