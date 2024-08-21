import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi'; 
import { Address } from 'viem';
import '../Function.css';

const GetCollateralValueForTokens = () => {
    const [userAddress, setUserAddress] = useState<string>(''); 
    const [tokenAddresses, setTokenAddresses] = useState<string>(''); 
    const [collateralValue, setCollateralValue] = useState<string | null>(null); 
    const [error, setError] = useState<string | null>(null); 

    const getCollateralValue = async () => {
        if (!userAddress || !tokenAddresses) {
            setError('Please enter the user address and token addresses.');
            return;
        }

        try {
            const tokensArray: Address[] = tokenAddresses.split(',').map(address => address.trim()) as Address[];

            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCollateralValueForTokens',
                args: [userAddress, tokensArray],
            });
            const collateralValue = (result as bigint).toString()
            setCollateralValue(collateralValue); 
            setError(null); 
        } catch (error) {
            console.error('Error fetching collateral value:', error);
            setError('Failed to fetch collateral value'); 
        }
    }
    
    return (
        <div className="form-container">
            <h2>Get Collateral Value for Tokens</h2>
            <div className="input-group">
                <label htmlFor="userAddress">User Address:</label>
                <input
                    id="userAddress"
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label htmlFor="tokenAddresses">Token Addresses (comma separated):</label>
                <input
                    id="tokenAddresses"
                    type="text"
                    value={tokenAddresses}
                    onChange={(e) => setTokenAddresses(e.target.value)}
                />
            </div>
            <button type='button' onClick={getCollateralValue}>Get Collateral Value</button>
            {error && <p className="error">{error}</p>} 
            <div className="collateral-info">
                <h6>Collateral Value: {collateralValue !== null ? collateralValue : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCollateralValueForTokens;
