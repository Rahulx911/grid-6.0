
import React, { useState } from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import { useNavigate } from "react-router-dom";

const EnterBoxCode = () => {
  const [boxCode, setBoxCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleStart = () => {
    if (boxCode.trim() === "") {
      setError("Box code cannot be empty.");
    } else if (!/^[a-zA-Z0-9]+$/.test(boxCode)) {
      setError("Box code can only contain letters and numbers.");
    } else {
      setError("");
      localStorage.setItem("boxCode", boxCode);
      navigate("/capture");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Navbar Component */}
      <Navbar currentStep="Home > Enter Box Code" />

      {/* Page Content */}
      <div className="w-full max-w-lg px-4 mt-10"> {/* Add margin to account for Navbar */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Enter Box Code</h1>
        <input
          type="text"
          placeholder="Enter your box code (e.g., BOX1, 1234, ABC123)"
          value={boxCode}
          onChange={(e) => setBoxCode(e.target.value)}
          className="w-full p-3 border rounded-lg text-lg"
        />
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        <button
          className="bg-blue-500 text-white text-lg font-semibold px-6 py-3 rounded-lg mt-4 w-full hover:bg-blue-600 transition duration-300"
          onClick={handleStart}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default EnterBoxCode;
