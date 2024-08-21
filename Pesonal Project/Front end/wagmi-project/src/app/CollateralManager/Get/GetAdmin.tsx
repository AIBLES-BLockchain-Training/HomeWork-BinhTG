import React, { useEffect, useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../CollateralManagerAbi'; 
import { Address } from 'viem';
import '../Function.css'; 

const GetAdmin = () => {
    const [admin, setAdmin] = useState<string | null>(null);

    const getAdmin = async () => {
        try {
            const adminResult = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'admin',
                args: [],
            });
            setAdmin(adminResult as string);
        } catch (error) {
            console.error('Error fetching admin:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get Admin</h2>
            <button type='button' onClick={getAdmin} className="fetch-button">Get Admin</button>
            <div className="admin-info">
                <h6>Admin: {admin ? admin : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAdmin;
