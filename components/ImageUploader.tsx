
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { PdfIcon } from './icons/PdfIcon';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  filePreviewUrl: string | null;
  onGradeRequest: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const isFileValid = (file: File): boolean => {
    return file.type.startsWith('image/') || file.type === 'application/pdf';
}

const SubmissionPreview: React.FC<{ file: File; url: string | null }> = ({ file, url }) => {
    if (file.type.startsWith('image/')) {
        return <img src={url!} alt="Homework submission" className="w-full h-full object-contain" />;
    }
    
    if (file.type === 'application/pdf') {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg p-4">
                <PdfIcon className="w-24 h-24 text-red-600" />
                <p className="mt-4 text-sm font-semibold text-gray-700 text-center break-all">{file.name}</p>
                <p className="mt-2 text-xs text-gray-500">PDF Document</p>
            </div>
        );
    }

    return <p className="text-gray-500">Unsupported file type.</p>;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, selectedFile, filePreviewUrl, onGradeRequest, isLoading, hasResult }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isFileValid(file)) {
        onFileSelect(file);
      } else {
        alert("Please upload an image or PDF file.");
      }
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (isFileValid(file)) {
        onFileSelect(file);
      } else {
        alert("Please upload an image or PDF file.");
        e.target.value = ''; // Reset the input
      }
    }
  };

  if (selectedFile && hasResult) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Your Submission</h2>
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                <SubmissionPreview file={selectedFile} url={filePreviewUrl} />
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      {!selectedFile ? (
        <label
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, PNG, JPG, or WEBP</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="text-center">
          <div className="w-full max-h-[60vh] overflow-hidden rounded-lg border border-gray-200 mb-4 flex items-center justify-center p-2 bg-gray-50">
              <SubmissionPreview file={selectedFile} url={filePreviewUrl} />
          </div>
          <button
            onClick={onGradeRequest}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Grading...' : 'Grade my Homework'}
          </button>
        </div>
      )}
    </div>
  );
};
