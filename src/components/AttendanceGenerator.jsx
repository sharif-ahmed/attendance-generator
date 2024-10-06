import React, { useState } from "react";
import * as XLSX from "xlsx";

const AttendanceGenerator = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [dates, setDates] = useState([]);
  const [fileName, setFileName] = useState("");
  const [showTable, setShowTable] = useState(false);

  // Handle file upload and process data
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        processAttendanceData(content);
      };
      reader.readAsText(file);
    }
  };

  // Process the uploaded file data to extract attendance
  const processAttendanceData = (data) => {
    const lines = data.split("\n").map((line) => line.trim());
    const attendanceMap = {};
    const dates = [];

    // First pass: Collect dates
    lines.forEach((line) => {
      if (line.startsWith("Date:")) {
        const date = line.split(": ")[1];
        if (date) {
          dates.push(date);
        }
      }
    });

    // Second pass: Initialize attendance with 'A'
    lines.forEach((line) => {
      if (line.startsWith("Roll:")) {
        const rolls = line.split(": ")[1];
        if (rolls) {
          const rollNumbers = rolls.split(",").map((roll) => roll.trim());
          rollNumbers.forEach((roll) => {
            if (!attendanceMap[roll]) {
              attendanceMap[roll] = Array(dates.length).fill("A"); // Absent by default
            }
          });
        }
      }
    });

    // Third pass: Mark 'P' for present
    let dateIndex = -1;
    lines.forEach((line) => {
      if (line.startsWith("Date:")) {
        dateIndex++;
      } else if (line.startsWith("Roll:")) {
        const rolls = line.split(": ")[1];
        if (rolls) {
          const rollNumbers = rolls.split(",").map((roll) => roll.trim());
          rollNumbers.forEach((roll) => {
            attendanceMap[roll][dateIndex] = "P"; // Present
          });
        }
      }
    });

    setDates(dates);
    setAttendanceData(attendanceMap);
    setShowTable(true);
  };

  // Generate Excel sheet
  const handleGenerateExcel = () => {
    const header = ["Roll", ...dates, "Present Count", "Percentage"];
    const rows = [];

    for (const roll in attendanceData) {
      const presentCount = attendanceData[roll].filter((status) => status === "P").length;
      const percentage = presentCount > 0 ? (presentCount / dates.length) * 100 : 0;
      rows.push([roll, ...attendanceData[roll], presentCount, percentage.toFixed(2) + "%"]);
    }

    const finalData = [header, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "Attendance_Report.xlsx");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Sheet Generator</h1>

      {/* File Input */}
      <div className="mb-4">
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="border border-gray-300 p-2"
        />
        {fileName && <p className="mt-2">File: {fileName}</p>}
      </div>

      {/* Show Table */}
      {showTable && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Attendance Table</h2>
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Roll</th>
                {dates.map((date, index) => (
                  <th key={index} className="border border-gray-300 px-4 py-2">
                    {date}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2">Present Count</th>
                <th className="border border-gray-300 px-4 py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(attendanceData).map(([roll, statuses]) => {
                const presentCount = statuses.filter((status) => status === "P").length;
                const percentage = presentCount > 0 ? (presentCount / dates.length) * 100 : 0;
                return (
                  <tr key={roll}>
                    <td className="border border-gray-300 px-4 py-2">{roll}</td>
                    {statuses.map((status, index) => (
                      <td key={index} className="border border-gray-300 px-4 py-2">
                        {status}
                      </td>
                    ))}
                    <td className="border border-gray-300 px-4 py-2">{presentCount}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {percentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Generate Excel Button */}
          <button
            onClick={handleGenerateExcel}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Excel Report
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceGenerator;
