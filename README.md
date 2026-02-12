# CurAssist - Curation Assistant

A browser-based application for reviewing and curating HTML form files.

## Structure

```
CurAssist/
  content/
    Buckets/          # HTML files organized by bucket/subdirectory
    Templates/        # Template files
  public/             # Frontend static files
    index.html
    app.js
  server.js           # Express server
  package.json
  .env                # Environment variables (PORT)
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure port (optional):
```bash
# Edit .env file
PORT=8004  # or any port you prefer
```

## Running

**Development** (with auto-restart):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Then open browser to: `http://localhost:8004` (or your configured PORT)

## Usage

1. Select a bucket from the dropdown (e.g., "DCYF 10.01.25")
2. Select a subdirectory (e.g., "Incomplete", "Pending", "Complete")
3. Review HTML forms in the content area
4. Adjust input values as needed
5. Use navigation buttons to move between files
6. Save changes with "Save Changes" button
7. Move files to different subdirectories using "Move To" dropdown

## File Organization

```
content/
  Buckets/
    [Bucket Name]/
      Incomplete/    # Files to review
      Pending/       # Files in progress
      Complete/      # Reviewed files
```

## API Endpoints

- `GET /api/buckets` - List all buckets
- `GET /api/bucket/:name/subdirs` - List subdirectories in a bucket
- `GET /api/bucket/:bucket/:subdir/files` - List HTML files in a subdirectory
- `GET /api/file/:bucket/:subdir/:filename` - Get file content
- `POST /api/file/save` - Save file changes
- `POST /api/file/move` - Move file to different subdirectory
