/* eslint no-undef: "off" */
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
  const [instituteName, setInstituteName] = useState('');
  const [instituteLocation, setInstituteLocation] = useState('');

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
          await contract.methods.setInstituteDetails(account, instituteName, instituteLocation, password).send({ from: account });
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
      {role === 'student' ? (
        <div className="registration-form-container">
          <h2 className="registration-form-title">Registration</h2>
          {error && <p className="registration-form-error">{error}</p>}
          <form onSubmit={handleRegistration} className="registration-form">
            <label className="registration-form-label">
              Name:
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              Age:
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              ABC ID:
              <input type="text" value={abcId} onChange={(e) => setAbcId(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              Password:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              Role:
              <select value={role} onChange={(e) => setRole(e.target.value)} required className="registration-form-select">
                <option value="student">Student</option>
                <option value="institute">Institute</option>
              </select>
            </label>
            <button type="submit" className="registration-form-button">
              Register
            </button>
          </form>
          <style jsx>{`
            .registration-form-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-top: 5rem;
            }

            .registration-form-title {
              font-size: 2.5rem;
              font-weight: bold;
              color: #3f3f3f;
              margin-bottom: 3rem;
            }

            .registration-form {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 30rem;
            }

            .registration-form-label {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              margin-bottom: 1rem;
              font-size: 1.2rem;
              color: #3f3f3f;
            }

            .registration-form-input {
              padding: 0.5rem;
              font-size: 1.1rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              outline: none;
              width: 100%;
            }

            .registration-form-select {
              padding: 0.5rem;
              font-size: 1.1rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              outline: none;
              width: 100%;
            }

            .registration-form-button {
              padding: 0.5rem 2rem;
              font-size: 1.2rem;
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 1rem;
            }

            .registration-form-button:hover {
              background-color: #45a049;
            }

            .registration-form-error {
              color: red;
              font-size: 1.1rem;
              margin-top: 1rem;
            }
          `}</style>
        </div>
      ) : (
        <div className="registration-form-container">
          <h2 className="registration-form-title">Institute Registration</h2>
          {error && <p className="registration-form-error">{error}</p>}
          <form onSubmit={handleRegistration} className="registration-form">
            <label className="registration-form-label">
              Name:
              <input type="text" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              Location:
              <input type="text" value={instituteLocation} onChange={(e) => setInstituteLocation(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              Password:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="registration-form-input" />
            </label>
            <label className="registration-form-label">
              Role:
              <select value={role} onChange={(e) => setRole(e.target.value)} required className="registration-form-select">
                <option value="student">Student</option>
                <option value="institute">Institute</option>
              </select>
            </label>
            <button type="submit" className="registration-form-button">
              Register
            </button>
          </form>
          <style jsx>{`
            .registration-form-container {
              display: flex;
              flex-direction: column;
             align-items: center;
              margin-top: 5rem;
            }

            .registration-form-title {
              font-size: 2.5rem;
              font-weight: bold;
              color: #3f3f3f;
              margin-bottom: 3rem;
            }

            .registration-form {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 30rem;
            }

            .registration-form-label {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              margin-bottom: 1rem;
              font-size: 1.2rem;
              color: #3f3f3f;
            }

            .registration-form-input {
              padding: 0.5rem;
              font-size: 1.1rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              outline: none;
              width: 100%;
            }

            .registration-form-select {
              padding: 0.5rem;
              font-size: 1.1rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              outline: none;
              width: 100%;
            }

            .registration-form-button {
              padding: 0.5rem 2rem;
              font-size: 1.2rem;
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 1rem;
            }

            .registration-form-button:hover {
              background-color: #45a049;
            }

            .registration-form-error {
              color: red;
              font-size: 1.1rem;
              margin-top: 1rem;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Register;