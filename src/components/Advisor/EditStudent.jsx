import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';


const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({ cgpa: '', numberOfBacklogs: '', semestersCompleted: '' });
  const [originalStudent, setOriginalStudent] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`/api/students/students/${id}`, { withCredentials: true });
        setStudent({
          cgpa: response.data.cgpa || '',
          numberOfBacklogs: response.data.numberOfBacklogs || '',
          semestersCompleted: response.data.semestersCompleted || '',
        });
        setOriginalStudent(response.data);
      } catch (err) {
        setError('Failed to fetch student details');
      }
    };
    fetchStudentDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (isNaN(parseFloat(student.cgpa)) || parseFloat(student.cgpa) < 0 || parseFloat(student.cgpa) > 10) {
      setError('CGPA must be between 0 and 10');
      return;
    }
    if (isNaN(parseInt(student.numberOfBacklogs)) || parseInt(student.numberOfBacklogs) < 0) {
      setError('Number of backlogs must be non-negative');
      return;
    }
    if (isNaN(parseInt(student.semestersCompleted)) || parseInt(student.semestersCompleted) < 0) {
      setError('Semesters completed must be non-negative');
      return;
    }
    try {
      const response = await axios.put(`/api/students/edit/${id}`, student, { withCredentials: true });
      setSuccess(response.data.message || 'Student updated successfully');
      setTimeout(() => navigate('/Advisor/student-list'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-secondary-bg rounded-xl shadow-glass p-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-6 text-center">
          Edit Student Academic Details
        </h2>
        <div className="mb-4 text-text-secondary">
          <p>Student: {originalStudent.name}</p>
          <p>Registration Number: {originalStudent.registrationNumber}</p>
        </div>
        {error && <div className="text-error bg-error bg-opacity-20 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="text-accent bg-accent bg-opacity-20 p-3 rounded-lg mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'cgpa', label: 'CGPA', placeholder: 'Enter CGPA' },
            { name: 'numberOfBacklogs', label: 'Number of Backlogs', placeholder: 'Enter Number of Backlogs' },
            { name: 'semestersCompleted', label: 'Semesters Completed', placeholder: 'Enter Semesters Completed' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-text-primary mb-2">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={student[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-[#2c3e50] text-text-primary p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200"
                required
                aria-label={field.label}
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-highlight hover:bg-blue-500 text-text-primary p-3 rounded-lg transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-accent"
            aria-label="Update Academic Details"
          >
            Update Academic Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;