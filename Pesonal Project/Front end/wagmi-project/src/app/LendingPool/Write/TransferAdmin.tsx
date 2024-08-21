import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LendingPoolAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const TransferAdmin = () => {
  const [newAdminAddress, setNewAdminAddress] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newAdminAddress) {
      alert('Please provide a new admin address.');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address, 
        functionName: 'transferAdmin',
        args: [newAdminAddress],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Error calling transferAdmin:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Transfer Admin</h2>
      <form onSubmit={submit}>
        <label htmlFor='newAdminAddress'>New Admin Address</label>
        <input
          type='text'
          name='newAdminAddress'
          value={newAdminAddress}
          onChange={(e) => setNewAdminAddress(e.target.value)}
        />
        <button type='submit'>Transfer Admin</button>
      </form>
    </div>
  );
};

export default TransferAdmin;
