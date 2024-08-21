import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetLoanDetails = () => {
    const [loanId, setLoanId] = useState<string>(''); 
    const [loanDetails, setLoanDetails] = useState<{
        loanId: string;
        borrower: string;
        tokenAddress: string;
        tokenAmount: string;
        variableBorrowIndex: string;
    } | null>(null); 
    const [error, setError] = useState<string | null>(null); 
    const fetchLoanDetails = async () => {
        if (!loanId) {
            setError('Please enter a loan ID.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'loans',
                args: [parseInt(loanId, 10)],
            });

            const [loanIdValue, borrower, tokenAddress, tokenAmount, variableBorrowIndex] = result as [bigint, Address, Address, bigint, bigint];
            setLoanDetails({
                loanId: loanIdValue.toString(),
                borrower: borrower as string,
                tokenAddress: tokenAddress as string,
                tokenAmount: tokenAmount.toString(),
                variableBorrowIndex: variableBorrowIndex.toString(),
            });
            setError(null); 
        } catch (error) {
            console.error('Error fetching loan details:', error);
            setError('Failed to fetch data'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Loan Details</h2>
            <div className="input-group">
                <label htmlFor="loanId">Loan ID:</label>
                <input
                    id="loanId"
                    type="number"
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchLoanDetails}>Get Loan Details</button>
            {error && <p className="error">{error}</p>} {}
            {loanDetails && (
                <div className="contract-info">
                    <h6>Loan ID: {loanDetails.loanId}</h6>
                    <h6>Borrower: {loanDetails.borrower}</h6>
                    <h6>Token Address: {loanDetails.tokenAddress}</h6>
                    <h6>Token Amount: {loanDetails.tokenAmount}</h6>
                    <h6>Variable Borrow Index: {loanDetails.variableBorrowIndex}</h6>
                </div>
            )}
        </div>
    );
};

export default GetLoanDetails;
