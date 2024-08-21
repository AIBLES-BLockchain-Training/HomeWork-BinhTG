import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../InterestRateAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css';

const SetInterestRateParams = () => {
    const [tokenAddress, setTokenAddress] = useState<string>(''); 
    const [slope1, setSlope1] = useState<string>(''); 
    const [slope2, setSlope2] = useState<string>(''); 
    const [baseRate, setBaseRate] = useState<string>(''); 
    const [utilizationOptimal, setUtilizationOptimal] = useState<string>(''); 
    const [error, setError] = useState<string | null>(null); 
    const account = useAccount();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tokenAddress || !slope1 || !slope2 || !baseRate || !utilizationOptimal) {
            setError('Please provide all required parameters.');
            return;
        }

        const slope1Value = BigInt(slope1);
        const slope2Value = BigInt(slope2);
        const baseRateValue = BigInt(baseRate);
        const utilizationOptimalValue = BigInt(utilizationOptimal);

        if (slope1Value < 0 || slope2Value < 0 || baseRateValue < 0 || utilizationOptimalValue < 0) {
            setError('Please provide valid parameters.');
            return;
        }

        try {
            const { request } = await publicClient.simulateContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'setInterestRateParams',
                args: [
                    tokenAddress as Address,
                    slope1Value,
                    slope2Value,
                    baseRateValue,
                    utilizationOptimalValue,
                ],
                account: account.address as Address,
            });

            const hash = await walletClient.writeContract(request);
            console.log('Transaction hash:', hash);
            setError(null); 
        } catch (error) {
            console.error('Error calling setInterestRateParams:', error);
            setError('Failed to set interest rate parameters.'); 
        }
    }

    return (
        <div className="form-container">
            <h2>Set Interest Rate Parameters</h2>
            <form onSubmit={submit}>
                <div className="input-container">
                    <label htmlFor="tokenAddress">Token Address:</label>
                    <input 
                        type="text" 
                        id="tokenAddress" 
                        name="tokenAddress" 
                        value={tokenAddress} 
                        onChange={(e) => setTokenAddress(e.target.value)} 
                        //placeholder="Enter token address"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="slope1">Slope 1:</label>
                    <input 
                        type="number" 
                        id="slope1" 
                        name="slope1" 
                        value={slope1} 
                        onChange={(e) => setSlope1(e.target.value)} 
                        //placeholder="Enter slope 1"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="slope2">Slope 2:</label>
                    <input 
                        type="number" 
                        id="slope2" 
                        name="slope2" 
                        value={slope2} 
                        onChange={(e) => setSlope2(e.target.value)} 
                        //placeholder="Enter slope 2"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="baseRate">Base Rate:</label>
                    <input 
                        type="number" 
                        id="baseRate" 
                        name="baseRate" 
                        value={baseRate} 
                        onChange={(e) => setBaseRate(e.target.value)} 
                        //placeholder="Enter base rate"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="utilizationOptimal">Utilization Optimal:</label>
                    <input 
                        type="number" 
                        id="utilizationOptimal" 
                        name="utilizationOptimal" 
                        value={utilizationOptimal} 
                        onChange={(e) => setUtilizationOptimal(e.target.value)} 
                        //placeholder="Enter utilization optimal"
                    />
                </div>
                <button type="submit" className="submit-button">Set Interest Rate Parameters</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default SetInterestRateParams;
