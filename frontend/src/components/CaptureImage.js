import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';  // Make sure axios is installed in your frontend project

const CaptureImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedOption, setSelectedOption] = useState("packed"); // Default option
  const [isNewBox, setIsNewBox] = useState(false); // To track if "New Box" is selected
  const [totalObjects, setTotalObjects] = useState(null); // To store detected object count
  const webcamRef = React.useRef(null);

  // Function to capture the image
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);

    if (isNewBox) {
      alert("Capture the full cart image"); // Prompt to capture the full cart
      sendImageToBackend(imageSrc); // Send to backend for detection
    } else if (selectedOption === "packed") {
      sendImageToBackend(imageSrc); // Send packed item image to backend
    } else {
      sendImageToBackend(imageSrc); // Send fruit/vegetable image to backend
    }
  }, [webcamRef, isNewBox, selectedOption]);

  const sendImageToBackend = async (imageSrc) => {
    try {
      // Convert the base64 image to a blob and form data
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "captured_image.jpg");

      // Send the image to the backend Flask route
      const response = await axios.post("http://127.0.0.1:5000/detect_objects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Handle the response (Total objects detected)
      setTotalObjects(response.data.total_objects);
    } catch (error) {
      console.error("Error sending image to backend:", error);
    }
  };

  // Handle radio button selection for fruits/vegetables/packed item
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    if (event.target.value === "newBox") {
      setIsNewBox(true); // If "New Box" is selected, show prompt for full cart
    } else {
      setIsNewBox(false); // Reset if not "New Box"
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      {/* Webcam Component */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
        className="border rounded-lg shadow-lg"
      />

      {/* Capture Button */}
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        onClick={capture}
      >
        Capture Image
      </button>

      {/* Radio buttons for options */}
      <div className="mt-4">
        <label className="block">
          <input
            type="radio"
            value="packed"
            checked={selectedOption === "packed"}
            onChange={handleOptionChange}
          />
          Packed Item (Default)
        </label>

        <label className="block">
          <input
            type="radio"
            value="fruits"
            checked={selectedOption === "fruits"}
            onChange={handleOptionChange}
          />
          Fruits
        </label>

        <label className="block">
          <input
            type="radio"
            value="vegetables"
            checked={selectedOption === "vegetables"}
            onChange={handleOptionChange}
          />
          Vegetables
        </label>

        <label className="block">
          <input
            type="radio"
            value="newBox"
            checked={selectedOption === "newBox"}
            onChange={handleOptionChange}
          />
          New Box (Capture Full Cart)
        </label>
      </div>

      {/* Display the captured image */}
      {imageSrc && (
        <div className="mt-4">
          <h2 className="text-lg">Captured Image</h2>
          <img src={imageSrc} alt="Captured" className="mt-2 border rounded-lg shadow-lg" />
        </div>
      )}

      {/* Display the total number of detected objects */}
      {totalObjects !== null && (
        <div className="mt-4">
          <h2 className="text-lg">Total Objects Detected: {totalObjects}</h2>
        </div>
      )}
    </div>
  );
};

export default CaptureImage;
