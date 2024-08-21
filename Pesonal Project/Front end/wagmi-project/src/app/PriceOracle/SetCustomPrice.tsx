import React, { useState } from 'react';
import { publicClient, walletClient } from '../../client';
import { contract } from './PriceOracleAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetCustomPrice = () => {
    const [asset, setAsset] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!asset || !price) {
            alert('Please provide both asset address and price.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setCustomPrice',
                args: [asset, BigInt(price)],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setCustomPrice:', error);
        }
    }

    return (
        <div className="form-container"> {}
            <h2>Set Custom Price</h2>
            <form onSubmit={submit}>
                <label htmlFor='asset'>Asset Address</label>
                <input 
                    type='text' 
                    name='asset' 
                    value={asset} 
                    onChange={(e) => setAsset(e.target.value)} 
                />
                <label htmlFor='price'>Price (in wei)</label>
                <input 
                    type='number' 
                    name='price' 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                />
                <button type='submit'>Set Price</button>
            </form>
        </div>
    );
}

export default SetCustomPrice;
