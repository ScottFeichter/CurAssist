"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../../utils/logger/logger"));
const router = (0, express_1.Router)();
const BUCKETS_DIR = path_1.default.join(__dirname, '../../../content/Buckets');
// List all buckets
router.get('/buckets', async (req, res) => {
    try {
        const buckets = await fs_1.promises.readdir(BUCKETS_DIR);
        const bucketDirs = [];
        for (const bucket of buckets) {
            const stat = await fs_1.promises.stat(path_1.default.join(BUCKETS_DIR, bucket));
            if (stat.isDirectory())
                bucketDirs.push(bucket);
        }
        logger_1.default.info(`Listed ${bucketDirs.length} buckets`);
        res.json(bucketDirs);
    }
    catch (err) {
        logger_1.default.error(`Error listing buckets: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});
// List subdirectories in a bucket
router.get('/bucket/:name/subdirs', async (req, res) => {
    try {
        const bucketPath = path_1.default.join(BUCKETS_DIR, req.params.name);
        const items = await fs_1.promises.readdir(bucketPath);
        const subdirs = [];
        for (const item of items) {
            const stat = await fs_1.promises.stat(path_1.default.join(bucketPath, item));
            if (stat.isDirectory())
                subdirs.push(item);
        }
        logger_1.default.info(`Listed ${subdirs.length} subdirs in bucket: ${req.params.name}`);
        res.json(subdirs);
    }
    catch (err) {
        logger_1.default.error(`Error listing subdirs: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});
// List files in bucket/subdir
router.get('/bucket/:bucket/:subdir/files', async (req, res) => {
    try {
        const dirPath = path_1.default.join(BUCKETS_DIR, req.params.bucket, req.params.subdir);
        const files = await fs_1.promises.readdir(dirPath);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        logger_1.default.info(`Listed ${htmlFiles.length} files in ${req.params.bucket}/${req.params.subdir}`);
        res.json(htmlFiles);
    }
    catch (err) {
        logger_1.default.error(`Error listing files: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});
// Get file content
router.get('/file/:bucket/:subdir/:filename', async (req, res) => {
    try {
        const filePath = path_1.default.join(BUCKETS_DIR, req.params.bucket, req.params.subdir, req.params.filename);
        const content = await fs_1.promises.readFile(filePath, 'utf8');
        logger_1.default.info(`Loaded file: ${req.params.filename}`);
        res.send(content);
    }
    catch (err) {
        logger_1.default.error(`Error reading file: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});
// Save file
router.post('/file/save', async (req, res) => {
    try {
        const { bucket, subdir, filename, content } = req.body;
        const filePath = path_1.default.join(BUCKETS_DIR, bucket, subdir, filename);
        await fs_1.promises.writeFile(filePath, content, 'utf8');
        logger_1.default.info(`Saved file: ${filename}`);
        res.json({ success: true });
    }
    catch (err) {
        logger_1.default.error(`Error saving file: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});
// Move file
router.post('/file/move', async (req, res) => {
    try {
        const { fromBucket, fromSubdir, toBucket, toSubdir, filename } = req.body;
        const oldPath = path_1.default.join(BUCKETS_DIR, fromBucket, fromSubdir, filename);
        const newPath = path_1.default.join(BUCKETS_DIR, toBucket, toSubdir, filename);
        await fs_1.promises.rename(oldPath, newPath);
        logger_1.default.info(`Moved file: ${filename} from ${fromSubdir} to ${toSubdir}`);
        res.json({ success: true });
    }
    catch (err) {
        logger_1.default.error(`Error moving file: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
