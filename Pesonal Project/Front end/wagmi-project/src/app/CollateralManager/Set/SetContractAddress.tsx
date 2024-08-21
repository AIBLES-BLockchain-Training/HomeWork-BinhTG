import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../Function.css'; 

const SetContractAddresses = () => {
    const [priceOracle, setPriceOracle] = useState<string>('');
    const [borrower, setBorrower] = useState<string>('');
    const [lendingPool, setLendingPool] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!priceOracle || !borrower || !lendingPool) {
            alert('Please provide all contract addresses.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setContractAddresses',
                args: [priceOracle as Address, borrower as Address, lendingPool as Address],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setContractAddresses:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Set Contract Addresses</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="priceOracle">Price Oracle Address</label>
                    <input 
                        type="text" 
                        id="priceOracle" 
                        name="priceOracle" 
                        value={priceOracle} 
                        onChange={(e) => setPriceOracle(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="borrower">Borrower Address</label>
                    <input 
                        type="text" 
                        id="borrower" 
                        name="borrower" 
                        value={borrower} 
                        onChange={(e) => setBorrower(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="lendingPool">Lending Pool Address</label>
                    <input 
                        type="text" 
                        id="lendingPool" 
                        name="lendingPool" 
                        value={lendingPool} 
                        onChange={(e) => setLendingPool(e.target.value)} 
                    />
                </div>
                <button type="submit" className="submit-button">Set Addresses</button>
            </form>
        </div>
    );
}

export default SetContractAddresses;
