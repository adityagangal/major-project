import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const EnrollmentForm = ({ studentAddress }) => {
  const navigate = useNavigate();

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeBlockchain = async () => {
      try {
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

          // Fetch available institutes when contract and web3 are initialized
          await fetchInstitutes(contractInstance);
        } else {
          throw new Error('Web3 provider not detected');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    initializeBlockchain();
  }, []); // Run once on component mount to initialize blockchain connection

  const fetchInstitutes = async (contractInstance) => {
    try {
      if (contractInstance) {
        const instituteCount = await contractInstance.methods.getInstituteCount().call();
        const institutes = [];
        for (let i = 0; i < instituteCount; i++) {
          const instituteAddress = await contractInstance.methods.getInstituteAtIndex(i).call();
          const instituteDetails = await contractInstance.methods.institutes(instituteAddress).call();
          institutes.push({
            address: instituteAddress,
            name: instituteDetails.name,
          });
        }
        setInstitutes(institutes);
      }
    } catch (error) {
      setError(`Error fetching institutes: ${error.message}`);
    }
  };

  const handleEnroll = async (event) => {
    event.preventDefault();
    try {
      if (contract && studentAddress && selectedInstitute) {
        await contract.methods.enrollStudent(selectedInstitute, studentAddress).send({ from: studentAddress });
        // Navigate to a success page or display a success message
        navigate('/enrollment-success');
      }
    } catch (error) {
      setError(`Error enrolling in institute: ${error.message}`);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Enrollment Form</h2>
      <form onSubmit={handleEnroll}>
        <label>
          Select Institute:
          <select value={selectedInstitute} onChange={(e) => setSelectedInstitute(e.target.value)}>
            <option value="">Select an institute</option>
            {institutes.map((inst) => (
              <option key={inst.address} value={inst.address}>
                {inst.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Enroll</button>
      </form>
    </div>
  );
};

export default EnrollmentForm;
