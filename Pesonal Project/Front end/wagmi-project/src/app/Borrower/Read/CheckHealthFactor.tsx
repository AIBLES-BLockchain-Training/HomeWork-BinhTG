import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const CheckHealthFactor = () => {
    const [loanId, setLoanId] = useState<number | string>(''); 
    const [healthFactor, setHealthFactor] = useState<string | null>(null); 
    const [error, setError] = useState<string | null>(null); 

    const fetchHealthFactor = async () => {
        if (!loanId) {
            setError('Please enter a loan ID.');
            return;
        }

        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'checkHealthFactor',
                args: [BigInt(loanId)], 
            });

            const factor: bigint = result as bigint;
            setHealthFactor(factor.toString()); 
            setError(null); 
        } catch (error) {
            console.error('Error fetching health factor:', error);
            setError('Failed to fetch data'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Check Health Factor</h2>
            <div className="input-group">
                <label htmlFor="loanId">Loan ID:</label>
                <input
                    id="loanId"
                    type="number"
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                />
            </div>
            <button type='button' onClick={fetchHealthFactor}>Get Health Factor</button>
            {error && <p className="error">{error}</p>}
            <div className="contract-info">
                <h6>Health Factor: {healthFactor !== null ? healthFactor : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default CheckHealthFactor;
