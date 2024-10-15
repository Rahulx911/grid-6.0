import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const CaptureImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const webcamRef = React.useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    // You can send the imageSrc to the backend for processing here
  }, [webcamRef]);

  return (
    <div className="flex flex-col items-center p-6">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
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
      {imageSrc && (
        <div className="mt-4">
          <h2 className="text-lg">Captured Image</h2>
          <img src={imageSrc} alt="Captured" className="mt-2 border rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default CaptureImage;
