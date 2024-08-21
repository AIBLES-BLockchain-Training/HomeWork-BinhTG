import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../BorrowerAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css';

const SetRiskParameters = () => {
    const [token, setToken] = useState<string>('');
    const [ltv, setLtv] = useState<string>('');
    const [liquidationThreshold, setLiquidationThreshold] = useState<string>('');
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token || !ltv || !liquidationThreshold) {
            alert('Please provide all risk parameters.');
            return;
        }

        const ltvValue = BigInt(ltv);
        const liquidationThresholdValue = BigInt(liquidationThreshold);

        if (ltvValue < 0 || liquidationThresholdValue < 0) {
            alert('Please provide valid risk parameters.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setRiskParameters',
                args: [
                    token as Address,
                    ltvValue,
                    liquidationThresholdValue
                ],
                account: account.address as Address,
            });

            // Ghi hợp đồng và lấy hash giao dịch
            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
        } catch (error) {
            console.error('Error calling setRiskParameters:', error);
        }
    }

    return (
        <div className="form-container">
            <h2>Set Risk Parameters</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="token">Token Address:</label>
                    <input 
                        type="text" 
                        id="token" 
                        name="token" 
                        value={token} 
                        onChange={(e) => setToken(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="ltv">Loan-to-Value (LTV):</label>
                    <input 
                        type="number" 
                        id="ltv" 
                        name="ltv" 
                        value={ltv} 
                        onChange={(e) => setLtv(e.target.value)} 
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="liquidationThreshold">Liquidation Threshold:</label>
                    <input 
                        type="number" 
                        id="liquidationThreshold" 
                        name="liquidationThreshold" 
                        value={liquidationThreshold} 
                        onChange={(e) => setLiquidationThreshold(e.target.value)} 
                    />
                </div>
                <button type="submit" className="submit-button">Set Risk Parameters</button>
            </form>
        </div>
    );
}

export default SetRiskParameters;
