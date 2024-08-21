import React from 'react';
import App from '../connect';
import SetContractAddresses from './Write/SetContractAddr';
import TransferAdmin from './Write/TransferAdmin';
import InitializeReserve from './Write/InitializeReserve';
import SetInterestRateParams from './Write/SetInterestRateParams';

import GetAdmin from './Read/GetAdmin';
import GetAllContracts from './Read/GetAllContracts';
import CalculateBorrowAPR from './Read/BorrowAPR';
import CalculateBorrowAPY from './Read/BorrowAPY';
import CalculateDepositAPY from './Read/DepositAPY';
import GetInterestParams from './Read/GetInterestParameters';
import GetReserves from './Read/GetReserves';

const InterestRate = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
        <TransferAdmin/>
        <SetContractAddresses/>
        <InitializeReserve/>
      </div>
      <div className="column2">
        <SetInterestRateParams/>

      </div>
      <div className="column3">
        <GetAdmin/>
        <GetAllContracts/>
        <GetInterestParams/>
        <GetReserves/>
      </div>
      <div className="column4">
        <CalculateBorrowAPR/>
        <CalculateBorrowAPY/>
        <CalculateDepositAPY/>

      </div>
    </div>
  </div>
  );
}

export default InterestRate;
