import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css'; 

const SetAllowedToken = () => {
    const [tokens, setTokens] = useState<string[]>(['']); 
    const account = useAccount();

    const handleTokenChange = (index: number, value: string) => {
        const updatedTokens = [...tokens];
        updatedTokens[index] = value;
        setTokens(updatedTokens);
    };

    const addTokenField = () => {
        setTokens([...tokens, '']);
    };

    const removeTokenField = (index: number) => {
        const updatedTokens = tokens.filter((_, i) => i !== index);
        setTokens(updatedTokens);
    };

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (tokens.some(token => !token)) {
            alert('Please provide all token addresses.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setAllowedToken',
                args: [tokens.map(token => token as Address)],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setAllowedToken:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Set Allowed Tokens</h2>
            <form onSubmit={submit}>
                {tokens.map((token, index) => (
                    <div key={index} className="token-input">
                        <label htmlFor={`token-${index}`}>Token Address {index + 1}</label>
                        <input 
                            type='text' 
                            id={`token-${index}`} 
                            name={`token-${index}`} 
                            value={token} 
                            onChange={(e) => handleTokenChange(index, e.target.value)} 
                        />
                    </div>
                ))}
                <div className="button-container">
                    <button type="button" className="add-token" onClick={addTokenField}>Add Another Token</button>
                    {tokens.length > 1 && (
                        <button type="button" className="remove-token" onClick={() => removeTokenField(tokens.length - 1)}>Remove Last Token</button>
                    )}
                </div>
                <button type='submit' className="submit-token">Set Tokens</button>
            </form>
        </div>
    );
}

export default SetAllowedToken;
