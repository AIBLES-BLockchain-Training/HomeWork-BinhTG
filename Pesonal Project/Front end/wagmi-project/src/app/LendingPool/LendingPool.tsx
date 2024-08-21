import React from 'react';
import App from '../connect';

import SetContractAddresses from './Write/SetContractAddr';
import SetServiceFee from './Write/SetServiceFee';
import WithdrawServiceFee from './Write/WithDrawSF';
import Withdraw from './Write/WithDraw';
import TransferAdmin from './Write/TransferAdmin';
import DepositAsset from './Write/Deposit';
import GetAdmin from './Read/GetAdmin';
import GetAllContracts from './Read/GetAllContract';
import GetAllowedTokens from './Read/GetAllowedToken';
import GetServiceFee from './Read/GetServiceFee';
import GetServiceFeeBalance from './Read/GetSFBalance';
import GetBorrowedAndSupplied from './Read/GetBorrowedAndSupplied';
import GetLenderAssets from './Read/GetLenderAsset';
import GetDepositAPY from './Read/GetDepositAPY';
import GetTotalBalance1 from './Read/GetUserBalance';
import GetCurrentUtilizationRate from './Read/GetCurrentUR';
import GetAssetBalances from './Read/GetAssetBalance';

const LendingPool = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
        <SetServiceFee/>
        <WithdrawServiceFee/>        
        <SetContractAddresses/>
        <DepositAsset/>
        <Withdraw/>
      </div>
      <div className="column2">
       <TransferAdmin/>
       <GetAdmin/>
       <GetAllowedTokens/>
       <GetAllContracts/>
       <GetServiceFee/>
       <GetServiceFeeBalance/>

      </div>
      <div className="column3">
       <GetLenderAssets/>
       <GetTotalBalance1/>
       <GetAssetBalances/>
      </div>
      <div className="column4">
        <GetBorrowedAndSupplied/>
        <GetDepositAPY/>
        <GetCurrentUtilizationRate/>
        
      </div>
    </div>
  </div>
  );
}

export default LendingPool;
