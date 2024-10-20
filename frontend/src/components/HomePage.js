import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-10">Welcome to Product Inspector</h1>
      <div className="space-y-6">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/enter-box-code')}
        >
          Capture Image
        </button>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/report')}
        >
          See Report
        </button>
      </div>
    </div>
  );
};

export default HomePage;
