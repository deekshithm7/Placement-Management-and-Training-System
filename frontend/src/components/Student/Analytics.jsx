import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { ArrowLeft, Layers, TrendingUp, Award, Calendar } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    highestScore: 0,
    averageScore: 0
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/aptitude-tests/result/current`, { withCredentials: true });
        setResults(response.data.results);
        setAnalytics(response.data.analytics);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else {
          console.error('Error fetching analytics data:', err);
          setError(err.message || 'Failed to load analytics data.');
          setLoading(false);
        }
      }
    };
    fetchResults();
  }, []);

  const prepareLineChartData = () => {
    const sortedResults = [...results].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    return {
      labels: sortedResults.map(result => new Date(result.submittedAt).toLocaleDateString()),
      datasets: [{
        label: 'Score Percentage',
        data: sortedResults.map(result => ((result.score / result.totalMarks) * 100).toFixed(2)),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.2
      }]
    };
  };

  const prepareBarChartData = () => {
    return {
      labels: results.map(result => result.test.title),
      datasets: [{
        label: 'Score Percentage',
        data: results.map(result => ((result.score / result.totalMarks) * 100).toFixed(2)),
        backgroundColor: 'rgba(96, 165, 250, 0.5)',
        borderColor: '#60A5FA',
        borderWidth: 1
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#F1F5F9' } },
      title: { display: true, color: '#F1F5F9' }
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };

  const lineChartOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Performance Over Time' } } };
  const barChartOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Performance by Test' } } };

  if (loading) return <div className="min-h-screen bg-primary-bg flex justify-center items-center text-text-secondary animate-pulse">Loading analytics data...</div>;

  if (error) return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl bg-secondary-bg rounded-xl p-6 shadow-glass text-text-primary">
        <h2 className="text-xl font-semibold text-error mb-4">Error</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <button onClick={() => navigate('/student/aptitude-tests')} className="bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:scale-105">
          <ArrowLeft className="mr-2" size={18} /> Back to Tests
        </button>
      </div>
    </div>
  );

  if (results.length === 0) return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl bg-secondary-bg rounded-xl p-6 shadow-glass text-text-primary">
        <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>
        <div className="bg-primary-bg rounded-lg p-6 flex flex-col items-center justify-center h-60">
          <p className="text-text-secondary mb-4 text-center">You haven't attempted any quizzes yet.</p>
          <button onClick={() => navigate('/student/aptitude-tests')} className="bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:scale-105">
            Take a Quiz
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl">
        <div className="bg-secondary-bg rounded-xl p-6 shadow-glass text-text-primary mb-6 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Performance Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { Icon: Layers, label: 'Total Quizzes', value: analytics.totalAttempts, color: 'text-highlight' },
              { Icon: Award, label: 'Highest Score', value: `${analytics.highestScore}%`, color: 'text-accent' },
              { Icon: TrendingUp, label: 'Average Score', value: `${analytics.averageScore.toFixed(2)}%`, color: 'text-yellow-400' }
            ].map(({ Icon, label, value, color }, idx) => (
              <div key={idx} className="bg-primary-bg rounded-lg p-4 flex items-center shadow-glass">
                <Icon className={`${color} mr-4`} size={32} />
                <div>
                  <p className="text-text-secondary text-sm">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-primary-bg p-4 rounded-lg shadow-glass">
              {results.length > 1 ? (
                <Line data={prepareLineChartData()} options={lineChartOptions} />
              ) : (
                <div className="flex flex-col h-60 justify-center items-center text-text-secondary">
                  <Calendar size={32} className="mb-2" />
                  <p>Need more quiz attempts to display trend data</p>
                </div>
              )}
            </div>
            <div className="bg-primary-bg p-4 rounded-lg shadow-glass">
              <Bar data={prepareBarChartData()} options={barChartOptions} />
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Recent Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary-bg">
                    <th className="p-2 text-left text-text-secondary">Quiz</th>
                    <th className="p-2 text-left text-text-secondary">Date</th>
                    <th className="p-2 text-right text-text-secondary">Score</th>
                    <th className="p-2 text-right text-text-secondary">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 5).map((result, index) => (
                    <tr key={index} className="border-t border-white/10 hover:bg-highlight/10 transition-all duration-300">
                      <td className="p-2 text-left">{result.test.title}</td>
                      <td className="p-2 text-left">{new Date(result.submittedAt).toLocaleDateString()}</td>
                      <td className="p-2 text-right">{result.score} / {result.totalMarks}</td>
                      <td className="p-2 text-right">
                        <span className={(result.score / result.totalMarks) * 100 >= 60 ? 'text-accent' : 'text-error'}>
                          {((result.score / result.totalMarks) * 100).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  
        </div>
      </div>
    </div>
  );
};

export default Analytics;