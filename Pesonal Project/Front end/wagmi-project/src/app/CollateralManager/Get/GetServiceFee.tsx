import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi'; 
import { Address } from 'viem';
import '../Function.css';

const GetServiceFee = () => {
    const [serviceFee, setServiceFee] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); 

    const getServiceFee = async () => {
        try {
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'serviceFee',
            });

            const fee = (result as bigint).toString(); 
            setServiceFee(fee);
            setError(null); 
        } catch (error) {
            console.error('Error fetching service fee:', error);
            setError('Failed to fetch service fee'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Get Service Fee</h2>
            <button type='button' onClick={getServiceFee}>Get Fee</button>
            {error && <p className="error">{error}</p>} {}
            <div className="fee">
                <h6>Service Fee: {serviceFee !== null ? serviceFee : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetServiceFee;
