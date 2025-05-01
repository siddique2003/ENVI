import React, { useState } from 'react';

export default function CsvUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload-csv/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || "Uploaded!");
      onUploadComplete(); // trigger chart generation if needed
    } catch (err) {
      setMessage("Error uploading file");
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded">
        Upload CSV
      </button>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
