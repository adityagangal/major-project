import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const AdminDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [markSheet, setMarkSheet] = useState(null);
  const [creditsGiven, setCreditsGiven] = useState(false);
  const [creditsToTransfer, setCreditsToTransfer] = useState(0); // State to hold number of credits to transfer
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = CreditTransferContract.networks[networkId];

          if (!deployedNetwork) {
            throw new Error('Contract not deployed on the current network');
          }

          const contract = new web3.eth.Contract(
            CreditTransferContract.abi,
            deployedNetwork.address
          );

          setWeb3(web3);
          setContract(contract);

          const studentAddresses = await contract.methods.getStudentAddresses().call();
          setStudents(studentAddresses);
        } else {
          throw new Error('MetaMask is not installed');
        }
      } catch (error) {
        setError(`Error initializing Web3: ${error.message}`);
      }
    };

    initializeWeb3();
  }, []);

  const fetchMarkSheet = async () => {
    try {
      const markSheetData = await contract.methods.getMarksheet(selectedSemester).call({ from: selectedInstitute });
      setMarkSheet(markSheetData);
      setSelectedStudent(markSheetData[1]);
      const creditsGivenForMarkSheet = await contract.methods.creditsGivenForMarksheet(selectedSemester).call();
      setCreditsGiven(creditsGivenForMarkSheet);
    } catch (error) {
      setError(`Error fetching mark sheet: ${error.message}`);
    }
  };

  const transferCredits = async () => {
    try {
      // Ensure creditsToTransfer is a valid positive integer
      const credits = parseInt(creditsToTransfer);
      if (isNaN(credits) || credits <= 0) {
        throw new Error('Please enter a valid number of credits to transfer');
      }
  
      const accounts = await web3.eth.getAccounts();
      const fromAccount = accounts[0]; // Use the first account as the 'from' address
  
      await contract.methods.giveCredits(selectedStudent, credits)
        .send({ from: fromAccount });
  
      setCreditsGiven(true);
      alert('Credits transferred successfully!');
    } catch (error) {
      setError(`Error transferring credits: ${error.message}`);
    }
  };
  

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(parseInt(e.target.value));
  };

  const handleCreditsChange = (e) => {
    setCreditsToTransfer(e.target.value);
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      <div>
        <h4>Select Student:</h4>
        <select value={selectedStudent} onChange={handleStudentChange}>
          <option value="">Select Student</option>
          {students.map((studentAddress, index) => (
            <option key={index} value={studentAddress}>{studentAddress}</option>
          ))}
        </select>

        <h4>Select Semester:</h4>
        <select value={selectedSemester} onChange={handleSemesterChange}>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          {/* Add more options for other semesters */}
        </select>

        <div>
          <label>Number of Credits to Transfer:</label>
          <input
            type="number"
            value={creditsToTransfer}
            onChange={handleCreditsChange}
          />
        </div>

        <button onClick={fetchMarkSheet}>Fetch Mark Sheet</button>
        {!creditsGiven && (
          <button onClick={transferCredits}>Transfer Credits</button>
        )}
      </div>

      {markSheet && (
        <div>
          <h3>Mark Sheet Details:</h3>
          <p><strong>Institute:</strong> {markSheet[0]}</p>
          <p><strong>Student:</strong> {markSheet[1]}</p>
          <p><strong>Content (IPFS Hash):</strong> {markSheet[2]}</p>
          <p><strong>Credits Given:</strong> {creditsGiven ? 'Yes' : 'No'}</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default AdminDashboard;
