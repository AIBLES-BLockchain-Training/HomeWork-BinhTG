import React from 'react';
import App from '../connect';

import SetServiceFee from './Write/SetServiceFee';
import SetContractAddresses from './Write/SetContractAddr';
import SetRiskParameters from './Write/SetRiskParameter';
import CreateLoan from './Write/CreateLoan';
import RepayLoan from './Write/RepayLoan';
import TransferAdmin from './Write/TransferAdmin';

import GetAdmin from './Read/GetAdmin';
import GetServiceFee from './Read/GetServiceFee';
import GetAllContracts from './Read/GetAllContract';
import GetRiskParameters from './Read/GetRiskParameter';
import GetLoanDetails from './Read/GetLoanDetails';
import GetUserLoanIds from './Read/GetUserLoanIds';
import GetCurrentVariableBorrowRate from './Read/GetCurrentVariableBorrowRate';
import CheckHealthFactor from './Read/CheckHealthFactor';
import CalculateTotalRepayment from './Read/CalculateTotalRepayment';


const Borrower = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
        <SetServiceFee/>
        <SetContractAddresses/>
        <SetRiskParameters/>
      </div>
      <div className="column2">
        <TransferAdmin/>
        <CreateLoan/>
        <RepayLoan/>
      </div>
      <div className="column3">
        <GetAdmin/>
        <GetServiceFee/>
        <GetAllContracts/>
        <GetRiskParameters/>
      </div>
      <div className="column4">
        <GetUserLoanIds/>
        <GetLoanDetails/>
        <CheckHealthFactor/>
        <CalculateTotalRepayment/>
        <GetCurrentVariableBorrowRate/>
      </div>
    </div>
  </div>
  );
}

export default Borrower;
