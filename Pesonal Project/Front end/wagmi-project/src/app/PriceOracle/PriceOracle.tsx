// src/components/MainContainer.tsx

import React from 'react';
import GetAdmin from './GetAdmin';
import GetAssetOracle from './GetAssetOracle';
import GetCustomPrice from './GetCustomPrice';
import GetAssetPrice from './GetAssetPrice';
import SetAssetOracle from './SetAssetOracle';
import SetCustomPrice from './SetCustomPrice';
import ResetAssetOracle from './ResetAssetOracle';
import TransferAdmin from './TransferAdmin';

import App from '../connect';

const PriceOracle = () => {
  return (
    <div className="main-container">
    <App />
    <div className="grid-container">
      <div className="column1">
        <SetAssetOracle />
        <SetCustomPrice />
      </div>
      <div className="column2">
        <ResetAssetOracle />
        <TransferAdmin/>
      </div>
      <div className="column3">
        <GetAdmin />
        <GetAssetOracle />
      </div>
      <div className="column4">
        <GetCustomPrice />
        <GetAssetPrice />
      </div>
    </div>
  </div>
  );
}

export default PriceOracle;
