// EnterBoxCode.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EnterBoxCode = () => {
  const [boxCode, setBoxCode] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (boxCode.trim()) {
      // Redirect to CaptureImage page with boxCode
      navigate('/capture', { state: { boxCode } });
    } else {
      alert('Please enter a valid Box Code.');
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <input
        type="text"
        placeholder="Enter Box Code"
        value={boxCode}
        onChange={(e) => setBoxCode(e.target.value)}
        className="p-2 border rounded"
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={handleStart}
      >
        Start
      </button>
    </div>
  );
};

export default EnterBoxCode;
