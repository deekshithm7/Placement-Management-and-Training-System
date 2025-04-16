import React, { useState } from 'react';

const EditAdvisorForm = ({ advisor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: advisor.name || '',
    branch: advisor.branch || '',
    phoneNumber: advisor.phoneNumber || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });


const branchOptions = [
  'MECH',
  'EEE',
  'ECE',
  'CSE',
  'CIVIL',
];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        setSubmitMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          onCancel();
        }, 1500);
      } else {
        setSubmitMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error.message || 'An error occurred while updating the advisor',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-4 w-full max-w-md shadow-2xl border border-gray-800">
        <h2 className="text-xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Edit Advisor
        </h2>

        {submitMessage.text && (
          <div
            className={`mb-4 p-3 rounded-lg shadow-md ${
              submitMessage.type === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                : 'bg-red-500/20 text-red-300 border border-red-500/50'
            } animate-fade-in`}
          >
            {submitMessage.text}
          </div>
        )}

        <div className="mb-4 bg-gray-800/80 p-3 rounded-lg border border-gray-700">
          <p className="text-gray-300 text-sm">
            Email: <span className="text-white font-medium">{advisor.email || 'N/A'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-300 font-medium text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-800/80 border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
              placeholder="Enter advisor's name"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1 animate-fade-in">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 font-medium text-sm mb-1">Branch</label>
            <select
                    id="branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-800/80 border  rounded ${
                      errors.branch ? 'border-red-500' : 'border-gray-600'
                    }`}                  >
                    <option value="">Select your branch</option>
                    {branchOptions.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
            {errors.branch && (
              <p className="text-red-400 text-xs mt-1 animate-fade-in">{errors.branch}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 font-medium text-sm mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Updating...' : 'Update Advisor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdvisorForm;