import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CaptureImage = () => {
  const [boxCode, setBoxCode] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [step, setStep] = useState(0);
  const [ocrOutput, setOcrOutput] = useState('');
  const [totalObjects, setTotalObjects] = useState(null);
  const [fruitData, setFruitData] = useState(null);
  const webcamRef = React.useRef(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);

    if (step === 2) {
      sendFullCartImageToBackend(imageSrc);
    } else if (step === 4 && selectedOption === 'packed') {
      sendFrontImageToBackend(imageSrc);
    } else if (step === 5 && selectedOption === 'packed') {
      sendBackImageToBackend(imageSrc);
    } else if (step === 4 && selectedOption === 'fruits') {
      sendFruitImageToBackend(imageSrc);
    }
  }, [webcamRef, step, selectedOption]);

  // Backend calls omitted for brevity, use the same as in your previous implementation

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setStep(4);
    alert(`You selected ${event.target.value}. Please capture the front image.`);
  };

  const handleStart = () => {
    if (boxCode) {
      setStep(2);
      alert('Please capture the full cart image.');
    } else {
      alert('Please enter a valid Box Code.');
    }
  };

  const handleNewBox = () => {
    setBoxCode('');
    setImageSrc(null);
    setSelectedOption(null);
    setStep(0);
    setOcrOutput('');
    setTotalObjects(null);
    setFruitData(null);
    alert('Starting a new process. Please enter a new Box Code.');
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex justify-between w-full mb-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/')}
        >
          Home
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleNewBox}
        >
          New Box
        </button>
      </div>

      {step === 0 && (
        <div className="mb-4">
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
      )}

      {step === 3 && (
        <div className="mt-4">
          <label className="block">
            <input
              type="radio"
              value="packed"
              checked={selectedOption === 'packed'}
              onChange={handleOptionChange}
            />
            Packed Item
          </label>

          <label className="block">
            <input
              type="radio"
              value="fruits"
              checked={selectedOption === 'fruits'}
              onChange={handleOptionChange}
            />
            Fruits/Vegetables
          </label>
        </div>
      )}

      {step > 1 && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }} // Use back camera
            width={320}
            height={240}
            className="border rounded-lg shadow-lg"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={capture}
          >
            Capture Image
          </button>
        </>
      )}

      {imageSrc && (
        <div className="mt-4">
          <h2 className="text-lg">Captured Image</h2>
          <img src={imageSrc} alt="Captured" className="mt-2 border rounded-lg shadow-lg" />
        </div>
      )}

      {ocrOutput && (
        <div className="mt-4">
          <h2 className="text-lg">Edit OCR Output</h2>
          <textarea
            className="p-2 border rounded w-full"
            value={ocrOutput}
            onChange={(e) => setOcrOutput(e.target.value)}
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-2">
            Submit OCR Data
          </button>
        </div>
      )}
    </div>
  );
};

export default CaptureImage;
