import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, Upload } from 'lucide-react'
import Link from 'next/link'

export default function UserScreen() {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [plagiarismResult, setPlagiarismResult] = useState(null)

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((oldProgress) => {
          if (oldProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return oldProgress + 10
        })
      }, 500)

      const response = await fetch('/api/check-plagiarism', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      console.log('Plagiarism check result:', result)
      setPlagiarismResult(result)
    } catch (error) {
      console.error('Error:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <ArrowLeft className="h-6 w-6 mr-2" />
          Back to Home 
        </Link>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Upload Document for Plagiarism Check(better to use txt file)</h1>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          <Upload className="mr-2 h-4 w-4" /> Upload and Check
        </Button>
        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Uploading and processing document...</p>
          </div>
        )}
        {plagiarismResult && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Plagiarism Detection Results</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-lg mb-4">
                Plagiarism Percentage: <span className="font-bold text-red-500">{plagiarismResult.percentage || 'N/A'}%</span>
              </p>
              {plagiarismResult.flaggedSections && plagiarismResult.flaggedSections.length > 0 ? (
                <>
                  <h3 className="text-xl font-bold mb-2">Flagged Sections:</h3>
                  <ul className="list-disc pl-5">
                    {plagiarismResult.flaggedSections.map((section, index) => (
                      <li key={index} className="mb-2">
                        <p>
                          <span className="font-semibold">Section {index + 1}:</span> {section.text}
                        </p>
                        <p className="text-sm text-gray-500">
                          Characters {section.start} - {section.end}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>No flagged sections found.</p>
              )}
              <Button className="mt-4">
                <Download className="mr-2 h-4 w-4" /> Download Full Report
              </Button>
            </div>
          </div>
        )}
      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          © 2024 PlagiarismGuard AI. All rights reserved by Athul Raj M.
        </p>
      </footer>
    </div>
  )
}