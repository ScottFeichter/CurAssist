# docs/ (Documentation Files)

These are existing documentation files. Brief descriptions of each:

| File | Description |
|------|-------------|
| `deployment-DB-noS3.md` | Current MongoDB-based deployment guide (stack, env vars, EC2 setup, Nginx, PM2, CI/CD) |
| `deployment-S3-noDB.md` | Original file-based deployment using S3 (historical reference, no longer active) |
| `ssh-and-nginx.md` | SSH connection guide, PEM key explanation, Nginx reverse proxy config and body size limit |
| `curassistDeployFirst.md` | Full deployment log and infrastructure notes from initial setup |
| `db2bOrNot2b.md` | Decision log for whether/how to introduce a database (MongoDB vs PostgreSQL vs file-based) |
| `dirty-flag-phases.md` | Design document for the unsaved changes detection feature (phases of implementation) |
| `sfsg-name-matching-issue.md` | Documents an issue where SFSG eligibility/category names didn't match expected values |
| `spreadsheet-data-flow.md` | Internal doc showing how spreadsheet columns map to org/service fields during import |
| `spreadsheet-format.md` | Guide for users on what spreadsheet columns are expected |
| `spreadsheet-format.html` | HTML version of the spreadsheet format guide (served at `/docs/spreadsheet-format`) |
| `tests.md` | Test coverage documentation (what's tested, how to run, first-run notes) |
| `todo.md` | Project todo list |
| `false_commit.md` | Trick file — touching it triggers a dev-runner rebuild without changing real code |
| `.sequelizerc` | Historical Sequelize config (from before MongoDB migration) |
