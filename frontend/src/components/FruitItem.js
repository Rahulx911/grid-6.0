import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Fruit = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fruitData, setFruitData] = useState(null);
  const webcamRef = React.useRef(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setSelectedFile(null); // Clear the selected file when using webcam
    sendFruitImageToBackend(imageSrc);
  }, [webcamRef]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setImageSrc(URL.createObjectURL(event.target.files[0]));
  };

  const sendFruitImageToBackend = async (imageSrc) => {
    try {
      setIsLoading(true);
      let formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile, selectedFile.name);
      } else {
        const blob = await fetch(imageSrc).then((res) => res.blob());
        formData.append('file', blob, 'captured_image.jpg');
      }
      
      const response = await axios.post(`${API_URL}/detect_fruit`, formData);
      setFruitData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing fruit image:', error);
      setIsLoading(false);
      alert('Failed to process the image. Please try again.');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleNewBox = () => {
    // Reset all states and navigate to the Enter Box Code page
    setImageSrc(null);
    setSelectedFile(null);
    setFruitData(null);
    setIsLoading(false);
    navigate('/enter-box-code'); // Assuming '/enter-box-code' is the route for entering the box code
  };

  const switchToPackedItem = () => {
    navigate('/packed-item');
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex justify-between w-full mb-4">
        <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleHome}>
          Home
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleNewBox}>
          New Box
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={switchToPackedItem}>
          Switch to Packed Item
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg">Capture Image or Upload an Image</h2>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={320}
          height={240}
          className="border rounded-lg shadow-lg mt-4"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={capture}>
          Capture Image
        </button>
        <div className="mt-4">
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => sendFruitImageToBackend(imageSrc)}>
            Upload Image
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4">
          <p>Loading... Please wait.</p>
        </div>
      )}
      
      {fruitData && (
        <div className="mt-4 p-4 border rounded-lg shadow-lg">
          <h2 className="text-lg mb-2">Fruit Detection Results</h2>
          <p>Category: {fruitData.category}</p>
          <p>Produce Type: {fruitData.produce_type}</p>
          <p>Freshness: {fruitData.freshness}</p>
          <p>Freshness Index: {fruitData.freshness_index.toFixed(2)}</p>
          <p>Shelf Life: {fruitData.shelf_life}</p>
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-2" onClick={() => alert('Fruit data submitted successfully!')}>
            Submit
          </button>
        </div>
      )}


      {imageSrc && (
        <div className="mt-4">
          <h2 className="text-lg">Captured or Uploaded Image</h2>
          <img src={imageSrc} alt="Captured" className="mt-2 border rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default Fruit;
