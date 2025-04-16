// frontend/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
     
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
          withCredentials: true
        });
        setProfile(response.data.profile);
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err.response?.data, err.message);
        setError(err.response?.data?.message || 'Error fetching profile');
        setLoading(false);
      
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-secondary-bg rounded-lg shadow-glass p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <User size={40} className="text-accent" />
        <h1 className="text-2xl font-bold text-white">Student Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
        <div className="space-y-2">
          <p><span className="font-semibold text-accent">Name:</span> {profile.name}</p>
          <p><span className="font-semibold text-accent">Email:</span> {profile.email}</p>
          <p><span className="font-semibold text-accent">Registration Number:</span> {profile.registrationNumber}</p>
          <p><span className="font-semibold text-accent">Batch:</span> {profile.batch}</p>
          <p><span className="font-semibold text-accent">Branch:</span> {profile.branch}</p>
        </div>
        <div className="space-y-2">
          <p><span className="font-semibold text-accent">Semesters Completed:</span> {profile.semestersCompleted}</p>
          <p><span className="font-semibold text-accent">CGPA:</span> {profile.cgpa || 'N/A'}</p>
          <p><span className="font-semibold text-accent">Number of Backlogs:</span> {profile.numberOfBacklogs}</p>
          <p><span className="font-semibold text-accent">Phone:</span> {profile.phoneNumber || 'Not provided'}</p>
          <p><span className="font-semibold text-accent">Last Updated:</span> {new Date(profile.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;