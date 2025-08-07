import React, { useState } from 'react';
import { useBackgroundCheck } from '../services/backgroundCheck';

export default function IDUploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const { startCheck } = useBackgroundCheck();

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
    setParsedData(null); // Reset parsed data when new file is selected
  };

  const parseIDImage = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('https://api.checkr.com/v1/documents/parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_CHECKR_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse ID');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error parsing ID:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse the ID image
      const parsedData = await parseIDImage(file);
      setParsedData(parsedData);

      // Start background check with parsed data
      const userData = {
        firstName: parsedData.first_name,
        lastName: parsedData.last_name,
        dateOfBirth: parsedData.date_of_birth,
        email: parsedData.email || '', // You might need to collect this separately
        phone: parsedData.phone || '', // You might need to collect this separately
        ssn: parsedData.ssn || '', // You might need to collect this separately
        idNumber: parsedData.id_number,
        idType: parsedData.id_type,
        idState: parsedData.state,
        idExpiration: parsedData.expiration_date
      };

      const result = await startCheck(userData);
      console.log('Background check initiated:', result);
      
      // You can redirect or show success message here
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold">Upload Your ID</h2>
        
        {error && (
          <div className="w-full p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="w-full">
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={handleFileChange} 
            className="w-full"
            disabled={loading}
          />
        </div>

        {preview && (
          <div className="w-full">
            <img 
              src={preview} 
              alt="ID Preview" 
              className="w-full mt-2 rounded-lg border border-gray-300" 
            />
          </div>
        )}

        {parsedData && (
          <div className="w-full mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Parsed Information:</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {parsedData.first_name} {parsedData.last_name}</p>
              <p><span className="font-medium">Date of Birth:</span> {parsedData.date_of_birth}</p>
              <p><span className="font-medium">ID Number:</span> {parsedData.id_number}</p>
              <p><span className="font-medium">State:</span> {parsedData.state}</p>
              <p><span className="font-medium">Expiration:</span> {parsedData.expiration_date}</p>
            </div>
          </div>
        )}

        <button 
          onClick={handleUpload} 
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={loading || !file}
        >
          {loading ? 'Processing...' : 'Upload and Process'}
        </button>
      </div>
    </div>
  );
}