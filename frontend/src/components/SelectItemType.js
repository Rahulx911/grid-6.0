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
      <h2 className="text-lg">Select Item Type</h2>
      <label className="block">
        <input type="radio" value="packed" onChange={handleOptionChange} />
        Packed Item
      </label>
      <label className="block">
        <input type="radio" value="fruits" onChange={handleOptionChange} />
        Fruits/Vegetables
      </label>
    </div>
  );
};

export default SelectItemType;
