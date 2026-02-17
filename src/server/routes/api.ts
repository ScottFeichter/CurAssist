// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../../utils/logger/logger';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== ROUTES ========================================

const router = Router();
const BUCKETS_DIR = path.join(__dirname, '../../../content/Buckets');

// List all buckets
router.get('/buckets', async (req, res) => {
  log.enter("/buckets GET", log.brack);
  try {
    const buckets = await fs.readdir(BUCKETS_DIR);
    const bucketDirs = [];
    for (const bucket of buckets) {
      const stat = await fs.stat(path.join(BUCKETS_DIR, bucket));
      if (stat.isDirectory()) bucketDirs.push(bucket);
    }
    logger.info(`Listed ${bucketDirs.length} buckets`);
    log.retrn("/buckets GET", log.kcarb);
    res.json(bucketDirs);
  } catch (err: any) {
    logger.error(`Error listing buckets: ${err.message}`);
    log.retrn("/buckets GET", log.kcarb);
    res.status(500).json({ error: err.message });
  }
});

// List subdirectories in a bucket
router.get('/bucket/:name/subdirs', async (req, res) => {
  log.enter("/bucket/:name/subdirs GET", log.brack);
  try {
    const bucketPath = path.join(BUCKETS_DIR, req.params.name);
    const items = await fs.readdir(bucketPath);
    const subdirs = [];
    for (const item of items) {
      const stat = await fs.stat(path.join(bucketPath, item));
      if (stat.isDirectory()) subdirs.push(item);
    }
    logger.info(`Listed ${subdirs.length} subdirs in bucket: ${req.params.name}`);
    log.retrn("/bucket/:name/subdirs GET", log.kcarb);
    res.json(subdirs);
  } catch (err: any) {
    logger.error(`Error listing subdirs: ${err.message}`);
    log.retrn("/bucket/:name/subdirs GET", log.kcarb);
    res.status(500).json({ error: err.message });
  }
});

// List files in bucket/subdir
router.get('/bucket/:bucket/:subdir/files', async (req, res) => {
  log.enter("/bucket/:bucket/:subdir/files GET", log.brack);
  try {
    const dirPath = path.join(BUCKETS_DIR, req.params.bucket, req.params.subdir);
    const files = await fs.readdir(dirPath);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    logger.info(`Listed ${htmlFiles.length} files in ${req.params.bucket}/${req.params.subdir}`);
    log.retrn("/bucket/:bucket/:subdir/files GET", log.kcarb);
    res.json(htmlFiles);
  } catch (err: any) {
    logger.error(`Error listing files: ${err.message}`);
    log.retrn("/bucket/:bucket/:subdir/files GET", log.kcarb);
    res.status(500).json({ error: err.message });
  }
});

// Get file content
router.get('/file/:bucket/:subdir/:filename', async (req, res) => {
  log.enter("/file/:bucket/:subdir/:filename GET", log.brack);
  try {
    const filePath = path.join(BUCKETS_DIR, req.params.bucket, req.params.subdir, req.params.filename);
    const content = await fs.readFile(filePath, 'utf8');
    logger.info(`Loaded file: ${req.params.filename}`);
    log.retrn("/file/:bucket/:subdir/:filename GET", log.kcarb);
    res.send(content);
  } catch (err: any) {
    logger.error(`Error reading file: ${err.message}`);
    log.retrn("/file/:bucket/:subdir/:filename GET", log.kcarb);
    res.status(500).json({ error: err.message });
  }
});

// Save file
router.post('/file/save', async (req, res) => {
  log.enter("/file/save POST", log.brack);
  try {
    const { bucket, subdir, filename, content } = req.body;
    const filePath = path.join(BUCKETS_DIR, bucket, subdir, filename);
    await fs.writeFile(filePath, content, 'utf8');
    logger.info(`Saved file: ${filename}`);
    log.retrn("/file/save POST", log.kcarb);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Error saving file: ${err.message}`);
    log.retrn("/file/save POST", log.kcarb);
    res.status(500).json({ error: err.message });
  }
});

// Move file
router.post('/file/move', async (req, res) => {
  log.enter("/file/move POST", log.brack);
  try {
    const { fromBucket, fromSubdir, toBucket, toSubdir, filename } = req.body;
    const oldPath = path.join(BUCKETS_DIR, fromBucket, fromSubdir, filename);
    const newPath = path.join(BUCKETS_DIR, toBucket, toSubdir, filename);
    await fs.rename(oldPath, newPath);
    logger.info(`Moved file: ${filename} from ${fromSubdir} to ${toSubdir}`);
    log.retrn("/file/move POST", log.kcarb);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Error moving file: ${err.message}`);
    log.retrn("/file/move POST", log.kcarb);
    res.status(500).json({ error: err.message });
  }
});

export default router;

// #endregion ------------------------------------------------------------------

console.leave();
