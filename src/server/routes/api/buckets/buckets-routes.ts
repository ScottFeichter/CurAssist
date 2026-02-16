import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { createBucketStructure, parseSpreadsheet, generateHtmlFiles } from '../../../helpers/bucket-helpers';
import fs from 'fs/promises';
import path from 'path';

console.enter();

const bucketsRouter = express.Router();
const BUCKETS_PATH = path.join(process.cwd(), 'content', 'Buckets');
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/buckets - List all buckets
bucketsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buckets = await fs.readdir(BUCKETS_PATH);
    const dirs = [];
    for (const item of buckets) {
      const stat = await fs.stat(path.join(BUCKETS_PATH, item));
      if (stat.isDirectory()) dirs.push(item);
    }
    res.json(dirs);
  } catch (error) {
    next(error);
  }
});

// GET /api/buckets/:bucket/subdirs - List subdirectories in a bucket
bucketsRouter.get('/:bucket/subdirs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bucketPath = path.join(BUCKETS_PATH, req.params.bucket);
    const subdirs = await fs.readdir(bucketPath);
    const dirs = [];
    for (const item of subdirs) {
      const stat = await fs.stat(path.join(bucketPath, item));
      if (stat.isDirectory()) dirs.push(item);
    }
    res.json(dirs);
  } catch (error) {
    next(error);
  }
});

// GET /api/buckets/:bucket/:subdir/files - List HTML files in subdirectory
bucketsRouter.get('/:bucket/:subdir/files', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subdirPath = path.join(BUCKETS_PATH, req.params.bucket, req.params.subdir);
    const files = await fs.readdir(subdirPath);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    res.json(htmlFiles);
  } catch (error) {
    next(error);
  }
});

// GET /api/buckets/:bucket/:subdir/:filename - Get file content
bucketsRouter.get('/:bucket/:subdir/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = path.join(BUCKETS_PATH, req.params.bucket, req.params.subdir, req.params.filename);
    const content = await fs.readFile(filePath, 'utf-8');
    res.send(content);
  } catch (error) {
    next(error);
  }
});

// POST /api/buckets/save - Save file changes
bucketsRouter.post('/save', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucket, subdir, filename, content } = req.body;
    const filePath = path.join(BUCKETS_PATH, bucket, subdir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/buckets/move - Move file to different subdirectory
bucketsRouter.post('/move', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromBucket, fromSubdir, toBucket, toSubdir, filename } = req.body;
    const fromPath = path.join(BUCKETS_PATH, fromBucket, fromSubdir, filename);
    const toPath = path.join(BUCKETS_PATH, toBucket, toSubdir, filename);

    // Check if file already exists in destination
    try {
      await fs.access(toPath);
      // File exists, return error
      return res.status(409).json({
        success: false,
        error: 'A file with this name already exists in the destination directory'
      });
    } catch {
      // File doesn't exist, proceed with move
    }

    await fs.rename(fromPath, toPath);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/buckets/delete - Delete file
bucketsRouter.delete('/delete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucket, subdir, filename } = req.body;
    const filePath = path.join(BUCKETS_PATH, bucket, subdir, filename);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/buckets/:bucket - Delete entire bucket
bucketsRouter.delete('/:bucket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bucketPath = path.join(BUCKETS_PATH, req.params.bucket);
    await fs.rm(bucketPath, { recursive: true, force: true });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/buckets/create - Create bucket from spreadsheet
bucketsRouter.post('/create', upload.single('spreadsheet'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucketName, templatePath } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'No spreadsheet file uploaded' });
    }
    
    await createBucketStructure(bucketName);
    const { rows } = await parseSpreadsheet(file.buffer);
    await generateHtmlFiles(templatePath, bucketName, rows, (progress) => {
      // Progress callback - could emit SSE events here
    });

    res.json({
      success: true,
      message: 'Bucket created successfully!'
    });
  } catch (error) {
    next(error);
  }
});

export default bucketsRouter;

console.leave();
