import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const Login = () => {
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const connectToBlockchain = async () => {
    // ... (connect to Web3 and contract as before)
  };

  const handleLogin = async (event) => {
    // ... (handle login as before)
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          width: '300px',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#333' }}>Login</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Account Address:
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              style={{
                width: '100%',
                padding: '5px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '5px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
          </label>
          <button
            type="button"
            onClick={connectToBlockchain}
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Connect to Web3
          </button>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;