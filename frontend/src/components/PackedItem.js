import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Navbar from "./Navbar";
const API = process.env.REACT_APP_API_URL

const PackedItem = () => {
  const navigate=useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frontResults, setFrontResults] = useState(null);
  const [backResults, setBackResults] = useState(null);
  const [capturingBack, setCapturingBack] = useState(false);
  const [currentStep, setCurrentStep] = useState("Home > Packed Item > Front");
  const webcamRef = useRef(null);
  const [boxCode, setBoxCode] = useState(null);

  // Check camera access on component mount
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

  const updateBreadcrumb = (step) => {
    // Helper function to update the breadcrumb
    setCurrentStep(`Home > Packed Item > ${step}`);
  };

  // Capture the front side
  // const captureFront = () => {
  //   if (webcamRef.current) {
  //     const image = webcamRef.current.getScreenshot();
  //     setImageSrc(image);
  //     setIsProcessing(true);

  //     // Simulate processing front side results
  //     setTimeout(() => {
  //       setFrontResults({ brand: "Example Brand" });
  //       setIsProcessing(false);
  //       updateBreadcrumb("Front Result");
  //     }, 2000);
  //   } else {
  //     setCameraError("Camera is not ready.");
  //   }
  // };

  const captureFront = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
      handleImageProcessingFront(image);
      updateBreadcrumb("Front Result");
    } else {
      setCameraError("Camera is not ready.");
    }
  };


  // Capture the back side
  // const captureBack = () => { 
  //   if (webcamRef.current) {
  //     updateBreadcrumb("Front > Back"); 
  //     const image = webcamRef.current.getScreenshot();
  //     setImageSrc(image);
  //     setIsProcessing(true);

  //     // Simulate processing back side results
  //     setTimeout(() => {
  //       setBackResults({
  //         expiry_date: "2024-12-31",
  //         expired: "No",
  //         expected_life_span: "12 months",
  //       });
  //       setIsProcessing(false);
  //       setCapturingBack(false);
  //       updateBreadcrumb("Result"); 
  //     }, 2000);
  //   } else {
  //     setCameraError("Camera is not ready.");
  //   }
  // };
  const captureBack = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
      setCapturingBack(false);
      handleImageProcessingBack(image);
      updateBreadcrumb("Result"); 
    } else {
      setCameraError("Camera is not ready.");
    }
  };

  // const handleUpload = (event, side) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImageSrc(reader.result); // Set the image preview
  //       setIsProcessing(true);

  //       // Simulate processing results based on which side is being uploaded
  //       setTimeout(() => {
  //         if (side === "front") {
  //           setFrontResults({ brand: "Uploaded Brand" }); // Simulated result for front
  //           updateBreadcrumb("Front Result");
  //         } else if (side === "back") {
  //           setBackResults({
  //             expiry_date: "2024-12-31",
  //             expired: "No",
  //             expected_life_span: "12 months",
  //           }); // Simulated result for back
  //           updateBreadcrumb("Back Result");
  //         }
  //         setIsProcessing(false);
  //         if (side === "back") {
  //           setCapturingBack(false);  // Stop capturing back
  //         }
  //       }, 2000);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleUpload = (event, side) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
          if (side === "front") {
            handleImageProcessingFront(reader.result);
            updateBreadcrumb("Front Result");
          } else if (side === "back") {
            setCapturingBack(false);
            handleImageProcessingBack(reader.result);
            updateBreadcrumb("Back Result");
          }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset state to capture another image
  const handleReset = () => {
    setImageSrc(null);
    setFrontResults(null);
    setBackResults(null);
    setCapturingBack(false);
    setIsProcessing(false);
    updateBreadcrumb("Front");
  };

  // Switch to fresh items detection
  const switchToFreshItems = () => {
    navigate("/fresh-produce")
  };

  const handleImageProcessingFront = async (image) => {
    setIsProcessing(true);
  
    const formData = new FormData();
    const blob = await fetch(image).then((r) => r.blob());
    formData.append("file", blob, "image.jpg");
    formData.append("box_code", boxCode); 
    console.log(boxCode);
  
    try {
      const response = await fetch(`${API}/detect_front_side`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
  
      if (response.ok) {
        setFrontResults({ brand: result.brand });
      } else {
        setCameraError("Failed to process the image. Please try again.");
      }
    } catch (error) {
      console.error("Error during image upload:", error);
      setCameraError("Network error. Please try again.");
    }
  
    setIsProcessing(false);
  };

  const handleImageProcessingBack = async (image) => {
    setIsProcessing(true);
  
    const formData = new FormData();
    const blob = await fetch(image).then((r) => r.blob());
    formData.append("file", blob, "image.jpg");
    formData.append("box_code", boxCode); 
    console.log(boxCode);
  
    try {
      const response = await fetch(`${API}/detect_back_side`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
  
      if (response.ok) {
        setBackResults({
            expiry_date: result.expiry_date,
            expired: result.expired,
            expected_life_span: result.expected_life_span,
            manufacturing_date: result.manufacturing_date,

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
    {/* Navbar with dynamic breadcrumb */}
    <Navbar currentStep={currentStep} />

    {/* Page Content */}
    <div className="flex flex-col items-center p-4 mt-16">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 text-blue-700">
        {isProcessing
          ? "Processing Image"
          : capturingBack
          ? "Capture Packed Item: Back"
          : backResults
          ? "Overall Results"
          : frontResults
          ? "Front Results"
          : "Capture Packed Item: Front"}
      </h1>

      {cameraError && <p className="text-red-500">{cameraError}</p>}

      {/* Camera Section */}
      {!isProcessing && isCameraReady && (
  <>
    {(!frontResults && !capturingBack && !backResults) || capturingBack ? (
      <div className="flex flex-col items-center gap-6 mt-6">
        {/* Webcam Section */}
        <div className="flex flex-col items-center gap-6">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className="border rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-full h-auto"
        />
      </div>
        
        {/* Buttons Section */}
        <div className="flex flex-col lg:flex-row items-center gap-6 w-full lg:justify-center">
          <button
            onClick={capturingBack ? captureBack : captureFront}
            className="bg-blue-500 hover:bg-blue-600 text-white 
                       text-sm sm:text-base lg:text-lg 
                       px-4 sm:px-6 lg:px-8 
                       py-2 sm:py-3 lg:py-3 
                       rounded-lg w-full sm:w-52  lg:w-auto"
          >
            {capturingBack ? "Capture Back Side" : "Capture Front Side"}
          </button>

          {/* Upload Image Section */}
          <div className="flex flex-col items-center w-full lg:w-auto">
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
              onChange={(e) => handleUpload(e, capturingBack ? "back" : "front")}
              className="hidden"
            />
          </div>

          <button
            onClick={switchToFreshItems}
            className="bg-[#F09500] hover:bg-yellow-500 text-white 
                       text-sm sm:text-base lg:text-lg 
                       px-4 sm:px-6 lg:px-8 
                       py-2 sm:py-3 lg:py-3 
                       rounded-lg w-full sm:w-52  lg:w-auto"
          >
            Detect Fresh Items
          </button>
        </div>
      </div>
    ) : null}
  </>
)}

      {/* Processing Section */}
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

      {/* Front Results Section */}
      {frontResults && !backResults && !isProcessing && !capturingBack && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg w-full max-w-xl">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Detected Results</h2>
          <div className="text-lg text-gray-700 space-y-2">
            <p>
              <strong>Brand:</strong> {frontResults.brand}
            </p>
          </div>
          <div className="flex gap-4 sm:gap-6 mt-6 justify-center flex-wrap">
  <button
    onClick={() => setCapturingBack(true)}
    className="bg-blue-500 hover:bg-blue-600 text-white 
               px-6 sm:px-8 py-2 sm:py-3 
               rounded-lg sm:rounded-xl shadow-lg 
               text-base sm:text-lg transition-all hover:scale-105 
               w-48 sm:w-64"
  >
    Capture Back Side
  </button>
  <button
    onClick={handleReset}
    className="bg-[#FB641B] hover:bg-orange-600 text-white 
               px-6 sm:px-8 py-2 sm:py-3 
               rounded-lg sm:rounded-xl shadow-lg 
               text-base sm:text-lg transition-all hover:scale-105 
               w-48 sm:w-64"
  >
    Capture Another Image
  </button>
  <button
    onClick={switchToFreshItems}
    className="bg-[#F09500] hover:bg-yellow-500 text-white 
               px-6 sm:px-8 py-2 sm:py-3 
               rounded-lg sm:rounded-xl shadow-lg 
               text-base sm:text-lg transition-all hover:scale-105 
               w-48 sm:w-64"
  >
    Detect Fresh Items
  </button>
</div>
        </div>
      )}

      {/* Final Results Section */}
      {backResults && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg w-full max-w-xl">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Detected Results
          </h2>
          <div className="text-lg text-gray-700 space-y-2">
            <p>
              <strong>Brand:</strong> {frontResults.brand}
            </p>
            <p>
              <strong>ManuFacturing Date:</strong> {backResults.manufacturing_date}
            </p>
            <p>
              <strong>Expiry Date:</strong> {backResults.expiry_date}
            </p>
            <p>
              <strong>Expired:</strong> {backResults.expired}
            </p>
            <p>
              <strong>Expected Life Span:</strong> {backResults.expected_life_span}
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
              onClick={switchToFreshItems}
              className="bg-[#F09500] hover:bg-yellow-500 text-white 
                           text-sm sm:text-base lg:text-lg 
                           px-4 sm:px-6 lg:px-8 
                           py-2 sm:py-3 lg:py-3 
                           rounded-lg w-36 sm:w-52 lg:w-64"
            >
              Detect Fresh Items
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default PackedItem;

