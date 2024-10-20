import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PackedItem = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrOutput, setOcrOutput] = useState('');
  const [isBackSide, setIsBackSide] = useState(false);
  const webcamRef = React.useRef(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setSelectedFile(null); // Clear the selected file when using webcam
    sendImageToBackend(imageSrc);
  }, [webcamRef]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setImageSrc(URL.createObjectURL(event.target.files[0]));
  };

  const sendImageToBackend = async (imageSrc) => {
    try {
      setIsLoading(true);
      let formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile, selectedFile.name);
      } else {
        const blob = await fetch(imageSrc).then((res) => res.blob());
        formData.append('file', blob, 'captured_image.jpg');
      }

      const endpoint = isBackSide ? `${API_URL}/detect_back_side` : `${API_URL}/detect_front_side`;

      const response = await axios.post(endpoint, formData);
      const detectedText = isBackSide ? response.data.analyzed_text : response.data.detected_texts.join('\n');
      setOcrOutput(detectedText);

      setIsLoading(false);
    } catch (error) {
      console.error('Error processing the image:', error);
      setIsLoading(false);
      alert('Failed to process the image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        boxCode: "your_box_code_here", // Replace with actual box code from state if needed
        outputData: {
          item_type: isBackSide ? 'packed_back' : 'packed_front',
          front_data: !isBackSide ? ocrOutput : null,
          back_data: isBackSide ? ocrOutput : null,
        },
      };
  
      const response = await axios.post(`${API_URL}/save_data`, data);
      alert('Data submitted successfully.');
  
      // If it's the front side, switch to the back side; otherwise reset the form for the next item
      if (!isBackSide) {
        setIsBackSide(true);
        setImageSrc(null);
        setSelectedFile(null);
        setOcrOutput('');
        alert('Now, please capture or upload the back-side image.');
      } else {
        setIsBackSide(false);
        setImageSrc(null);
        setSelectedFile(null);
        setOcrOutput('');
        alert('Back-side data submitted successfully! You can now process the next item.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleNewBox = () => {
    // Reset all states and navigate to the Enter Box Code page
    setImageSrc(null);
    setSelectedFile(null);
    setOcrOutput('');
    setIsLoading(false);
    setIsBackSide(false);
    navigate('/enter-box-code'); // Assuming '/enter-box-code' is the route for entering the box code
  };

  const switchToFruit = () => {
    navigate('/fruit-item');
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
        <button className="bg-orange-500 text-white px-4 py-2 rounded" onClick={switchToFruit}>
          Switch to Fruit
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg">{isBackSide ? 'Capture or Upload Back-Side Image' : 'Capture or Upload Front-Side Image'}</h2>
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
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => sendImageToBackend(imageSrc)}>
            Upload Image
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4">
          <p>Loading... Please wait.</p>
        </div>
      )}
      
      {ocrOutput && (
        <div className="mt-4 p-4 border rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-lg mb-2">OCR Output</h2>
          <textarea
            value={ocrOutput}
            onChange={(e) => setOcrOutput(e.target.value)}
            className="w-full p-2 border rounded"
            style={{ height: '200px', fontSize: '16px' }}
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-2" onClick={handleSubmit}>
            Submit OCR Data
          </button>
        </div>
      )}

      {imageSrc && (
        <div className="mt-4">
          <h2 className="text-lg">{isBackSide ? 'Captured or Uploaded Back-Side Image' : 'Captured or Uploaded Front-Side Image'}</h2>
          <img
            src={imageSrc}
            alt="Captured"
            className="mt-2 border rounded-lg shadow-lg w-32 h-32 object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default PackedItem;