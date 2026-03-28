const express = require('express');
const multer = require('multer');
const path = require('path');
const { Worker } = require('worker_threads');
const { parseAndInsertExcel } = require('../utils/excelParser');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

let workerStatus = { state: 'idle', message: 'Ready to allocate.' };

router.post('/upload-scores', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    // Process asynchronously in background
    setTimeout(() => {
        parseAndInsertExcel(req.file.path).catch(console.error);
    }, 0);
    
    res.json({ message: 'File uploaded. Processing started in background.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/run-allocation', async (req, res) => {
  if (workerStatus.state === 'running') {
    return res.status(400).json({ message: 'Allocation already running.' });
  }

  workerStatus = { state: 'running', message: 'Starting process...' };

  const workerPath = path.join(__dirname, '../workers/allocationWorker.js');
  const worker = new Worker(workerPath);

  worker.on('message', (msg) => {
    console.log('Worker Message:', msg);
    if (msg.status === 'done') {
      workerStatus = { state: 'idle', message: msg.message };
    } else if (msg.status === 'error') {
      workerStatus = { state: 'error', error: msg.error };
    } else {
      workerStatus.message = msg.message;
    }
  });

  worker.on('error', (err) => {
    console.error('Worker throw error:', err);
    workerStatus = { state: 'error', error: err.message };
  });

  res.json({ message: 'Allocation process started.' });
});

router.get('/allocation-status', (req, res) => {
  res.json(workerStatus);
});

module.exports = router;
