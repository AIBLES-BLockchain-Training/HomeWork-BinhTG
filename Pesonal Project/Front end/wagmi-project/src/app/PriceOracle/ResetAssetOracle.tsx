import React, { useState } from 'react';
import { publicClient, walletClient } from '../../client';
import { contract } from './PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const ResetAssetOracle = () => {
    const [asset, setAsset] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!asset) {
            alert('Please provide the asset address.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'resetAssetOracle',
                args: [asset],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling resetAssetOracle:', error);
        }
    }

    return (
        <div className="form-container"> {}
            <h2>Reset Asset Oracle</h2>
            <form onSubmit={submit}>
                <label htmlFor='asset'>Asset Address</label>
                <input 
                    type='text' 
                    name='asset' 
                    value={asset} 
                    onChange={(e) => setAsset(e.target.value)} 
                />
                <button type='submit'>Reset Oracle</button>
            </form>
        </div>
    );
}

export default ResetAssetOracle;
