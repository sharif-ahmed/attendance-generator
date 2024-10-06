import React, { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"

function ATPagination() {
  const [activeTab, setActiveTab] = useState("upload")
  const [fileName, setFileName] = useState(null)
  const [attendanceData, setAttendanceData] = useState({})
  const [textContent, setTextContent] = useState("")
  const [showTable, setShowTable] = useState(false)
  const [dates, setDates] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        setTextContent(content)
        processAttendanceData(content)
      }
      reader.readAsText(file)
    }
  }

  const handleTextChange = (event) => {
    setTextContent(event.target.value)
  }

  const handleShowDetails = () => {
    processAttendanceData(textContent)
    setShowTable(true)
  }

  const processAttendanceData = (data) => {
    const lines = data.split("\n").map((line) => line.trim())
    const attendanceMap = {}
    const datesArray = []

    lines.forEach((line) => {
      if (line.startsWith("Date:")) {
        const date = line.split(": ")[1]
        if (date) datesArray.push(date)
      }
    })

    lines.forEach((line) => {
      if (line.startsWith("Roll:")) {
        const rolls = line.split(": ")[1]
        if (rolls) {
          const rollNumbers = rolls.split(",").map((roll) => roll.trim())
          rollNumbers.forEach((roll) => {
            if (!attendanceMap[roll]) attendanceMap[roll] = Array(datesArray.length).fill("A")
          })
        }
      }
    })

    let dateIndex = -1
    lines.forEach((line) => {
      if (line.startsWith("Date:")) {
        dateIndex++
      } else if (line.startsWith("Roll:")) {
        const rolls = line.split(": ")[1]
        if (rolls) {
          const rollNumbers = rolls.split(",").map((roll) => roll.trim())
          rollNumbers.forEach((roll) => {
            attendanceMap[roll][dateIndex] = "P"
          })
        }
      }
    })

    setDates(datesArray)
    setAttendanceData(attendanceMap)
    setShowTable(true)
  }

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
              <div className="h-[100px] w-[100px] rounded-full bg-white p-2 shadow-lg flex items-center justify-center">
                <FileText className="h-12 w-12 text-indigo-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center">Attendance Sheet Generator</h2>
          </div>
          <div className="p-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab("upload")}
                className={`py-2 px-4 ${activeTab === "upload" ? "bg-indigo-600 text-white" : "border"} rounded-md`}
              >
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`py-2 px-4 ${activeTab === "paste" ? "bg-indigo-600 text-white" : "border"} rounded-md`}
              >
                Paste Text
              </button>
            </div>
            {activeTab === "upload" ? (
              <div className="space-y-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {fileName && <p className="text-sm text-gray-500">File uploaded: {fileName}</p>}
              </div>
            ) : (
              <textarea
                value={textContent}
                onChange={handleTextChange}
                placeholder="Paste your attendance data here..."
                className="w-full h-40 p-2 border rounded-md"
              />
            )}
            <button onClick={handleShowDetails} className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md">
              Show Details
            </button>
            {showTable && (
              <div className="mt-4">
                <h2 className="text-xl uppercase font-semibold mb-4">Attendance Table</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Roll</th>
                        {dates.map((date, index) => (
                          <th key={index} className="px-4 py-2">{date}</th>
                        ))}
                        <th className="px-4 py-2">Present Count</th>
                        <th className="px-4 py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageData.map(([roll, statuses]) => {
                        const presentCount = statuses.filter((status) => status === "P").length
                        const percentage = presentCount > 0 ? (presentCount / dates.length) * 100 : 0
                        return (
                          <tr key={roll}>
                            <td className="border px-4 py-2">{roll}</td>
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
                    className="bg-gray-200 py-2 px-4 rounded-md"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-gray-200 py-2 px-4 rounded-md"
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ATPagination
