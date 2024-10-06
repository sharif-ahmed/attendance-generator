// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const AttendanceEditor = () => {
    const [editorContent, setEditorContent] = useState('');
    const [attendanceData, setAttendanceData] = useState({});
    const [dates, setDates] = useState([]);

    // Handle file upload
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            // Read the file content as text
            reader.onload = (e) => {
                const content = e.target.result;
                setEditorContent(content); // Populate the editor with the file content
                processAttendance(content); // Process file content
            };

            reader.readAsText(file);
        }
    };

    // Handle manual changes in the editor
    const handleEditorChange = (event) => {
        const content = event.target.value;
        setEditorContent(content);
        processAttendance(content); // Process manual input
    };

    // Function to process the attendance data
    const processAttendance = (content) => {
        const lines = content.split('\n').map(line => line.trim());
        const data = {};
        const dateList = [];
        let currentDate = null;

        // Parse the input
        lines.forEach((line) => {
            if (line.startsWith('Date:')) {
                currentDate = line.split(': ')[1].trim();
                dateList.push(currentDate);
            } else if (line.startsWith('Roll:')) {
                const rolls = line.split(': ')[1].split(',').map(roll => roll.trim());
                rolls.forEach(roll => {
                    if (!data[roll]) {
                        data[roll] = Array(dateList.length).fill('A'); // Default 'A' (Absent)
                    }
                    data[roll][dateList.length - 1] = 'P'; // Mark 'P' (Present) for this date
                });
            }
        });

        setAttendanceData(data);
        setDates(dateList);
    };

    // Process the content and generate Excel file
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!editorContent) {
            alert('Please enter or upload attendance data');
            return;
        }

        // Prepare data for Excel export
        const header = ['Roll', ...dates, 'Present Count', 'Percentage'];
        const rows = [];

        for (const roll in attendanceData) {
            const presentCount = attendanceData[roll].filter(status => status === 'P').length;
            const percentage = (presentCount / dates.length) * 100;

            rows.push([roll, ...attendanceData[roll], presentCount, percentage.toFixed(2) + '%']);
        }

        const finalData = [header, ...rows];

        // Export to Excel
        const worksheet = XLSX.utils.aoa_to_sheet(finalData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, 'Attendance_Report.xlsx');

        console.log('Attendance report generated successfully!');
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Attendance Editor</h2>

            {/* Textarea to allow manual editing of text */}
            <textarea 
                value={editorContent} 
                onChange={handleEditorChange} 
                rows="10" 
                className="w-full border-2 border-gray-300 p-2 rounded mb-4"
                placeholder={`Enter or upload attendance data in the format:\nDate: 2024-09-28\nRoll: 101, 102, 103`}
            />
            
            <br />

            {/* File input for uploading a .txt file */}
            <input 
                type="file" 
                accept=".txt" 
                onChange={handleFileChange}
                className="mb-4"
            />
            <br />

            {/* Button to process the data and generate Excel */}
            <button 
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all duration-200"
            >
                Generate Excel
            </button>

            <h2 className="text-2xl font-bold mt-8 mb-4">Attendance Table</h2>
            {dates.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse block md:table">
                        <thead className="block md:table-header-group">
                            <tr className="border md:border-none block md:table-row absolute -top-full md:relative">
                                <th className="p-2 text-left md:border md:border-gray-300 block md:table-cell">Roll</th>
                                {dates.map((date, index) => (
                                    <th key={index} className="p-2 text-left md:border md:border-gray-300 block md:table-cell">
                                        {date}
                                    </th>
                                ))}
                                <th className="p-2 text-left md:border md:border-gray-300 block md:table-cell">Present Count</th>
                                <th className="p-2 text-left md:border md:border-gray-300 block md:table-cell">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="block md:table-row-group">
                            {Object.keys(attendanceData).map((roll, index) => {
                                const presentCount = attendanceData[roll].filter(status => status === 'P').length;
                                const percentage = (presentCount / dates.length) * 100;

                                return (
                                    <tr key={index} className="block md:table-row">
                                        <td className="p-2 md:border md:border-gray-300 block md:table-cell">{roll}</td>
                                        {attendanceData[roll].map((status, idx) => (
                                            <td key={idx} className="p-2 md:border md:border-gray-300 block md:table-cell text-center">
                                                {status}
                                            </td>
                                        ))}
                                        <td className="p-2 md:border md:border-gray-300 block md:table-cell text-center">{presentCount}</td>
                                        <td className="p-2 md:border md:border-gray-300 block md:table-cell text-center">
                                            {percentage.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AttendanceEditor;
