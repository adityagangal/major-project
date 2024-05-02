import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import CreditTransferContract from '../contracts/CreditTransfer.json';

const StudentDashboard = () => {
  const { studentAddress } = useParams();
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentCredits, setStudentCredits] = useState(0);
  const [enrolledInstitute, setEnrolledInstitute] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = CreditTransferContract.networks[networkId];

        if (!deployedNetwork) {
          throw new Error('Contract not deployed on the current network');
        }

        const contract = new web3.eth.Contract(
          CreditTransferContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        // Fetch student details
        const studentInfo = await contract.methods.students(studentAddress).call();

        if (studentInfo.walletAddress.toLowerCase() === studentAddress.toLowerCase()) {
          setStudentDetails({
            name: studentInfo.name,
            age: studentInfo.age,
            email: studentInfo.email,
            abcId: studentInfo.abcId,
            walletAddress: studentInfo.walletAddress
          });

          // Fetch student credits
          const credits = await contract.methods.getTotalCredits(studentAddress).call();
          setStudentCredits(parseInt(credits));

          // Fetch enrolled institute if already enrolled
          const instituteAddress = await contract.methods.studentInstitute(studentAddress).call();
          if (instituteAddress !== '0x0000000000000000000000000000000000000000') {
            const instituteData = await contract.methods.institutes(instituteAddress).call();
            setEnrolledInstitute(instituteData.name); // Set the name of the enrolled institute
          }

          // Fetch list of available institutes to enroll
          const institutesCount = await contract.methods.getInstituteCount().call();
          const instituteAddresses = await contract.methods.getInstituteAddresses().call();

          const availableInstitutes = [];
          for (let i = 0; i < institutesCount; i++) {
            const instituteAddress = instituteAddresses[i];
            const instituteData = await contract.methods.institutes(instituteAddress).call();
            availableInstitutes.push({ address: instituteAddress, name: instituteData.name });
          }
          setInstitutes(availableInstitutes);
        } else {
          throw new Error('Student not found');
        }
      } catch (error) {
        setError(`Error fetching student details: ${error.message}`);
      }
    };

    fetchStudentDetails();
  }, [studentAddress]);

  const handleEnrollInstitute = async () => {
    try {
      if (studentCredits <= 0) {
        setError('Insufficient credits to enroll in an institute');
        return;
      }

      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CreditTransferContract.networks[networkId];

      if (!deployedNetwork) {
        throw new Error('Contract not deployed on the current network');
      }

      const contract = new web3.eth.Contract(
        CreditTransferContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Call the contract method to enroll the student in the selected institute
      await contract.methods.enrollStudent(selectedInstitute, studentAddress).send({ from: studentAddress });

      // Fetch the enrolled institute after enrollment
      const instituteAddress = await contract.methods.studentInstitute(studentAddress).call();
      const instituteData = await contract.methods.institutes(instituteAddress).call();
      setEnrolledInstitute(instituteData.name); // Set the name of the enrolled institute
    } catch (error) {
      setError(`Error enrolling in institute: ${error.message}`);
    }
  };

  const handleTransferInstitute = async () => {
    try {
      if (studentCredits <= 0) {
        setError('Insufficient credits to transfer to another institute');
        return;
      }

      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CreditTransferContract.networks[networkId];

      if (!deployedNetwork) {
        throw new Error('Contract not deployed on the current network');
      }

      const contract = new web3.eth.Contract(
        CreditTransferContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Call the contract method to transfer the student to the selected institute
      await contract.methods.transferInstitute(selectedInstitute).send({ from: studentAddress });

      // Update the enrolled institute after transfer
      setEnrolledInstitute(selectedInstitute);
    } catch (error) {
      setError(`Error transferring institute: ${error.message}`);
    }
  };

  if (!studentDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Student Dashboard</h2>
      <h3>Student Address: {studentDetails.walletAddress}</h3>
      <div>
        <h4>Student Details</h4>
        <ul>
          <li>Name: {studentDetails.name}</li>
          <li>Age: {studentDetails.age}</li>
          <li>Email: {studentDetails.email}</li>
          <li>ABC ID: {studentDetails.abcId}</li>
          <li>Credits: {studentCredits}</li>
          {enrolledInstitute ? (
            <li>Enrolled Institute: {enrolledInstitute}</li>
          ) : (
            <li>
              <label>
                Select Institute to Enroll:
                <select value={selectedInstitute} onChange={(e) => setSelectedInstitute(e.target.value)}>
                  <option value="">Select an institute</option>
                  {institutes.map((institute) => (
                    <option key={institute.address} value={institute.address}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={handleEnrollInstitute}>Enroll in Institute</button>
            </li>
          )}
        </ul>
        {enrolledInstitute && (
          <div>
            <label>
              Transfer to Another Institute:
              <select value={selectedInstitute} onChange={(e) => setSelectedInstitute(e.target.value)}>
                <option value="">Select an institute</option>
                {institutes.map((institute) => (
                  <option key={institute.address} value={institute.address}>
                    {institute.name}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={handleTransferInstitute}>Transfer Institute</button>
          </div>
        )}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default StudentDashboard;
