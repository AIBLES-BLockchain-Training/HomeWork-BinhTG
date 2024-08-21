import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const RepayLoan = () => {
    const [loanId, setLoanId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [ethValue, setEthValue] = useState<string>(''); 
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!loanId || !amount || !ethValue) {
            alert('Please provide loan ID, amount, and ETH value.');
            return;
        }

        const repayAmount = BigInt(amount); 
        const ethAmount = BigInt(parseFloat(ethValue) * 1e18); 

        if (repayAmount <= 0) {
            alert('Please provide a valid amount.');
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
                functionName: 'repayLoan',
                args: [parseInt(loanId, 10), repayAmount],
                value: ethAmount, 
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling repayLoan:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Repay Loan</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="loanId">Loan ID</label>
                    <input 
                        type="number" 
                        id="loanId" 
                        name="loanId" 
                        value={loanId} 
                        onChange={(e) => setLoanId(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="amount">Token Amount </label>
                    <input 
                        type="number" 
                        id="amount" 
                        name="amount" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
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
                <button type="submit" className="submit-button">Repay</button>
            </form>
        </div>
    );
}

export default RepayLoan;
