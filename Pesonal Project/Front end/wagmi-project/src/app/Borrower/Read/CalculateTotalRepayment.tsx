import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const CalculateTotalRepayment = () => {
    const [loanId, setLoanId] = useState<number | ''>(''); 
    const [totalRepayment, setTotalRepayment] = useState<{ amount: number, interest: number } | null>(null); 
    const [error, setError] = useState<string | null>(null); 

    const fetchTotalRepayment = async () => {
        if (loanId === '') {
            setError('Please enter a loan ID.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'calculateTotalRepayment',
                args: [loanId],
            });

            if (Array.isArray(result) && result.length === 2) {
                const [amount, interest] = result as [bigint, bigint];
                setTotalRepayment({
                    amount: Number(amount),
                    interest: Number(interest),
                });
                setError(null); 
            } else {
                console.error('Unexpected result format:', result);
                setError('Unexpected result format'); 
            }
        } catch (error) {
            console.error('Error fetching total repayment:', error);
            setError('Failed to fetch data'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Calculate Total Repayment</h2>
            <div className="input-group">
                <label htmlFor="loanId">Loan ID:</label>
                <input
                    id="loanId"
                    type="number"
                    value={loanId}
                    onChange={(e) => setLoanId(Number(e.target.value))}
                />
            </div>
            <button type='button' onClick={fetchTotalRepayment}>Calculate Repayment</button>
            {error && <p className="error">{error}</p>}
            <div className="contract-info">
                {totalRepayment ? (
                    <>
                        <h6>Total Repayment: {totalRepayment.amount}</h6>
                        <h6>Current Variable Borrow Index : {totalRepayment.interest}</h6>
                    </>
                ) : (
                    <p></p>
                )}
            </div>
        </div>
    );
};

export default CalculateTotalRepayment;
