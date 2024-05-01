import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const Login = () => {
  const navigate = useNavigate(); // Hook to navigate to different pages
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const connectToBlockchain = async () => {
    try {
      // Connect to MetaMask or other Web3 provider
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = CreditTransferContract.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          CreditTransferContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contractInstance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
      } else {
        throw new Error('Web3 provider not detected');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!web3 || !contract) {
      setError('Please connect to Web3 provider first');
      return;
    }

    try {
      const isStudent = await contract.methods.studentLogin(account, password).call();
      const isInstitute = await contract.methods.instituteLogin(account, password).call();

      if (isStudent || isInstitute) {
        // Redirect to dashboard upon successful login
        const studentAddress = account;
        navigate(`/dashboard/${studentAddress}`);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Error logging in: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <label>
          Account Address:
          <input
            type="text"
            value={account}
            readOnly
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <button type="button" onClick={connectToBlockchain}>
          Connect to Web3
        </button>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
