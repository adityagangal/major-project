import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const InstituteDashboard = () => {
  const { instituteAddress } = useParams();
  const [instituteDetails, setInstituteDetails] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semesterNumber, setSemesterNumber] = useState(1);
  const [marksContent, setMarksContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstituteDetails = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = CreditTransferContract.networks[networkId];

        if (!deployedNetwork) {
          throw new Error('Contract not deployed on the current network');
        }

        const contract = new web3.eth.Contract(
          CreditTransferContract.abi,
          deployedNetwork.address
        );

        const instituteInfo = await contract.methods.institutes(instituteAddress).call();

        if (instituteInfo && instituteInfo.walletAddress && instituteInfo.walletAddress.toLowerCase() === instituteAddress.toLowerCase()) {
          setInstituteDetails({
            name: instituteInfo.name,
            location: instituteInfo.location,
            address: instituteInfo.walletAddress
          });

          const enrolledStudents = await contract.methods.getEnrolledStudents(instituteAddress).call();

          const studentsDataPromises = enrolledStudents.map(async (studentAddress) => {
            const studentInfo = await contract.methods.students(studentAddress).call();
            return { abcId: studentInfo.abcId, name: studentInfo.name, walletAddress: studentAddress };
          });

          const resolvedStudentsData = await Promise.all(studentsDataPromises);
          setStudentsData(resolvedStudentsData);
        } else {
          throw new Error('Institute not found');
        }
      } catch (error) {
        setError(`Error fetching institute details: ${error.message}`);
      }
    };

    fetchInstituteDetails();
  }, [instituteAddress]);

  const submitMarksheet = async () => {
    try {
      if (!selectedStudent) {
        throw new Error('Please select a student');
      }

      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CreditTransferContract.networks[networkId];

      const contract = new web3.eth.Contract(
        CreditTransferContract.abi,
        deployedNetwork.address
      );

      const accounts = await web3.eth.getAccounts();

      await contract.methods.submitMarksheet(semesterNumber, marksContent, selectedStudent).send({ from: accounts[0] });

      console.log(`Marksheet submitted successfully for semester ${semesterNumber}`);
      // Optionally: show success message, reset form, etc.
    } catch (error) {
      setError(`Error submitting marksheet: ${error.message}`);
    }
  };

  if (!instituteDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Institute Dashboard</h2>
      <h3>Institute Name: {instituteDetails.name}</h3>
      <div>
        <h4>Institute Details</h4>
        <ul>
          <li>Location: {instituteDetails.location}</li>
          <li>Address: {instituteDetails.address}</li>
        </ul>
      </div>

      <div>
        <h4>Select Student</h4>
        <ul>
          {studentsData.map((student, index) => (
            <li key={index}>
              <input
                type="radio"
                id={`student_${index}`}
                name="selectedStudent"
                value={student.walletAddress}
                checked={selectedStudent === student.walletAddress}
                onChange={() => setSelectedStudent(student.walletAddress)}
              />
              <label htmlFor={`student_${index}`}>{student.name}</label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Submit Marksheet</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMarksheet();
          }}
        >
          <label htmlFor="semesterNumber">Semester Number:</label>
          <input
            type="number"
            id="semesterNumber"
            value={semesterNumber}
            onChange={(e) => setSemesterNumber(parseInt(e.target.value))}
          />
          <br />
          <label htmlFor="marksContent">Marks Content:</label>
          <textarea
            id="marksContent"
            value={marksContent}
            onChange={(e) => setMarksContent(e.target.value)}
          />
          <br />
          <button type="submit">Submit Marksheet</button>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default InstituteDashboard;
