// import React, { useState, useCallback } from 'react';
// import Webcam from 'react-webcam';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const CaptureImage = () => {
//   const [boxCode, setBoxCode] = useState('');
//   const [imageSrc, setImageSrc] = useState(null);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [step, setStep] = useState(0);
//   const [ocrOutput, setOcrOutput] = useState('');
//   const [totalObjects, setTotalObjects] = useState(null);
//   const [fruitData, setFruitData] = useState(null);
//   const webcamRef = React.useRef(null);
//   const navigate = useNavigate();
//   const API_URL = process.env.REACT_APP_API_URL;

//   const capture = useCallback(() => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     setImageSrc(imageSrc);

//     if (step === 2) {
//       // Full cart detection
//       sendFullCartImageToBackend(imageSrc);
//     } else if (step === 4 && selectedOption === 'packed') {
//       // Front-side detection for packed item
//       sendFrontImageToBackend(imageSrc);
//     } else if (step === 5 && selectedOption === 'packed') {
//       // Back-side detection for packed item
//       sendBackImageToBackend(imageSrc);
//     } else if (step === 4 && selectedOption === 'fruits') {
//       // Fruits/vegetables detection
//       sendFruitImageToBackend(imageSrc);
//     }
//   }, [webcamRef, step, selectedOption]);

//   const sendFullCartImageToBackend = async (imageSrc) => {
//     try {
//         // Convert base64 to Blob
//         const blob = await fetch(imageSrc).then((res) => res.blob());
//         console.log('Blob size:', blob.size); // Log Blob details for debugging

//         const formData = new FormData();
//         formData.append('file', blob, 'captured_image.jpg'); // Specify file name explicitly
//         formData.append('boxCode', boxCode);

//         // Check FormData content
//         for (let pair of formData.entries()) {
//             console.log(pair[0] + ':', pair[1]);
//         }

//         // Let the browser set Content-Type header for multipart/form-data
//         const response = await axios.post(`${API_URL}/detect_objects`, formData);

//         setTotalObjects(response.data.total_objects);
//         setStep(3);
//         alert(`Total objects detected: ${response.data.total_objects}.`);
//     } catch (error) {
//         console.error('Error detecting objects in full cart:', error);
//         alert('Failed to process the image. Please try again.');
//     }
//   };




//   const sendFrontImageToBackend = async (imageSrc) => {
//     try {
//       const blob = await fetch(imageSrc).then((res) => res.blob());
//       const formData = new FormData();
//       formData.append('file', blob, 'captured_image.jpg');
//       formData.append('boxCode', boxCode);

//       const response = await axios.post(`${API_URL}/detect_front_side`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       const filteredTexts = response.data.detected_texts.filter(text => text !== "No text detected");
//       setOcrOutput(filteredTexts.join('\n'));
//       setStep(5); // Proceed to capture back image
//       alert('Front image processed. Please capture the back side image.');
//     } catch (error) {
//       console.error('Error sending front-side image to backend:', error);
//       alert('Failed to process the image. Please try again.');
//     }
//   };

//   const sendBackImageToBackend = async (imageSrc) => {
//     try {
//       const blob = await fetch(imageSrc).then((res) => res.blob());
//       const formData = new FormData();
//       formData.append('file', blob, 'captured_image.jpg');
//       formData.append('boxCode', boxCode);

//       const response = await axios.post(`${API_URL}/detect_back_side`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       setOcrOutput(response.data.analyzed_text);
//       setStep(3); // Return to choose packed item or fruit
//       alert('Back image processed. Choose the next item type (Packed Item or Fruits/Vegetables).');
//     } catch (error) {
//       console.error('Error sending back-side image to backend:', error);
//       alert('Failed to process the image. Please try again.');
//     }
//   };

//   const sendFruitImageToBackend = async (imageSrc) => {
//     try {
//       const blob = await fetch(imageSrc).then((res) => res.blob());
//       const formData = new FormData();
//       formData.append('file', blob, 'captured_image.jpg');
//       formData.append('boxCode', boxCode);

//       const response = await axios.post(`${API_URL}/detect_fruit`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       setFruitData(response.data);
//       alert(`Detected: ${response.data.produce_type}, Freshness: ${response.data.freshness}, Shelf Life: ${response.data.shelf_life}`);
//       setStep(3); // Return to choose packed item or fruit
//     } catch (error) {
//       console.error('Error detecting fruit/vegetable:', error);
//       alert('Failed to process the image. Please try again.');
//     }
//   };

//   const handleOptionChange = (event) => {
//     setSelectedOption(event.target.value);
//     setStep(4);
//     alert(`You selected ${event.target.value}. Please capture the front image.`);
//   };

//   const handleStart = () => {
//     if (boxCode) {
//       setStep(2);
//       alert('Please capture the full cart image.');
//     } else {
//       alert('Please enter a valid Box Code.');
//     }
//   };

//   const handleNewBox = () => {
//     setBoxCode('');
//     setImageSrc(null);
//     setSelectedOption(null);
//     setStep(0);
//     setOcrOutput('');
//     setTotalObjects(null);
//     setFruitData(null);
//     alert('Starting a new process. Please enter a new Box Code.');
//   };

//   return (
//     <div className="flex flex-col items-center p-6">
//       <div className="flex justify-between w-full mb-4">
//         <button
//           className="bg-gray-500 text-white px-4 py-2 rounded"
//           onClick={() => navigate('/')}
//         >
//           Home
//         </button>
//         <button
//           className="bg-red-500 text-white px-4 py-2 rounded"
//           onClick={handleNewBox}
//         >
//           New Box
//         </button>
//       </div>

//       {step === 0 && (
//         <div className="mb-4">
//           <input
//             type="text"
//             placeholder="Enter Box Code"
//             value={boxCode}
//             onChange={(e) => setBoxCode(e.target.value)}
//             className="p-2 border rounded"
//           />
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
//             onClick={handleStart}
//           >
//             Start
//           </button>
//         </div>
//       )}

//       {step === 3 && (
//         <div className="mt-4">
//           <label className="block">
//             <input
//               type="radio"
//               value="packed"
//               checked={selectedOption === 'packed'}
//               onChange={handleOptionChange}
//             />
//             Packed Item
//           </label>

//           <label className="block">
//             <input
//               type="radio"
//               value="fruits"
//               checked={selectedOption === 'fruits'}
//               onChange={handleOptionChange}
//             />
//             Fruits/Vegetables
//           </label>
//         </div>
//       )}

//       {step > 1 && (
//         <>
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/jpeg"
//             videoConstraints={{ facingMode: "environment" }} // Back camera configuration
//             width={320}
//             height={240}
//             className="border rounded-lg shadow-lg"
//           />
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
//             onClick={capture}
//           >
//             Capture Image
//           </button>
//         </>
//       )}

//       {imageSrc && (
//         <div className="mt-4">
//           <h2 className="text-lg">Captured Image</h2>
//           <img src={imageSrc} alt="Captured" className="mt-2 border rounded-lg shadow-lg" />
//         </div>
//       )}

//       {ocrOutput && (
//         <div className="mt-4">
//           <h2 className="text-lg">Edit OCR Output</h2>
//           <textarea
//             className="p-2 border rounded w-full"
//             value={ocrOutput}
//             onChange={(e) => setOcrOutput(e.target.value)}
//           />
//           <button className="bg-green-500 text-white px-4 py-2 rounded mt-2">
//             Submit OCR Data
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CaptureImage;


import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const CaptureImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [outputData, setOutputData] = useState(null);
  const webcamRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = process.env.REACT_APP_API_URL;

  // Retrieve the boxCode from the location state (passed from EnterBoxCode page)
  const boxCode = location.state?.boxCode;

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setSelectedFile(null); // Clear uploaded file if using webcam
    sendFullCartImageToBackend(imageSrc);
  }, [webcamRef]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setImageSrc(URL.createObjectURL(event.target.files[0]));
  };

  const sendFullCartImageToBackend = async (imageSrc) => {
    if (!boxCode) {
      alert('Box code is missing. Please go back and enter the box code.');
      return;
    }

    try {
      setIsLoading(true);
      let formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile, selectedFile.name);
      } else {
        const blob = await fetch(imageSrc).then((res) => res.blob());
        formData.append('file', blob, 'captured_image.jpg');
      }
      formData.append('boxCode', boxCode);

      const response = await axios.post(`${API_URL}/detect_objects`, formData);
      setOutputData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error detecting objects in full cart:', error);
      setIsLoading(false);
      alert('Failed to process the image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_URL}/save_data`, {
        boxCode,
        totalObjects: outputData.total_objects,
        outputData,
      });
      alert('Data saved successfully.');
      navigate('/select-item-type', { state: { boxCode } });
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex justify-between w-full mb-4">
        <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => navigate('/')}>
          Home
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
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => sendFullCartImageToBackend(imageSrc)}>
            Upload Image
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4">
          <p>Loading... Please wait.</p>
        </div>
      )}

      {outputData && (
        <div className="mt-4 p-4 border rounded-lg shadow-lg">
          <h2 className="text-lg mb-2">Detection Results</h2>
          <p>Total Objects Detected: {outputData.total_objects}</p>
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-4" onClick={handleSubmit}>
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

export default CaptureImage;
