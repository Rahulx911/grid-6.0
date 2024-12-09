
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Navbar from "./Navbar"; // Import the Navbar
const API = process.env.REACT_APP_API_URL

const FreshProduce = () => {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [freshData, setFreshData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef(null);
  const [boxCode, setBoxCode] = useState(null);

  useEffect(() => {
    const checkCameraAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setIsCameraReady(true);
      } catch (error) {
        console.error("Camera initialization error:", error);
        setCameraError(
          "Unable to access the camera. Please check your permissions or device."
        );
      }
    };
    checkCameraAccess();
    const storedBoxCode = localStorage.getItem("boxCode");
    if (storedBoxCode) {
      setBoxCode(storedBoxCode);
    } 
  }, []);

  // const capture = () => {
  //   if (webcamRef.current) {
  //     const image = webcamRef.current.getScreenshot();
  //     setImageSrc(image);
  //     setIsProcessing(true);

  //     // Simulate model output
  //     setTimeout(() => {
  //       setFreshData({
  //         category: "Fruit",
  //         produce: "Apple",
  //         fresh: "Yes",
  //         freshness_index: 0.95,
  //         shelf_life: "5 days",
  //       });
  //       setIsProcessing(false);
  //     }, 2000);
  //   } else {
  //     setCameraError("Camera is not ready.");
  //   }
  // };
  const capture = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
      handleImageProcessing(image);
    } else {
      setCameraError("Camera is not ready.");
    }
  };

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setImageSrc(reader.result);
  //       setIsProcessing(true);

  //       // Simulate model output
  //       setTimeout(() => {
  //         setFreshData({
  //           category: "Fruit",
  //           produce: "Apple",
  //           fresh: "Yes",
  //           freshness_index: 0.95,
  //           shelf_life: "5 days",
  //         });
  //         setIsProcessing(false);
  //       }, 2000);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        handleImageProcessing(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setFreshData(null);
    setIsProcessing(false);
  };

  const switchToPackedItems = () => {
    navigate("/packed-item");
  };

  const handleImageProcessing = async (image) => {
    setIsProcessing(true);
  
    const formData = new FormData();
    const blob = await fetch(image).then((r) => r.blob());
    formData.append("file", blob, "image.jpg");
    formData.append("box_code", boxCode); 
    console.log(boxCode);
  
    try {
      const response = await fetch(`${API}/detect_fruit`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
  
      if (response.ok) {
        const roundedFreshnessIndex = result.freshness_index.toFixed(2);
        
        setFreshData({
          category: result.category,               // "Vegetable" or "Fruit"
          produce: result.produce_type,            // "Potato", "Apple", etc.
          fresh: result.freshness,                 // "Moderately Fresh", "Yes", etc.
          freshness_index: roundedFreshnessIndex, // Freshness score (e.g., 5.95)
          shelf_life: `${result.shelf_life} days`, // Shelf life (e.g., "5 days")
        });
      } else {
        setCameraError("Failed to process the image. Please try again.");
      }
    } catch (error) {
      console.error("Error during image upload:", error);
      setCameraError("Network error. Please try again.");
    }
  
    setIsProcessing(false);
  };
  

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen">
      {/* Navbar */}
      <Navbar currentStep="Home > Box-code > Fresh Produce" />

      {/* Page Content */}
      <div className="flex flex-col items-center p-4 mt-16">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 text-blue-700">
          {isProcessing
            ? "Processing Image"
            : freshData
            ? "Fresh Produce Results"
            : "Capture or Upload Fresh Produce"}
        </h1>

        {cameraError && <p className="text-red-500">{cameraError}</p>}


        {!isProcessing && !freshData && (
  <div className="flex flex-col items-center gap-6 mt-6">
    {/* Camera Section (Webcam remains separate) */}
    {isCameraReady && (
      <div className="flex flex-col items-center gap-6">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className="border rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-full h-auto"
        />
      </div>
    )}

    {/* Buttons Section */}
    <div className="flex flex-col lg:flex-row items-center gap-6 w-full lg:justify-center">
      <button
        onClick={capture}
        className="bg-blue-500 hover:bg-blue-600 text-white 
                   text-sm sm:text-base lg:text-lg 
                   px-4 sm:px-6 lg:px-8 
                   py-2 sm:py-3 lg:py-3 
                   rounded-lg w-full sm:w-52  lg:w-auto"
      >
        Capture Image
      </button>

      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-gray-700 hover:bg-gray-800 text-white 
                   text-sm sm:text-base lg:text-lg 
                   px-4 sm:px-6 lg:px-8 
                   py-2 sm:py-3 lg:py-3 
                   rounded-lg w-full sm:w-52  lg:w-auto text-center"
      >
        Upload Image
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={switchToPackedItems}
        className="bg-[#FB641B] hover:bg-orange-600 text-white 
                   text-sm sm:text-base lg:text-lg 
                   px-4 sm:px-6 lg:px-8 
                   py-2 sm:py-3 lg:py-3 
                   rounded-lg w-full sm:w-52 lg:w-auto"
      >
        Detect Packed Items
      </button>
    </div>
  </div>
)}
        {isProcessing && imageSrc && (
          <div className="flex flex-col items-center">
            <img
              src={imageSrc}
              alt="Captured"
              className="mt-4 border rounded-lg shadow-lg w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 object-cover"
            />
            <p className="mt-4 text-blue-600 text-lg">Processing...</p>
          </div>
        )}

        {freshData && (
          <div className="mt-6 p-6 bg-white rounded-lg shadow-lg w-full max-w-xl">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Detection Results</h2>
            <div className="text-lg text-gray-700 space-y-2">
              <p>
                <strong>Category:</strong> {freshData.category}
              </p>
              <p>
                <strong>Produce:</strong> {freshData.produce}
              </p>
              <p>
                <strong>Fresh:</strong> {freshData.fresh}
              </p>
              <p>
                <strong>Freshness Index:</strong> {freshData.freshness_index}
              </p>
              <p>
                <strong>Shelf Life:</strong> {freshData.shelf_life}
              </p>
            </div>
            <div className="flex gap-4 mt-6 justify-center flex-row flex-wrap">             
              <button
              onClick={handleReset}
              className="bg-blue-500 hover:bg-blue-600 text-white 
                         text-sm sm:text-base lg:text-lg 
                         px-4 sm:px-6 lg:px-8 
                         py-2 sm:py-3 lg:py-3 
                         rounded-lg w-36 sm:w-52 lg:w-64"
            >
              Capture Another Image
            </button>
            <button
              onClick={switchToPackedItems}
              className="bg-[#FB641B] hover:bg-orange-600 text-white 
                         text-sm sm:text-base lg:text-lg 
                         px-4 sm:px-6 lg:px-8 
                         py-2 sm:py-3 lg:py-3 
                         rounded-lg w-36 sm:w-52 lg:w-64"
            >
              Detect Packed Items
            </button>
          </div> 
          </div>
        )}
      </div>
    </div>
  );
};

export default FreshProduce;
