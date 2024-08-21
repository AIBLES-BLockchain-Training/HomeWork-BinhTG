import React, { useState } from 'react';
import { publicClient } from '../../client';
import { contract } from './PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const GetAssetOracle = () => {
    const [asset, setAsset] = useState<string>('');
    const [oracle, setOracle] = useState<string | null>(null);
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!asset) {
            alert('Please provide the asset address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'assetOracles',
                args: [asset],
            });
            setOracle(result as string);
        } catch (error) {
            console.error('Error calling assetOracles:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Asset Oracle</h2>
            <form onSubmit={submit}>
                <label htmlFor='asset'>Asset Address</label>
                <input 
                    type='text' 
                    name='asset' 
                    value={asset} 
                    onChange={(e) => setAsset(e.target.value)} 
                />
                <button type='submit'>Get Oracle Address</button>
            </form>
            {oracle && <h6 className="result">Oracle Address: {oracle}</h6>}
        </div>
    );
}

export default GetAssetOracle;
