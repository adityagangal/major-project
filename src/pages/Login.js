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
  const [userType, setUserType] = useState('student'); // Default login as student
  const [error, setError] = useState('');

  const connectToBlockchain = async () => {
    try {
      if (window.ethereum) {
        // Request account access from the user
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Get the currently selected Ethereum account
        const accounts = await web3Instance.eth.getAccounts();
        const selectedAccount = accounts[0]; // Assuming the first account is the selected one
        setAccount(selectedAccount);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = CreditTransferContract.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          CreditTransferContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contractInstance);
      } else {
        throw new Error('Web3 provider not detected');
      }
    } catch (error) {
      console.error('Error connecting to Web3:', error);
      setError(error.message);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Determine the login method based on the selected userType
      let isLoggedin = false;
      if (userType === 'student') {
        isLoggedin = await contract.methods.studentLogin(account, password).call();
      } else if (userType === 'institute') {
        isLoggedin = await contract.methods.instituteLogin(account, password).call();
      }

      if (isLoggedin) {
        // Redirect to the appropriate dashboard based on userType
        if (userType === 'student') {
          navigate(`/studentDashboard/${account}`);
        } else if (userType === 'institute') {
          navigate(`/instituteDashboard/${account}`);
        }
      } else {
        throw new Error('Invalid account address or password');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const buttonStyle = {
    width: '100%',
    padding: '5px',
    marginTop: '5px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f5f5f5' }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Login</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Account Address:
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              style={{ width: '100%', padding: '5px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '5px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Login as:
            <select value={userType} onChange={(e) => setUserType(e.target.value)} style={{ width: '100%', padding: '5px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <option value="student">Student</option>
              <option value="institute">Institute</option>
            </select>
          </label>
          <button type="button" onClick={connectToBlockchain} style={buttonStyle}>
            Connect to Web3
          </button>
          <button type="submit" style={buttonStyle}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
