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
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentCredits, setStudentCredits] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false); // Track enrollment status
  const [enrolledInstitute, setEnrolledInstitute] = useState(null); // Track enrolled institute

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

          // Fetch student details and credits
          await fetchStudentDetails(studentAddress, contractInstance);

          // Check if student is already enrolled
          const enrolled = await checkEnrollmentStatus(studentAddress, contractInstance);
          setIsEnrolled(enrolled);

          // Fetch enrolled institute if student is already enrolled
          if (enrolled) {
            const instituteAddress = await getEnrolledInstitute(studentAddress, contractInstance);
            setEnrolledInstitute(instituteAddress);
          }
        } else {
          throw new Error('Web3 provider not detected');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    initializeBlockchain();
  }, [studentAddress]);

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

  const fetchStudentDetails = async (studentAddress, contractInstance) => {
    try {
      if (studentAddress && contractInstance) {
        const student = await contractInstance.methods.students(studentAddress).call();
        const credits = await contractInstance.methods.getTotalCredits(studentAddress).call();
        setStudentDetails(student);
        setStudentCredits(parseInt(credits));
      }
    } catch (error) {
      setError(`Error fetching student details: ${error.message}`);
    }
  };

  const checkEnrollmentStatus = async (studentAddress, contractInstance) => {
    try {
      const instituteAddresses = await contractInstance.methods.getInstituteAddresses().call();

      for (let i = 0; i < instituteAddresses.length; i++) {
        const instituteAddress = instituteAddresses[i];
        const enrolledStudents = await contractInstance.methods.getEnrolledStudents(instituteAddress).call();
        if (enrolledStudents.includes(studentAddress)) {
          return true; // Student is enrolled in at least one institute
        }
      }

      return false; // Student is not enrolled in any institute
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      return false;
    }
  };

  const getEnrolledInstitute = async (studentAddress, contractInstance) => {
    try {
      const instituteAddresses = await contractInstance.methods.getInstituteAddresses().call();

      for (let i = 0; i < instituteAddresses.length; i++) {
        const instituteAddress = instituteAddresses[i];
        const enrolledStudents = await contractInstance.methods.getEnrolledStudents(instituteAddress).call();
        if (enrolledStudents.includes(studentAddress)) {
          return instituteAddress; // Return the enrolled institute address
        }
      }

      return null; // Student is not enrolled in any institute
    } catch (error) {
      console.error('Error getting enrolled institute:', error);
      return null;
    }
  };

  const handleTransfer = async (event) => {
    event.preventDefault();
    if (!contract || !selectedInstitute) {
      setError('Please select an institute to transfer');
      return;
    }

    try {
      await contract.methods.transferInstitute(selectedInstitute).send({ from: studentAddress });
      navigate(`/studentDashboard/${studentAddress}`); // Redirect to dashboard after successful transfer
    } catch (error) {
      setError(`Error transferring to institute: ${error.message}`);
    }
  };

  const handleTransferCredits = async (event) => {
    event.preventDefault();
    if (!contract || !selectedInstitute) {
      setError('Please select an institute to transfer credits');
      return;
    }

    try {
      await contract.methods.transferCredits(selectedInstitute, studentAddress).send({ from: studentAddress });
      navigate(`/studentDashboard/${studentAddress}`); // Redirect to dashboard after transfer
    } catch (error) {
      setError(`Error transferring credits: ${error.message}`);
    }
  };

  if (!web3) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Student Dashboard</h2>
      <h4 className="mb-4">Address: {studentAddress}</h4>
      <div className="row">
        <div className="col-md-6">
          <h4>Enroll in an institute</h4>
          <form onSubmit={handleEnroll}>
            <div className="mb-3">
              <label htmlFor="institute" className="form-label">
                Select institute:
              </label>
              <select className="form-select" id="institute" onChange={(e) => setSelectedInstitute(e.target.value)}>
                <option value="">Select institute</option>
                {institutes.map((institute) => (
                  <option key={institute.address} value={institute.address}>
                    {institute.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Enroll
            </button>
          </form>
        </div>
        <div className="col-md-6">
          <h4>Transfer credits to an institute</h4>
          <form onSubmit={handleTransferCredits}>
            <div className="mb-3">
              <label htmlFor="institute" className="form-label">
                Select institute:
              </label>
              <select className="form-select" id="institute" onChange={(e) => setSelectedInstitute(e.target.value)}>
                <option value="">Select institute</option>
                {institutes.map((institute) => (
                  <option key={institute.address} value={institute.address}>
                    {institute.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Transfer credits
            </button>
          </form>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-md-6">
          <h4>Student Details</h4>
          <table className="table">
            <tbody>
              <tr>
                <th scope="row">Name</th>
                <td>{studentDetails && studentDetails.name}</td>
              </tr>
              <tr>
                <th scope="row">Department</th>
                <td>{studentDetails && studentDetails.department}</td>
              </tr>
              <tr>
                <th scope="row">Credits completed</th>
                <td>{studentDetails && studentDetails.creditsCompleted}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <h4>Total Credits</h4>
          <table className="table">
            <tbody>
              <tr>
                <th scope="row">Total credits</th>
                <td>{totalCredits}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {error && <div className="alert alert-danger mt-4">{error}</div>}
    </div>
  );
};

export default StudentDashboard;