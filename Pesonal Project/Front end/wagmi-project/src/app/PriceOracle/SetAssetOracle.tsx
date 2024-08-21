import React, { useState } from 'react';
import { publicClient, walletClient } from '../../client';
import { contract } from './PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetAssetOracle = () => {
    const [asset, setAsset] = useState<string>('');
    const [oracle, setOracle] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!asset || !oracle) {
            alert('Please provide both asset and oracle addresses.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setAssetOracle',
                args: [asset, oracle],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setAssetOracle:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Set Asset Oracle</h2>
            <form onSubmit={submit}>
                <label htmlFor='asset'>Asset Address</label>
                <input 
                    type='text' 
                    name='asset' 
                    value={asset} 
                    onChange={(e) => setAsset(e.target.value)} 
                />
                <label htmlFor='oracle'>Oracle Address</label>
                <input 
                    type='text' 
                    name='oracle' 
                    value={oracle} 
                    onChange={(e) => setOracle(e.target.value)} 
                />
                <button type='submit'>Set Oracle</button>
            </form>
        </div>
    );
}

export default SetAssetOracle;
