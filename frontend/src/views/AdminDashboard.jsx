import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, Play, CheckCircle, Database } from 'lucide-react';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [workerState, setWorkerState] = useState({ state: 'idle', message: 'Waiting for deployment', remain: null });

  const pollStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/allocation-status');
      setWorkerState(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const interval = setInterval(pollStatus, 3000);
    pollStatus();
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a valid .xlsx file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadStatus('Uploading securely...');
    
    try {
      await axios.post('http://localhost:5000/api/admin/upload-scores', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadStatus('Upload successful. Processing in background.');
    } catch (err) {
      setUploadStatus('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const startAllocation = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/run-allocation');
      pollStatus();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Algorithm Console</h1>
        <p className="text-zinc-400 text-sm">Deploy data sets and manage the Gale-Shapley matching matrix.</p>
      </div>

      <div className="grid gap-8">
        {/* Card 1: Upload */}
        <div className="glass p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
              <UploadCloud className="text-zinc-300 w-4 h-4" />
            </div>
            <h2 className="text-lg font-medium">Dataset Ingestion</h2>
          </div>
          
          <div className="border border-dashed border-zinc-700 bg-zinc-950/50 rounded-xl p-8 text-center glass-hover cursor-pointer group transition-all">
            <input 
              type="file" 
              accept=".xlsx,.csv" 
              onChange={handleFileChange} 
              className="hidden" 
              id="file-upload" 
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
              <Database className="w-6 h-6 text-zinc-500 mb-3 group-hover:text-zinc-300 transition-colors" />
              <div className="text-sm">
                {file ? (
                  <span className="font-medium text-indigo-400">{file.name}</span>
                ) : (
                  <span className="text-zinc-400 group-hover:text-white transition-colors">Select a payload file (.xlsx, .csv)</span>
                )}
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">{uploadStatus || 'Max payload size: 50MB'}</p>
            <button 
              onClick={handleUpload} 
              className="px-5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-md text-sm font-semibold transition shadow-md shadow-white/10"
            >
              Parse Data
            </button>
          </div>
        </div>

        {/* Card 2: Compute Engine */}
        <div className="glass p-8">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                 <Play className="text-indigo-400 w-4 h-4 fill-current ml-0.5" />
               </div>
               <h2 className="text-lg font-medium">Allocation Matrix</h2>
             </div>
             
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-xs font-mono text-zinc-400">Node Worker Ready</span>
             </div>
          </div>
          
          <div className="bg-[#0c0c0e] rounded-lg p-5 border border-white/5 font-mono text-xs mb-6 h-32 flex flex-col justify-center relative overflow-hidden">
             {workerState.state === 'running' && (
               <div className="absolute top-0 left-0 h-0.5 bg-indigo-500 w-full animate-pulse"></div>
             )}
             
             <div className="flex justify-between items-center mb-3">
               <span className="text-zinc-500">_status: <span className={workerState.state === 'running' ? 'text-indigo-400' : 'text-zinc-300'}>{workerState.state.toUpperCase()}</span></span>
             </div>
             <p className="text-green-500 leading-relaxed">$ {workerState.message || workerState.error}</p>
             
          </div>

          <button 
            onClick={startAllocation} 
            disabled={workerState.state === 'running'}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-md text-sm font-semibold transition flex justify-center items-center shadow-lg shadow-indigo-600/20 text-white"
          >
            {workerState.state === 'running' ? 'Computing Stable Match...' : 'Initialize Pipeline'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
