import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { createBucketStructure, parseSpreadsheet, generateHtmlFiles } from '../../../helpers/bucket-helpers';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.enter();

const bucketsRouter = express.Router();
const BUCKETS_PATH = path.join(process.cwd(), 'content', 'Buckets');
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/buckets - List all buckets
bucketsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  log.enter("GET /api/buckets", log.brack);
  try {
    const buckets = await fs.readdir(BUCKETS_PATH);
    const dirs = [];
    for (const item of buckets) {
      const stat = await fs.stat(path.join(BUCKETS_PATH, item));
      if (stat.isDirectory()) dirs.push(item);
    }
    log.retrn("GET /api/buckets", log.kcarb);
    res.json(dirs);
  } catch (error) {
    log.retrn("GET /api/buckets", log.kcarb);
    next(error);
  }
});

// GET /api/buckets/:bucket/subdirs - List subdirectories in a bucket
bucketsRouter.get('/:bucket/subdirs', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("GET /api/buckets/:bucket/subdirs", log.brack);
  try {
    const bucketPath = path.join(BUCKETS_PATH, req.params.bucket);
    const subdirs = await fs.readdir(bucketPath);
    const dirs = [];
    for (const item of subdirs) {
      const stat = await fs.stat(path.join(bucketPath, item));
      if (stat.isDirectory()) dirs.push(item);
    }
    log.retrn("GET /api/buckets/:bucket/subdirs", log.kcarb);
    res.json(dirs);
  } catch (error) {
    log.retrn("GET /api/buckets/:bucket/subdirs", log.kcarb);
    next(error);
  }
});

// GET /api/buckets/:bucket/:subdir/files - List HTML files in subdirectory
bucketsRouter.get('/:bucket/:subdir/files', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("GET /api/buckets/:bucket/:subdir/files", log.brack);
  try {
    const subdirPath = path.join(BUCKETS_PATH, req.params.bucket, req.params.subdir);
    const files = await fs.readdir(subdirPath);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    log.retrn("GET /api/buckets/:bucket/:subdir/files", log.kcarb);
    res.json(htmlFiles);
  } catch (error) {
    log.retrn("GET /api/buckets/:bucket/:subdir/files", log.kcarb);
    next(error);
  }
});

// GET /api/buckets/:bucket/:subdir/:filename - Get file content
bucketsRouter.get('/:bucket/:subdir/:filename', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("GET /api/buckets/:bucket/:subdir/:filename", log.brack);
  try {
    const filePath = path.join(BUCKETS_PATH, req.params.bucket, req.params.subdir, req.params.filename);
    const content = await fs.readFile(filePath, 'utf-8');
    log.retrn("GET /api/buckets/:bucket/:subdir/:filename", log.kcarb);
    res.send(content);
  } catch (error) {
    log.retrn("GET /api/buckets/:bucket/:subdir/:filename", log.kcarb);
    next(error);
  }
});

// POST /api/buckets/save - Save file changes
bucketsRouter.post('/save', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("POST /api/buckets/save", log.brack);
  try {
    const { bucket, subdir, filename, content } = req.body;
    const filePath = path.join(BUCKETS_PATH, bucket, subdir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    log.retrn("POST /api/buckets/save", log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn("POST /api/buckets/save", log.kcarb);
    next(error);
  }
});

// POST /api/buckets/move - Move file to different subdirectory
bucketsRouter.post('/move', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("POST /api/buckets/move", log.brack);
  try {
    const { fromBucket, fromSubdir, toBucket, toSubdir, filename } = req.body;
    const fromPath = path.join(BUCKETS_PATH, fromBucket, fromSubdir, filename);
    const toPath = path.join(BUCKETS_PATH, toBucket, toSubdir, filename);

    // Check if file already exists in destination
    try {
      await fs.access(toPath);
      // File exists, return error
      log.retrn("POST /api/buckets/move", log.kcarb);
      return res.status(409).json({
        success: false,
        error: 'A file with this name already exists in the destination directory'
      });
    } catch {
      // File doesn't exist, proceed with move
    }

    await fs.rename(fromPath, toPath);
    log.retrn("POST /api/buckets/move", log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn("POST /api/buckets/move", log.kcarb);
    next(error);
  }
});

// DELETE /api/buckets/delete - Delete file
bucketsRouter.delete('/delete', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("DELETE /api/buckets/delete", log.brack);
  try {
    const { bucket, subdir, filename } = req.body;
    const filePath = path.join(BUCKETS_PATH, bucket, subdir, filename);
    await fs.unlink(filePath);
    log.retrn("DELETE /api/buckets/delete", log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn("DELETE /api/buckets/delete", log.kcarb);
    next(error);
  }
});

// DELETE /api/buckets/:bucket - Delete entire bucket
bucketsRouter.delete('/:bucket', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("DELETE /api/buckets/:bucket", log.brack);
  try {
    const bucketPath = path.join(BUCKETS_PATH, req.params.bucket);
    await fs.rm(bucketPath, { recursive: true, force: true });
    log.retrn("DELETE /api/buckets/:bucket", log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn("DELETE /api/buckets/:bucket", log.kcarb);
    next(error);
  }
});

// POST /api/buckets/create-file - Create a new file from template or existing file
bucketsRouter.post('/create-file', async (req: Request, res: Response, next: NextFunction) => {
  log.enter("POST /api/buckets/create-file", log.brack);
  try {
    const { bucket, subdir, filename, fromBucket, fromSubdir, fromFilename } = req.body;
    if (!bucket || !subdir || !filename) {
      return res.status(400).json({ success: false, error: 'bucket, subdir, and filename are required' });
    }

    const destDir = path.join(BUCKETS_PATH, bucket, subdir);
    const baseName = filename.replace(/\.html$/i, '');

    // Resolve unique filename
    const existing = await fs.readdir(destDir).catch(() => [] as string[]);
    let finalName = `${baseName}.html`;
    if (existing.includes(finalName)) {
      const numMatch = baseName.match(/^(.+?)_(\d+)$/);
      let stem = numMatch ? numMatch[1] : baseName;
      let num = numMatch ? parseInt(numMatch[2]) + 1 : 1;
      while (existing.includes(`${stem}_${num}.html`)) num++;
      finalName = `${stem}_${num}.html`;
    }

    const destPath = path.join(destDir, finalName);

    if (fromBucket && fromSubdir && fromFilename) {
      // Copy from existing file
      const srcPath = path.join(BUCKETS_PATH, fromBucket, fromSubdir, fromFilename);
      await fs.copyFile(srcPath, destPath);
    } else {
      // Build from template
      const buildScriptPath = path.join(process.cwd(), 'content', 'Templates', 'build-template.js');
      await execAsync(`node "${buildScriptPath}" "${finalName}" "${destDir}"`);
    }

    log.retrn("POST /api/buckets/create-file", log.kcarb);
    res.json({ success: true, filename: finalName });
  } catch (error) {
    log.retrn("POST /api/buckets/create-file", log.kcarb);
    next(error);
  }
});

// POST /api/buckets/create - Create bucket from spreadsheet
bucketsRouter.post('/create', upload.single('spreadsheet'), async (req: Request, res: Response, next: NextFunction) => {
  log.enter("POST /api/buckets/create", log.brack);
  try {
    const { bucketName } = req.body;
    const file = req.file;
    
    if (!file) {
      log.retrn("POST /api/buckets/create", log.kcarb);
      return res.status(400).json({ success: false, error: 'No spreadsheet file uploaded' });
    }
    
    if (!bucketName) {
      log.retrn("POST /api/buckets/create", log.kcarb);
      return res.status(400).json({ success: false, error: 'Bucket name is required' });
    }
    
    await createBucketStructure(bucketName);
    const { rows } = await parseSpreadsheet(file.buffer);
    await generateHtmlFiles('', bucketName, rows, (progress) => {
      // Progress callback - could emit SSE events here
    });

    log.retrn("POST /api/buckets/create", log.kcarb);
    res.json({
      success: true,
      message: 'Bucket created successfully!'
    });
  } catch (error) {
    log.retrn("POST /api/buckets/create", log.kcarb);
    next(error);
  }
});

export default bucketsRouter;

console.leave();
