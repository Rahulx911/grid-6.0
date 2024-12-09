import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#f1f3f6] px-4">
      <h1 className="text-3xl sm:text-xl lg:text-5xl font-bold mb-10 text-center text-[#2874f0] ">
        Welcome to Product Detailer
      </h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="bg-[#2874f0] hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg"
          onClick={() => navigate("/enter-box-code")}
        >
          Capture Image
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg"
          onClick={() => navigate("/report")}
        >
          See Report
        </button>
      </div>
    </div>
  );
};

export default HomePage;
