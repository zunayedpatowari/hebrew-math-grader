
import React, { useState, useCallback } from 'react';
import { gradeHomework } from './services/geminiService';
import type { GradingResponse } from './types';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // Clean up the previous object URL to prevent memory leaks
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      setSelectedFile(file);
      setFilePreviewUrl(URL.createObjectURL(file));
      setGradingResult(null);
      setError(null);
    }
  };

  const handleGradeRequest = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setGradingResult(null);

    try {
      const result = await gradeHomework(selectedFile);
      setGradingResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleReset = () => {
    if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setGradingResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">AI Math Homework Grader</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload your handwritten Hebrew math homework (PDF or Image) for an AI-powered analysis.
          </p>
        </header>

        <main>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
              <p className="font-bold">Oops! Something went wrong.</p>
              <p>{error}</p>
            </div>
          )}

          <div className={`transition-all duration-500 ${gradingResult ? 'grid lg:grid-cols-2 gap-8' : ''}`}>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
                  <Spinner />
                  <p className="mt-4 text-lg font-semibold text-gray-700">AI is analyzing your work...</p>
                </div>
              )}
              <ImageUploader 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile}
                filePreviewUrl={filePreviewUrl}
                onGradeRequest={handleGradeRequest}
                isLoading={isLoading}
                hasResult={!!gradingResult}
              />
            </div>

            {gradingResult && (
              <div className="mt-8 lg:mt-0">
                <ResultsDisplay result={gradingResult} onReset={handleReset} />
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Gemini API. Grades and feedback are AI-generated and should be used as a study aid.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
