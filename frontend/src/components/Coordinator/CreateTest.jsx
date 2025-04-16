import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, ArrowLeft, Eye, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const CreateTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;
  const testData = location.state?.test || null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    createdAt: new Date().toISOString().split('T')[0],
    questions: [{ question: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }],
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [questionErrors, setQuestionErrors] = useState([]);
  const [totalMarks, setTotalMarks] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [excelUploadFile, setExcelUploadFile] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && testData) {
      setFormData({ ...testData, createdAt: new Date(testData.createdAt).toISOString().split('T')[0] });
      calculateTotalMarks(testData.questions);
    } else if (isEditMode && !testData) {
      fetchTestData();
    }
  }, [isEditMode, testData]);

  useEffect(() => {
    calculateTotalMarks(formData.questions);
  }, [formData.questions]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/aptitude-tests/${id}`, { withCredentials: true });
      const data = { ...response.data, createdAt: new Date(response.data.createdAt).toISOString().split('T')[0] };
      setFormData(prev => ({ ...prev, ...data, questions: data.questions || prev.questions }));
      calculateTotalMarks(data.questions || []);
    } catch (error) {
      setErrorMessage('Failed to fetch test data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalMarks = (questions) => {
    const sum = questions.reduce((total, q) => total + Number(q.marks || 0), 0);
    setTotalMarks(sum || 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'duration' ? Number(value) : value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleCorrectOptionChange = (questionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].correctOption = Number(value);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleMarksChange = (questionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].marks = Number(value) || 1;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }],
    });
    setQuestionErrors([...questionErrors, {}]);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length === 1) {
      setErrorMessage('Test must have at least one question');
      return;
    }
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
    setQuestionErrors(questionErrors.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = [];
    let globalError = '';
  
    if (!formData.title.trim()) globalError = 'Test title is required';
    else if (formData.duration <= 0) globalError = 'Duration must be a positive number';
    else if (!formData.createdAt) globalError = 'Test date is required';
  
    formData.questions.forEach((q, i) => {
      const qErrors = {};
      if (!q.question.trim()) qErrors.question = 'Question text is required';
      q.options.forEach((opt, j) => {
        // Handle both string and number options
        if (opt === null || opt === undefined || 
            (typeof opt === 'string' && !opt.trim()) || 
            (typeof opt === 'number' && isNaN(opt))) {
          qErrors[`option${j}`] = `Option ${j + 1} is required`;
        }
      });
      if (q.correctOption < 0 || q.correctOption > 3) qErrors.correctOption = 'Correct option must be A-D';
      if (q.marks <= 0) qErrors.marks = 'Marks must be positive';
      errors[i] = qErrors;
    });
  
    setQuestionErrors(errors);
    return globalError || errors.some(e => Object.keys(e).length > 0) ? 'Validation failed' : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, createdAt: new Date(formData.createdAt).toISOString() };
      if (isEditMode) {
        await axios.put(`/api/aptitude-tests/${id}`, payload, { withCredentials: true });
        setSuccessMessage('Test updated successfully');
      } else {
        await axios.post('/api/aptitude-tests/create', payload, { withCredentials: true });
        setSuccessMessage('Test created successfully');
      }
      setTimeout(() => navigate('/coordinator/aptitude-tests'), 1500);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  // Export test to Excel
  const exportToExcel = () => {
    try {
      setExportLoading(true);
      
      // Create worksheets for test info and questions
      const testInfoWS = XLSX.utils.json_to_sheet([{
        Title: formData.title,
        Description: formData.description,
        Duration: formData.duration + ' minutes',
        Date: formData.createdAt,
        'Total Questions': formData.questions.length,
        'Total Marks': totalMarks
      }]);
      
      // Create questions worksheet data
      const questionsData = formData.questions.map((q, index) => ({
        'Question Number': index + 1,
        'Question Text': q.question,
        'Option A': q.options[0],
        'Option B': q.options[1],
        'Option C': q.options[2],
        'Option D': q.options[3],
        'Correct Option': String.fromCharCode(65 + q.correctOption), // Convert 0,1,2,3 to A,B,C,D
        'Marks': q.marks
      }));
      
      const questionsWS = XLSX.utils.json_to_sheet(questionsData);
      
      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, testInfoWS, 'Test Information');
      XLSX.utils.book_append_sheet(wb, questionsWS, 'Questions');
      
      // Generate Excel file name
      const fileName = `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_aptitude_test.xlsx`;
      
      // Write and download the file
      XLSX.writeFile(wb, fileName);
      setExportLoading(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setErrorMessage('Failed to export test to Excel');
      setExportLoading(false);
    }
  };

  // Import from Excel file
  const handleExcelUpload = (e) => {
    setExcelUploadFile(e.target.files[0]);
  };

  const processExcelImport = async () => {
    if (!excelUploadFile) {
      setErrorMessage('Please select an Excel file first');
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Read questions sheet
          const questionsSheet = workbook.Sheets[workbook.SheetNames.find(name => 
            name.toLowerCase().includes('question'))];
          
          if (!questionsSheet) {
            setErrorMessage('Excel file format is incorrect. Questions sheet not found.');
            setLoading(false);
            return;
          }
          
          const questionsData = XLSX.utils.sheet_to_json(questionsSheet);
          
          if (!questionsData.length) {
            setErrorMessage('No questions found in the Excel file');
            setLoading(false);
            return;
          }
          
          // Transform Excel data to our questions format
          const questions = questionsData.map(row => {
            // Determine correct option index (convert A,B,C,D to 0,1,2,3)
            const correctOptionStr = String(row['Correct Option'] || '').trim().toUpperCase();
            const correctOption = correctOptionStr.charCodeAt(0) - 65; // A=0, B=1, etc.
            
            return {
              question: row['Question Text'] || '',
              options: [
                row['Option A'] || '',
                row['Option B'] || '',
                row['Option C'] || '',
                row['Option D'] || ''
              ],
              correctOption: correctOption >= 0 && correctOption <= 3 ? correctOption : 0,
              marks: Number(row['Marks']) || 1
            };
          });
          
          // Try to read test info sheet
          const infoSheet = workbook.Sheets[workbook.SheetNames.find(name => 
            name.toLowerCase().includes('information') || name.toLowerCase().includes('info'))];
          
          if (infoSheet) {
            const infoData = XLSX.utils.sheet_to_json(infoSheet)[0] || {};
            
            // Update form data with test info if available
            if (infoData.Title) setFormData(prev => ({ ...prev, title: infoData.Title }));
            if (infoData.Description) setFormData(prev => ({ ...prev, description: infoData.Description }));
            if (infoData.Duration) {
              const duration = Number(String(infoData.Duration).replace(/\D/g, ''));
              if (duration > 0) setFormData(prev => ({ ...prev, duration }));
            }
          }
          
          // Update form with imported questions
          setFormData(prev => ({ ...prev, questions }));
          setSuccessMessage(`Successfully imported ${questions.length} questions from Excel`);
          setExcelUploadFile(null);
          
          // Reset file input
          const fileInput = document.getElementById('excel-upload');
          if (fileInput) fileInput.value = '';
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setErrorMessage('Failed to process Excel file. Please check the format.');
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setErrorMessage('Error reading the Excel file');
        setLoading(false);
      };
      
      reader.readAsArrayBuffer(excelUploadFile);
    } catch (error) {
      console.error('Excel import error:', error);
      setErrorMessage('Failed to import from Excel');
      setLoading(false);
    }
  };

  // Download Template Excel file
  const downloadExcelTemplate = () => {
    try {
      setExportLoading(true);
      
      // Create template for test info
      const infoWS = XLSX.utils.json_to_sheet([{
        Title: "Sample Aptitude Test",
        Description: "Description of your test",
        Duration: "60 minutes",
        Date: new Date().toISOString().split('T')[0]
      }]);
      
      // Create template for questions
      const questionsData = [
        {
          'Question Number': 1,
          'Question Text': 'Sample multiple choice question?',
          'Option A': 'First option',
          'Option B': 'Second option',
          'Option C': 'Third option',
          'Option D': 'Fourth option',
          'Correct Option': 'A',
          'Marks': 1
        },
        {
          'Question Number': 2,
          'Question Text': 'Another sample question?',
          'Option A': 'Option 1',
          'Option B': 'Option 2',
          'Option C': 'Option 3',
          'Option D': 'Option 4',
          'Correct Option': 'B',
          'Marks': 2
        }
      ];
      
      const questionsWS = XLSX.utils.json_to_sheet(questionsData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, infoWS, 'Test Information');
      XLSX.utils.book_append_sheet(wb, questionsWS, 'Questions');
      
      // Write and download
      XLSX.writeFile(wb, 'aptitude_test_template.xlsx');
      setExportLoading(false);
    } catch (error) {
      console.error('Error creating template:', error);
      setErrorMessage('Failed to create Excel template');
      setExportLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="w-12 h-12 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800/90 backdrop-blur-md shadow-xl rounded-lg border border-gray-700 p-4 max-w-4xl mx-auto">
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={() => navigate('/coordinator/aptitude-tests')}
            className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            {isEditMode ? 'Edit Aptitude Test' : 'Create Aptitude Test'}
          </h1>
        </div>

        {successMessage && (
          <div className="text-teal-400 bg-teal-500/10 p-3 rounded-lg mb-4">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-4">{errorMessage}</div>
        )}

        {/* Excel Import/Export Section */}
        <div className="mb-6 bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Excel Import/Export</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excel Export */}
            <div className="space-y-2">
              <h3 className="text-gray-400">Export Options</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportToExcel}
                  disabled={exportLoading}
                  className="px-3 py-1.5 bg-blue-600/80 text-white rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
                >
                  <Download size={16} className="mr-1" /> 
                  {exportLoading ? 'Exporting...' : 'Export Test'}
                </button>
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  disabled={exportLoading}
                  className="px-3 py-1.5 bg-purple-600/80 text-white rounded-lg shadow-md hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
                >
                  <Download size={16} className="mr-1" /> 
                  {exportLoading ? 'Creating...' : 'Get Template'}
                </button>
              </div>
            </div>
            
            {/* Excel Import */}
            <div className="space-y-2">
              <h3 className="text-gray-400">Import from Excel</h3>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="block w-full text-sm text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gray-700 file:text-gray-300
                    hover:file:bg-gray-600"
                />
                <button
                  type="button"
                  onClick={processExcelImport}
                  disabled={!excelUploadFile || loading}
                  className="px-3 py-1.5 bg-green-600/80 text-white rounded-lg shadow-md hover:bg-green-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-sm"
                >
                  {loading ? 'Importing...' : 'Import Questions'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-1">Test Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter test title"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-y"
              placeholder="Enter test description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Date</label>
              <input
                type="date"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleInputChange}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Questions
            </h2>
            <div className="text-gray-400">Total Marks: {totalMarks}</div>
          </div>

          {formData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-200">Question {questionIndex + 1}</h3>
                <button
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">Question Text</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                    className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 h-20 resize-y"
                    placeholder="Enter question text"
                    required
                  />
                  {questionErrors[questionIndex]?.question && (
                    <p className="text-red-400 text-sm mt-1">{questionErrors[questionIndex].question}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Options</label>
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2 mb-2">
                      <span className="w-6 text-gray-400">{String.fromCharCode(65 + optionIndex)}.</span>
                      <input
                        type="text"
                        value={question.options[optionIndex]}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                        className="flex-1 bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                      />
                      {questionErrors[questionIndex]?.[`option${optionIndex}`] && (
                        <p className="text-red-400 text-sm mt-1">{questionErrors[questionIndex][`option${optionIndex}`]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Correct Option</label>
                    <select
                      value={question.correctOption}
                      onChange={(e) => handleCorrectOptionChange(questionIndex, e.target.value)}
                      className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value={0}>A</option>
                      <option value={1}>B</option>
                      <option value={2}>C</option>
                      <option value={3}>D</option>
                    </select>
                    {questionErrors[questionIndex]?.correctOption && (
                      <p className="text-red-400 text-sm mt-1">{questionErrors[questionIndex].correctOption}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Marks</label>
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleMarksChange(questionIndex, e.target.value)}
                      className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min="1"
                      required
                    />
                    {questionErrors[questionIndex]?.marks && (
                      <p className="text-red-400 text-sm mt-1">{questionErrors[questionIndex].marks}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={addQuestion}
              className="flex-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-sm"
            >
              <Plus size={16} className="mr-1" /> Add Question
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-sm"
            >
              <Eye size={16} className="mr-1" /> Preview Test
            </button>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/coordinator/aptitude-tests')}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 text-sm"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Test' : 'Save Test')}
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800/90 backdrop-blur-md rounded-lg border border-gray-700 p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  {formData.title || 'Test Preview'}
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back to Edit
                </button>
              </div>
              <p className="text-gray-400 mb-2">Duration: {formData.duration} minutes</p>
              <p className="text-gray-400 mb-4">Total Marks: {totalMarks}</p>
              {formData.questions.map((q, i) => (
                <div key={i} className="mb-6">
                  <p className="text-gray-200 font-medium">{i + 1}. {q.question || 'Untitled Question'} ({q.marks} marks)</p>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, j) => (
                      <li key={j} className={`text-gray-200 ${j === q.correctOption ? 'text-teal-400' : ''}`}>
                        {String.fromCharCode(65 + j)}. {opt || 'Empty Option'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTest;