import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../BorrowerAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetAllContracts = () => {
    const [priceOracle, setPriceOracle] = useState<string | null>(null);
    const [collateralManager, setCollateralManager] = useState<string | null>(null);
    const [lendingPool, setlendingPool] = useState<string | null>(null);
    const [interestRate, setInterestRate] = useState<string | null>(null);

    const getAllContracts = async () => {
        try {
            const [priceOracleAddress, collateralManagerAddress, lendingPoolAddress, interestRateAddress] = await Promise.all([
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'priceOracle',
                }),
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'collateralManager',
                }),
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'lendingPool',
                }),
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'interestRate',
                }),
            ]);

            setPriceOracle(priceOracleAddress as string);
            setCollateralManager(collateralManagerAddress as string);
            setlendingPool(lendingPoolAddress as string);
            setInterestRate(interestRateAddress as string);
        } catch (error) {
            console.error('Error fetching contract addresses:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Get All Contract Addresses</h2>
            <button type='button' onClick={getAllContracts}>Get Addresses</button>
            <div className="contract-info">
                <h6>Price Oracle: {priceOracle ? priceOracle : 'N/A'}</h6>
                <h6>Collateral Manager: {collateralManager ? collateralManager : 'N/A'}</h6>
                <h6>Borrower: {lendingPool ? lendingPool : 'N/A'}</h6>
                <h6>Interest Rate: {interestRate ? interestRate : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetAllContracts;
