const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (file.endsWith('.js')) {
      execFileSync(process.execPath, ['--check', file]);
      console.log(`OK ${path.relative(process.cwd(), file)}`);
    }
  }
}

visit(path.join(__dirname, '..', 'src'));
visit(path.join(__dirname, '..', 'scripts'));
visit(path.join(__dirname, '..', 'tests'));
