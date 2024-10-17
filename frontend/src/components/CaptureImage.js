import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const CaptureImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selection, setSelection] = useState('');
  const webcamRef = React.useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    // You can send the imageSrc to the backend for processing here
  }, [webcamRef]);

  const handleSelection = (e) => {
    setSelection(e.target.value);
  };

  const handleProceed = () => {
    if (selection) {
      setCameraActive(true);
    } else {
      alert('Please select an option before proceeding.');
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      {/* Step 1: Select Fruits/Vegetables or New Box */}
      {!cameraActive && (
        <div>
          <h2 className="text-lg mb-4">Select an option before proceeding:</h2>
          <select
            value={selection}
            onChange={handleSelection}
            className="border p-2 rounded-lg mb-4"
          >
            <option value="">-- Select --</option>
            <option value="fruits_vegetables">Fruits/Vegetables</option>
            <option value="new_box">New Box</option>
          </select>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={handleProceed}
          >
            Proceed to Capture
          </button>
        </div>
      )}

      {/* Step 2: Webcam Interface */}
      {cameraActive && (
        <div className="flex flex-col items-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            height={240}
            className="border rounded-lg shadow-lg"
            videoConstraints={{
              facingMode: "environment" // Use the back camera
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={capture}
          >
            Capture Image
          </button>
        </div>
      )}

      {/* Step 3: Show Captured Image */}
      {imageSrc && (
        <div className="mt-4">
          <h2 className="text-lg">Captured Image</h2>
          <img
            src={imageSrc}
            alt="Captured"
            className="mt-2 border rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default CaptureImage;
