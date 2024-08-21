// App.tsx
import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import './connect.css'; 

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="app-container">
      <div className="account-section">
        <h2>Account</h2>
        <div className="account-info">
          <p>Status: {account.status}</p>
          <p>Addresses: {JSON.stringify(account.addresses)}</p>
          <p>ChainId: {account.chainId}</p>
        </div>
        {account.status === 'connected' && (
          <button className="disconnect-button" type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div className="connect-section">
        <h2>Connect</h2>
        <div className="connect-buttons">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              className="connect-button"
              onClick={() => connect({ connector })}
              type="button"
            >
              {connector.name}
            </button>
          ))}
        </div>
        <div className="status-info">
          <p>Status: {status}</p>
          <p>Error: {error?.message}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
