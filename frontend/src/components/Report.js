import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Report = () => {
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [items, setItems] = useState([]);
  const [totalObjects, setTotalObjects] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await axios.get(`${API_URL}/get_boxes`);
        setBoxes(response.data);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      }
    };

    fetchBoxes();
  }, []);

  const fetchBoxDetails = async (boxCode) => {
    try {
      const response = await axios.get(`${API_URL}/get_box_details/${boxCode}`);
      setSelectedBox(boxCode);
      setTotalObjects(response.data.total_objects);
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching box details:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Report</h1>
      {!selectedBox && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Boxes</h2>
          <div className="flex flex-wrap mt-4">
            {boxes.map((box, index) => (
              <div
                key={box.box_code}
                className="bg-gray-200 p-4 m-2 rounded-lg cursor-pointer"
                onClick={() => fetchBoxDetails(box.box_code)}
              >
                <h3 className="font-bold">Box {index + 1}</h3>
                <p>Code: {box.box_code}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedBox && (
        <div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            onClick={() => setSelectedBox(null)}
          >
            Back to Boxes
          </button>
          <h2 className="text-xl font-semibold mb-2">Box {selectedBox}</h2>
          <p className="mb-4">Total Objects Detected: {totalObjects}</p>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">S.No</th>
                <th className="py-2">Item Type</th>
                <th className="py-2">Front Side Data</th>
                <th className="py-2">Back Side Data</th>
                <th className="py-2">Produce Type</th>
                <th className="py-2">Freshness</th>
                <th className="py-2">Shelf Life</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.item_id} className="border-t">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{item.item_type}</td>
                  <td className="py-2">{item.front_data || 'N/A'}</td>
                  <td className="py-2">{item.back_data || 'N/A'}</td>
                  <td className="py-2">{item.produce_type || 'N/A'}</td>
                  <td className="py-2">{item.freshness || 'N/A'}</td>
                  <td className="py-2">{item.shelf_life || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Report;
