import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const StudentDashboard = () => {
  const { studentAddress } = useParams();
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

          // Fetch list of institutes when contract and web3 are initialized
          await fetchInstitutes(contractInstance);
        } else {
          throw new Error('Web3 provider not detected');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    initializeBlockchain();
  }, []);

  const fetchInstitutes = async (contractInstance) => {
    try {
      const institutesCount = await contractInstance.methods.getInstituteCount().call();
      const instituteAddresses = await contractInstance.methods.getInstituteAddresses().call();

      const institutesData = [];
      for (let i = 0; i < institutesCount; i++) {
        const instituteAddress = instituteAddresses[i];
        const instituteData = await contractInstance.methods.institutes(instituteAddress).call();
        institutesData.push({ address: instituteAddress, name: instituteData.name });
      }

      setInstitutes(institutesData);
    } catch (error) {
      setError(`Error fetching institutes: ${error.message}`);
    }
  };

  const handleEnroll = async (event) => {
    event.preventDefault();
    if (!contract || !selectedInstitute) {
      setError('Please select an institute to enroll');
      return;
    }

    try {
      await contract.methods.enrollStudent(selectedInstitute, studentAddress).send({ from: studentAddress });
      navigate(`/studentDashboard/${studentAddress}`); // Redirect to dashboard after enrollment
    } catch (error) {
      setError(`Error enrolling in institute: ${error.message}`);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Student Dashboard</h2>
      <form onSubmit={handleEnroll}>
        <label>
          Select Institute:
          <select value={selectedInstitute} onChange={(e) => setSelectedInstitute(e.target.value)}>
            <option value="">Select an institute</option>
            {institutes.map((institute) => (
              <option key={institute.address} value={institute.address}>
                {institute.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Enroll</button>
      </form>
    </div>
  );
};

export default StudentDashboard;
