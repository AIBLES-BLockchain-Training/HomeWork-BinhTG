import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; // Thay thế 'YourContractAbi' bằng tên tệp ABI của bạn
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetCurrentVariableBorrowRate = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [borrowRate, setBorrowRate] = useState<string | null>(null); 
    const [error, setError] = useState<string | null>(null); 

    const fetchBorrowRate = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getCurrentVariableBorrowRate',
                args: [tokenAddress as Address],
            });

            const rate: bigint = result as bigint;
            setBorrowRate(rate.toString()); 
            setError(null); 
        } catch (error) {
            console.error('Error fetching borrow rate:', error);
            setError('Failed to fetch data'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Current Variable Borrow Rate</h2>
            <div className="input-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                    id="tokenAddress"
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchBorrowRate}>Get Borrow Rate</button>
            {error && <p className="error">{error}</p>}
            <div className="contract-info">
                <h6>Borrow Rate: {borrowRate !== null ? borrowRate : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetCurrentVariableBorrowRate;
