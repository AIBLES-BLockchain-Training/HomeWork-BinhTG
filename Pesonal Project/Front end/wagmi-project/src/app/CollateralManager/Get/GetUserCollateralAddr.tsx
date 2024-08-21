import React, { useState } from 'react';
import { publicClient } from '../../../client';
import { contract } from '../CollateralManagerAbi';
import { Address } from 'viem';
import '../Function.css';

const GetUserCollateralAddresses = () => {
  const [collateralAddresses, setCollateralAddresses] = useState<string[]>([]);
  const [userAddress, setUserAddress] = useState<string>('');

  const getAllUserCollaterals = async () => {
    if (!userAddress) {
      alert('Please enter a user address.');
      return;
    }

    try {
      const result = await publicClient.readContract({
        abi: contract.abi,
        address: contract.address as Address, 
        functionName: 'getUserCollateralAddresses',
        args: [userAddress as Address],
      });

      const addresses = result as string[];
      
      setCollateralAddresses(addresses);
    } catch (error) {
      console.error('Error fetching collateral addresses:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Get User Collateral Addresses</h2>
      <div className="form-group">
        <label htmlFor="userAddress">User Address:</label>
        <input
          type="text"
          id="userAddress"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
      </div>
      <button type='button' onClick={getAllUserCollaterals}>Get Collateral Addresses</button>
      <div className="collateral-info">
        {collateralAddresses.length > 0 ? (
          collateralAddresses.map((address, index) => (
            <div key={index} className="collateral-info-item">
              <h6>Collateral {index + 1}: {address}</h6>
            </div>
          ))
        ) : (
          <p>.</p>
        )}
      </div>
    </div>
  );
};

export default GetUserCollateralAddresses;
