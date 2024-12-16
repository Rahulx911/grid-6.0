import React, { useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
const API=process.env.REACT_APP_API_URL


const BoxReport = () => {
  const navigate = useNavigate();
  const { boxCode } = useParams(); // Get the boxCode from the URL
  const [packedItems, setPackedItems] = useState([]);
  const [freshProduce, setFreshProduce] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoxReport = async () => {
      try {
        const response = await fetch(`${API}/box-report/${boxCode}`); // Replace with your backend URL
        if (!response.ok) {
          throw new Error("Failed to fetch box report");
        }
        const data = await response.json();
        console.log(data);
        setPackedItems(data.packedItems || []);
        setFreshProduce(data.freshProduce || []);
      } catch (error) {
        console.error("Error fetching box report:", error);
        setError("Failed to load box report. Please try again.");
      }
    };

    fetchBoxReport();
  }, [boxCode]);


  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar currentStep={`Home > Report > ${boxCode}`} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Heading */}
        <div className="flex items-center gap-4 mb-8 mt-20">
          <button
            onClick={() => navigate("/report")}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 text-base sm:text-lg font-semibold"
          >
            Back
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 text-center flex-grow">
            Report for <span className="text-blue-600">{boxCode}</span>
          </h1>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Packed Items */}
        <div className="mb-10">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
            Packed Items
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
            {packedItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
              >
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    {item.brand}
                  </h3>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
                <div className="text-sm text-gray-800">
                  <p>Count: {item.count}</p>
                  <p>Mfd Date: {item.manufacturingDate}</p>
                  <p>Expiry Date: {item.expiryDate}</p>
                  <p>Expired: {item.expired}</p>
                  <p>Life Span: {item.lifeSpan}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse rounded-lg shadow-lg text-sm sm:text-base lg:text-xl">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left w-1/8">Timestamp</th>
                  <th className="p-3 text-left w-3/12 break-words">Brand</th>
                  <th className="p-3 text-left w-1/7">Mfd Date</th>
                  <th className="p-3 text-left w-1/7">Expiry Date</th>
                  <th className="p-3 text-left w-1/12">Count</th>
                  <th className="p-3 text-left w-1/12">Expired</th>
                  <th className="p-3 text-left w-1/12">Life Span</th>
                </tr>
              </thead>
              <tbody>
                {packedItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                    } border-b`}
                  >
                    <td className="p-3 truncate">{item.timestamp}</td>
                    <td className="p-3 break-words whitespace-normal">{item.brand}</td>
                    <td className="p-3 truncate">{item.manufacturingDate}</td>
                    <td className="p-3 truncate">{item.expiryDate}</td>
                    <td className="p-3 truncate">{item.count}</td>
                    <td className="p-3 truncate">{item.expired}</td>
                    <td className="p-3 truncate">{item.lifeSpan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fresh Produce */}
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
            Fresh Produce
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
            {freshProduce.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
              >
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    {item.category} - {item.produce}
                  </h3>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
                <div className="text-sm text-gray-800">
                  <p>Freshness: {item.freshness}</p>
                  <p>Index: {item.index}</p>
                  <p>Life Span: {item.lifeSpan}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse rounded-lg shadow-lg text-sm sm:text-base  lg:text-xl">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">Timestamp</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Produce</th>
                  <th className="p-3 text-left">Freshness</th>
                  <th className="p-3 text-left">Index</th>
                  <th className="p-3 text-left">Life Span</th>
                </tr>
              </thead>
              <tbody>
                {freshProduce.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                    } border-b`}
                  >
                    <td className="p-3">{item.timestamp}</td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">{item.produce}</td>
                    <td className="p-3">{item.freshness}</td>
                    <td className="p-3">{item.index}</td>
                    <td className="p-3">{item.lifeSpan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxReport;
