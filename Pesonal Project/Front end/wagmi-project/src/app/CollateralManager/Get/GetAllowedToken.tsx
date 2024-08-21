import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi'; 
import { Address } from 'viem';
import '../Function.css';

const GetAllowedTokens = () => {
    const [allowedTokens, setAllowedTokens] = useState<string[]>([]); 
    const [error, setError] = useState<string | null>(null); 

    const getAllowedTokens = async () => {
        try {
            const tokens = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getAllowedTokens',
            });
            
            setAllowedTokens(tokens as string[]);
            setError(null); 
        } catch (error) {
            console.error('Error fetching allowed tokens:', error);
            setError('Failed to fetch tokens'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Allowed Tokens</h2>
            <button type='button' onClick={getAllowedTokens}>Get Tokens</button>
            {error && <p className="error">{error}</p>} {}
            <div className="tokens">
                {allowedTokens.length > 0 ? (
                    allowedTokens.map((token, index) => (
                        <div key={index} className="token-info">
                            <h6>Token {index + 1}: {token}</h6>
                        </div>
                    ))
                ) : (
                    <p></p>
                )}
            </div>
        </div>
    );
};

export default GetAllowedTokens;
