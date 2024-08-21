import React from 'react';
import SetAllowedToken from './Set/SetAllowedToken';
import SetContractAddress from './Set/SetContractAddress';
import SetServiceFee from './Set/SetServiceFee';
import AddCollateral from './Set/AddCollateral';
import TransferAdmin from './Set/TransferAdmin';
import RemoveCollateral from './Set/RemoveCollateral';
import GetAdmin from './Get/GetAdmin';
import GetAllContracts from './Get/GetAllContract';
import GetAllowedTokens from './Get/GetAllowedToken';
import GetUserCollateralAddresses from './Get/GetUserCollateralAddr';
import GetServiceFee from './Get/GetServiceFee';
import GetUserCollateral from './Get/GetUserCollateral';
import GetCollateralValue from './Get/GetCollateralValue';

import App from '../connect';

const CollateralManager = () => {
  return (
    <div className="main-container">
      <App />
      <div className="grid-container">
        <div className="column1">
          <TransferAdmin/>
          <SetAllowedToken />
          <SetContractAddress />
        </div>
        <div className="column2">
          <SetServiceFee />
          <AddCollateral />
          <RemoveCollateral />
        </div>
        <div className="column3">
          <GetAdmin />
          <GetServiceFee />     
          <GetAllContracts />
          <GetUserCollateralAddresses />
        </div>
        <div className="column4">
          <GetAllowedTokens />
          <GetUserCollateral />
          <GetCollateralValue />
        </div>
      </div>
    </div>
  );
}

export default CollateralManager;
