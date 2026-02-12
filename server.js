const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const server = express();

server.use(cors());
server.use(express.json({ limit: '50mb' }));
server.use(express.static(path.join(__dirname, 'public')));

const BUCKETS_DIR = path.join(__dirname, 'content/Buckets');

// List all buckets
server.get('/api/buckets', async (req, res) => {
  try {
    const buckets = await fs.readdir(BUCKETS_DIR);
    const bucketDirs = [];
    for (const bucket of buckets) {
      const stat = await fs.stat(path.join(BUCKETS_DIR, bucket));
      if (stat.isDirectory()) bucketDirs.push(bucket);
    }
    res.json(bucketDirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List subdirectories in a bucket
server.get('/api/bucket/:name/subdirs', async (req, res) => {
  try {
    const bucketPath = path.join(BUCKETS_DIR, req.params.name);
    const items = await fs.readdir(bucketPath);
    const subdirs = [];
    for (const item of items) {
      const stat = await fs.stat(path.join(bucketPath, item));
      if (stat.isDirectory()) subdirs.push(item);
    }
    res.json(subdirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List files in bucket/subdir
server.get('/api/bucket/:bucket/:subdir/files', async (req, res) => {
  try {
    const dirPath = path.join(BUCKETS_DIR, req.params.bucket, req.params.subdir);
    const files = await fs.readdir(dirPath);
    res.json(files.filter(f => f.endsWith('.html')));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get file content
server.get('/api/file/:bucket/:subdir/:filename', async (req, res) => {
  try {
    const filePath = path.join(BUCKETS_DIR, req.params.bucket, req.params.subdir, req.params.filename);
    const content = await fs.readFile(filePath, 'utf8');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save file
server.post('/api/file/save', async (req, res) => {
  try {
    const { bucket, subdir, filename, content } = req.body;
    const filePath = path.join(BUCKETS_DIR, bucket, subdir, filename);
    await fs.writeFile(filePath, content, 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Move file
server.post('/api/file/move', async (req, res) => {
  try {
    const { fromBucket, fromSubdir, toBucket, toSubdir, filename } = req.body;
    const oldPath = path.join(BUCKETS_DIR, fromBucket, fromSubdir, filename);
    const newPath = path.join(BUCKETS_DIR, toBucket, toSubdir, filename);
    await fs.rename(oldPath, newPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3456;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
