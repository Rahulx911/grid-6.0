import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; 
const API = process.env.REACT_APP_API_URL


const Report = () => {
  const navigate = useNavigate();

  const [boxReports, setBoxReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBoxes, setFilteredBoxes] = useState([]);

  useEffect(() => {
    const fetchBoxReports = async () => {
      try {
        const response = await fetch(`${API}/box-reports`);
        if (!response.ok) {
          throw new Error("Failed to fetch box reports");
        }
        const data = await response.json();
        setBoxReports(data);
        setFilteredBoxes(data);
      } catch (error) {
        console.error("Error fetching box reports:", error);
      }
    };

    fetchBoxReports();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = boxReports.filter((box) =>
      box.boxCode.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBoxes(filtered);
  };

  const handleAutocompleteSelect = (boxCode) => {
    setSearchTerm(boxCode);
    setFilteredBoxes(boxReports.filter((box) => box.boxCode === boxCode));
  };


  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar currentStep="Home > Report" /> {/* Navbar with breadcrumb */}

      {/* Main Content */}
      <div className="flex-grow px-4 sm:px-6 lg:px-8 py-10 lg:py-16"> {/* Dynamic padding */}
        {/* Heading and Search */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 mt-8">
            Report
          </h1>
          <div className="relative flex justify-center items-center gap-4">
          <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg">
          <input
                type="text"
                placeholder="Search Box Code"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base lg:text-lg"
              />
            {searchTerm && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {filteredBoxes.map((box, index) => (
                    <div
                      key={index}
                      onClick={() => handleAutocompleteSelect(box.boxCode)}
                      className="cursor-pointer p-2 hover:bg-gray-100 text-gray-700"
                    >
                      {box.boxCode}
                    </div>
                  ))}
                </div>
              )}
          </div>
          <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm sm:text-base lg:text-lg"
              onClick={() => setFilteredBoxes(filteredBoxes)} // Updated logic
              disabled={!searchTerm}
            >
              Search
            </button>
            </div>
        </div>

        {/* Box Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {filteredBoxes.map((box, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1"
              style={{ width: "100%", maxWidth: "24rem", margin: "0 auto" }}
            >
              <h2 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-800 mb-3">
                {box.boxCode}
              </h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-4">
                Total Objects:{" "}
                <span className="font-bold text-gray-800">{box.totalObjects}</span>
              </p>
              <button
                onClick={() => navigate(`/report/${box.boxCode}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm sm:text-base lg:text-lg font-semibold"
              >
                View Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Report;
