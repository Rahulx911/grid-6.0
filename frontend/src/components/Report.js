import React from 'react';

const Report = () => {
  // Example of what your report data might look like
  const reportData = [
    { id: 1, product: "Product A", mrp: "50", date: "01/01/2024" },
    { id: 2, product: "Product B", mrp: "60", date: "02/01/2024" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Report</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">S.No</th>
            <th className="py-2">Product</th>
            <th className="py-2">MRP</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={item.id} className="border-t">
              <td className="py-2">{index + 1}</td>
              <td className="py-2">{item.product}</td>
              <td className="py-2">{item.mrp}</td>
              <td className="py-2">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Report;
