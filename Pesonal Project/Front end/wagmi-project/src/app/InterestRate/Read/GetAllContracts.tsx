import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../InterestRateAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetAllContracts = () => {
    const [borrower, setBorrower] = useState<string | null>(null);
    const [lendingPool, setLendingPool] = useState<string | null>(null);
    const [priceOracle, setPriceOracle] = useState<string | null>(null);

    const getAllContracts = async () => {
        try {
            const [borrowerAddress, lendingPoolAddress] = await Promise.all([
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'borrower',
                }),
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'lendingPool',
                }),
            ]);

            setBorrower(borrowerAddress as string);
            setLendingPool(lendingPoolAddress as string);
        } catch (error) {
            console.error('Error fetching contract addresses:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get All Contract Addresses</h2>
            <button type='button' onClick={getAllContracts}>Get Addresses</button>
            <div className="contract-info">
                <h6>Borrower: {borrower ? borrower : 'N/A'}</h6>
                <h6>Lending Pool: {lendingPool ? lendingPool : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAllContracts;
