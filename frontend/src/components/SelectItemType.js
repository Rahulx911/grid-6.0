// SelectItemType.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectItemType = () => {
  const navigate = useNavigate();

  const handleOptionChange = (event) => {
    if (event.target.value === 'packed') {
      navigate('/packed-item');
    } else if (event.target.value === 'fruits') {
      navigate('/fruit-item');
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-6">Select Item Type</h2>
      <div className="space-y-4">
        <button
          className="bg-blue-500 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-blue-600 transition duration-300"
          value="packed"
          onClick={handleOptionChange}
        >
          Packed Item
        </button>
        <button
          className="bg-green-500 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-green-600 transition duration-300"
          value="fruits"
          onClick={handleOptionChange}
        >
          Fruits/Vegetables
        </button>
      </div>
    </div>
  );
};

export default SelectItemType;