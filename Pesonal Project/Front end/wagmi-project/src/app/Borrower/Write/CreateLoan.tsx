import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const CreateLoan = () => {
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [tokenAmount, setTokenAmount] = useState<string>('');
    const [collateralAddresses, setCollateralAddresses] = useState<string[]>([]);
    const [ethValue, setEthValue] = useState<string>(''); 
    const account = useAccount();

    const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const addresses = value.split(',').map(addr => addr.trim()).filter(addr => addr);
        setCollateralAddresses(addresses);
    };

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tokenAddress || !tokenAmount || !collateralAddresses.length || !ethValue) {
            alert('Please provide token address, token amount, collateral addresses, and ETH value.');
            return;
        }

        const amount = parseInt(tokenAmount, 10);
        const ethAmount = BigInt(parseFloat(ethValue) * 1e18); 

        if (isNaN(amount) || amount <= 0) {
            alert('Please provide a valid token amount.');
            return;
        }

        if (ethAmount <= 0) {
            alert('Please provide a valid ETH value.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'createLoan',
                args: [tokenAddress as Address, amount, collateralAddresses as Address[]],
                value: ethAmount, 
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling createLoan:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Create Loan</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="tokenAddress">Token Address</label>
                    <input 
                        type="text" 
                        id="tokenAddress" 
                        name="tokenAddress" 
                        value={tokenAddress} 
                        onChange={(e) => setTokenAddress(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="tokenAmount">Token Amount (in wei)</label>
                    <input 
                        type="number" 
                        id="tokenAmount" 
                        name="tokenAmount" 
                        value={tokenAmount} 
                        onChange={(e) => setTokenAmount(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="collateralAddresses">Collateral Addresses (comma separated)</label>
                    <input 
                        type="text" 
                        id="collateralAddresses" 
                        name="collateralAddresses" 
                        value={collateralAddresses.join(', ')} 
                        onChange={handleCollateralChange} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="ethValue">ETH Value (in ETH)</label>
                    <input 
                        type="number" 
                        id="ethValue" 
                        name="ethValue" 
                        step="0.01" 
                        value={ethValue} 
                        onChange={(e) => setEthValue(e.target.value)} 
                    />
                </div>
                <button type="submit" className="submit-button">Create Loan</button>
            </form>
        </div>
    );
}

export default CreateLoan;
