import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetUserLoanIds = () => {
    const [userAddress, setUserAddress] = useState<string>(''); 
    const [loanIds, setLoanIds] = useState<number[]>([]); 
    const [error, setError] = useState<string | null>(null); 

    const fetchLoanIds = async () => {
        if (!userAddress) {
            setError('Please enter a user address.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getUserLoanIds',
                args: [userAddress as Address],
            });

            if (Array.isArray(result)) {
                const ids: number[] = result.map(id => Number(id));
                setLoanIds(ids);
                setError(null); 
            } else {
                console.error('Unexpected result format:', result);
                setError('Unexpected result format'); 
            }
        } catch (error) {
            console.error('Error fetching loan IDs:', error);
            setError('Failed to fetch data'); 
        }
    }

    const loanIdsString = loanIds.length > 0 ? loanIds.join(', ') : 'N/A';

    return (
        <div className="form-container">
            <h2>Get User Loan IDs</h2>
            <div className="input-group">
                <label htmlFor="userAddress">User Address:</label>
                <input
                    id="userAddress"
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchLoanIds}>Get Loan IDs</button>
            {error && <p className="error">{error}</p>}
            <div className="contract-info">
                <h6>Loan IDs: {loanIdsString}</h6>
            </div>
        </div>
    );
};

export default GetUserLoanIds;
