import React, { useState } from 'react';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const Register = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [abcId, setAbcId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');

  const handleRegistration = async (event) => {
    event.preventDefault();

    try {
      // Connect to MetaMask or other Web3 provider
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = CreditTransferContract.networks[networkId];
        const contract = new web3Instance.eth.Contract(
          CreditTransferContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        const accounts = await web3Instance.eth.getAccounts();
        const account = accounts[0]; // Assuming first account is used for registration

        // Call the appropriate registration function based on the selected role
        if (role === 'student') {
          await contract.methods.setStudentDetails(account, name, parseInt(age), email, abcId, password).send({ from: account });
        } else if (role === 'institute') {
          await contract.methods.setInstituteDetails(account, name, 'Location', password).send({ from: account });
        }

        // Registration successful
        console.log('Registration successful');
      } else {
        throw new Error('Web3 provider not detected');
      }
    } catch (error) {
      setError('Error registering: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Registration</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegistration}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Age:
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          ABC ID:
          <input type="text" value={abcId} onChange={(e) => setAbcId(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="student">Student</option>
            <option value="institute">Institute</option>
          </select>
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
