import React, { useState } from 'react';
import { Plus, Calendar, Briefcase, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';


const AddPlacementDrive = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    description: '',
    minCGPA: 0,
    maxBacklogs: 0,
    eligibleBranches: [],
    minSemestersCompleted: 0,
    date: '',
  });
  const [branchInput, setBranchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const commonBranches = [
    'Computer Science', 'Electronics',
    'Electrical', 'Mechanical', 'Civil', 'Chemical',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['minCGPA', 'maxBacklogs', 'minSemestersCompleted'].includes(name)
        ? parseFloat(value) || 0
        : value,
    });
  };

  const handleAddBranch = () => {
    if (branchInput.trim() && !formData.eligibleBranches.includes(branchInput)) {
      setFormData({
        ...formData,
        eligibleBranches: [...formData.eligibleBranches, branchInput.trim()],
      });
      setBranchInput('');
    }
  };

  const handleRemoveBranch = (branch) => {
    setFormData({
      ...formData,
      eligibleBranches: formData.eligibleBranches.filter(b => b !== branch),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.companyName || !formData.role || !formData.date) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/placement-drives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Placement drive added successfully!');
        setTimeout(() => {
          setIsOpen(false);
          setSuccess('');
          setFormData({
            companyName: '', role: '', description: '',
            minCGPA: 0, maxBacklogs: 0, eligibleBranches: [],
            minSemestersCompleted: 0, date: '',
          });
        }, 1500);
      } else {
        setError('Failed to add placement drive');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus size={18} className="mr-2" /> Add Placement Drive
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Placement Drive">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-[#F87171] bg-[#F87171]/10 p-3 rounded-lg">{error}</div>}
          {success && <div className="text-[#10B981] bg-[#10B981]/10 p-3 rounded-lg">{success}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none h-24"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#94A3B8] mb-1">Min CGPA</label>
              <input
                type="number"
                name="minCGPA"
                value={formData.minCGPA}
                onChange={handleChange}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Max Backlogs</label>
              <input
                type="number"
                name="maxBacklogs"
                value={formData.maxBacklogs}
                onChange={handleChange}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Min Semesters</label>
              <input
                type="number"
                name="minSemestersCompleted"
                value={formData.minSemestersCompleted}
                onChange={handleChange}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none"
                min="0"
                max="8"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1">Drive Date *</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 pl-10 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] mb-1">Eligible Branches</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonBranches.map(branch => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => !formData.eligibleBranches.includes(branch) && setFormData({
                    ...formData,
                    eligibleBranches: [...formData.eligibleBranches, branch],
                  })}
                  className={`px-3 py-1 rounded text-sm ${
                    formData.eligibleBranches.includes(branch)
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#334155] text-[#F1F5F9] hover:bg-[#475569]'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-[#F1F5F9] focus:border-[#60A5FA] focus:outline-none"
                placeholder="Add custom branch"
              />
              <Button type="button" onClick={handleAddBranch} variant="secondary">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.eligibleBranches.map(branch => (
                <div key={branch} className="bg-[#334155] text-[#F1F5F9] px-2 py-1 rounded flex items-center gap-1">
                  {branch}
                  <button type="button" onClick={() => handleRemoveBranch(branch)} className="text-[#F87171] hover:text-[#EF4444]">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? 'Saving...' : 'Save Drive'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddPlacementDrive;