import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const WithdrawServiceFee = () => {
    const [amount, setAmount] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!amount) {
            alert('Please provide an amount to withdraw.');
            return;
        }

        const withdrawalAmount = BigInt(amount);

        if (withdrawalAmount <= 0) {
            alert('Please provide a valid amount.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'withdrawServiceFee',
                args: [withdrawalAmount],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling withdrawServiceFee:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Withdraw Service Fee</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="amount">Amount (in wei)</label>
                    <input 
                        type="number" 
                        id="amount" 
                        name="amount" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                    />
                </div>
                <button type="submit" className="submit-button">Withdraw Fee</button>
            </form>
        </div>
    );
}

export default WithdrawServiceFee;
