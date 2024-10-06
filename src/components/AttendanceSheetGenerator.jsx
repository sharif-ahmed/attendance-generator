// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import logo from '../assets/attendance-logo.webp'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AttendanceSheetGenerator = () => {
    const [activeTab, setActiveTab] = useState("upload");
    const [fileName, setFileName] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [textContent, setTextContent] = useState("");
    const [showTable, setShowTable] = useState(false);
    const [dates, setDates] = useState([]);
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 10

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                setTextContent(content);
                processAttendanceData(content);
            };
            reader.readAsText(file);
        }
    };

    const handleTextChange = (event) => {
        setTextContent(event.target.value);
    };


    const handleShowDetails = () => {
        processAttendanceData(textContent);
        setShowTable(true);
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


    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const totalPages = Math.ceil(Object.keys(attendanceData).length / rowsPerPage)
    const currentPageData = Object.entries(attendanceData).slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-500 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                        <div className="flex items-center justify-center mb-4">
                            <img
                                src={logo}
                                alt="Heakow Banani Degree College Logo"
                                className="h-[100px] w-[100px] rounded-full bg-white p-2 shadow-lg"
                            />
                        </div>

                        {/* <h1 className="text-3xl font-bold text-center mb-2">Heakow Banani Degree College</h1> */}
                        <h2 className="text-xl font-semibold text-center mb-[4px]">
                            Attendance Sheet Generator
                        </h2>
                        <h4 className="text-[9px] text-center">Made By Sharif Ahmed</h4>
                        <h6 className="text-[9px] text-center">Lecturer,ICT</h6>
                        <h6 className="text-[9px] text-center">Heako Banani Degree College</h6>
                    </div>
                    <div className="p-6">
                        <div className="mb-6">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab("upload")}
                                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${activeTab === "upload" ? "bg-white shadow-md" : ""
                                        }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 inline-block mr-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Upload File
                                </button>
                                <button
                                    onClick={() => setActiveTab("write")}
                                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${activeTab === "write" ? "bg-white shadow-md" : ""
                                        }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 inline-block mr-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Write Text
                                </button>
                            </div>
                        </div>
                        {activeTab === "upload" && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".txt"
                                    />
                                    <button
                                        onClick={() =>
                                            document.getElementById("file-upload").click()
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-300 flex items-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-2"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Choose File
                                    </button>
                                    {fileName && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-sm text-gray-500"
                                        >
                                            {fileName}
                                        </motion.span>
                                    )}
                                </div>
                                {textContent && (
                                    <textarea
                                        value={textContent}
                                        readOnly
                                        className="w-full h-64 mt-4 p-2 bg-gray-50 border border-gray-200 rounded-md"
                                        placeholder="File content will appear here"
                                    />
                                )}
                            </div>
                        )}
                        {activeTab === "write" && (
                            <div className="space-y-4">
                                <textarea
                                    value={textContent}
                                    onChange={handleTextChange}
                                    className="w-full h-64 p-2 bg-gray-50 border border-gray-200 rounded-md"
                                    placeholder="Enter attendance data here. Format:
Date 1: DD-MM-YYYY
Roll: 1,2,3,4,5,....

Date 2: DD-MM-YYYY
Roll: 1,2,3,4,5,....

Date 3: DD-MM-YYYY
Roll: 1,2,3,4,5,....
"
                                />
                            </div>
                        )}
                        <div className="flex items-center justify-center mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-500 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-sm text-blue-700">
                                File Format: Start each date with &apos;Date:&apos; followed by
                                the date (DD-MM-YYYY). List each present student&apos;s roll
                                number with &apos;Roll:&apos; on a new line.<br />
                            </p>
                        </div>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button
                                onClick={handleGenerateExcel}
                                className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-md transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Generate Excel
                            </button>
                            <button
                                onClick={handleShowDetails}
                                className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-md transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Show Details
                            </button>
                        </div>
                        {/* <AnimatePresence>
              {showTable && attendanceData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 overflow-x-auto bg-white rounded-lg shadow-md"
                >
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll
                        </th>
                        {Object.keys(attendanceData[0].dates).map((date) => (
                          <th
                            key={date}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {date}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceData.map((student, index) => (
                        <tr
                          key={student.roll}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.roll}
                          </td>
                          {Object.entries(student.dates).map(
                            ([date, present]) => (
                              <td
                                key={date}
                                className={`px-6 py-4 whitespace-nowrap text-sm ${
                                  present ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {present ? "P" : "A"}
                              </td>
                            )
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${student.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 mt-1">
                              {student.percentage.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence> */}
                        {/* Show Table */}
                        {showTable && (
                            <>
                                <div className="mt-4 overflow-x-auto">
                                    <h2 className="text-xl uppercase font-semibold mb-4">Attendance Table</h2>
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
                                        {/* <tbody>
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
                                    </tbody> */}
                                        <tbody>
                                            {currentPageData.map(([roll, statuses]) => {
                                                const presentCount = statuses.filter((status) => status === "P").length
                                                const percentage = presentCount > 0 ? (presentCount / dates.length) * 100 : 0
                                                return (
                                                    <tr key={roll}>
                                                        <td className="border px-4 py-2 sticky-column">{roll}</td>
                                                        {statuses.map((status, index) => (
                                                            <td key={index} className="border px-4 py-2">{status}</td>
                                                        ))}
                                                        <td className="border px-4 py-2">{presentCount}</td>
                                                        <td className="border px-4 py-2">{percentage.toFixed(2)}%</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>

                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex align-items-center justify-center bg-gray-200 py-2 px-4 rounded-md"
                                    >
                                        {/* <ChevronLeft className="mr-2 h-4 w-4" /> Previous */}
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex align-items-center justify-center bg-gray-200 py-2 px-4 rounded-md"
                                    >
                                        Next <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AttendanceSheetGenerator;
