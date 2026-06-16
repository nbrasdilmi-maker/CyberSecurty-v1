const fs = require('fs');
const path = require('path');

const results = [];
const excluded = ['node_modules', '.next', '.git', 'public/sw.js', 'public/workbox-'];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (excluded.some(e => fullPath.includes(e))) continue;
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      // Look for hardcoded secrets in non-env files
      if (!fullPath.includes('.env') && !fullPath.includes('create-admin')) {
        lines.forEach((line, i) => {
          // Check for JWT secret-like values
          if (line.includes('process.env') || line.includes('process.env')) return;
          if (line.match(/(?:secret|password|token|key)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/i)) {
            if (!line.includes('process.env') && !line.includes('import') && !line.includes('var ') && !line.includes('const ') && !line.includes('let ')) {
              results.push({ file: fullPath, line: i + 1, match: line.trim().substring(0, 80) });
            }
          }
        });
      }

      // Check for dangerous patterns
      lines.forEach((line, i) => {
        if (line.includes('innerHTML') || line.includes('dangerouslySetInnerHTML')) {
          results.push({ file: fullPath, line: i + 1, type: 'XSS', match: line.trim().substring(0, 80) });
        }
        if (line.includes('eval(')) {
          results.push({ file: fullPath, line: i + 1, type: 'EVAL', match: line.trim().substring(0, 80) });
        }
        if (line.includes('exec(') && !line.includes('execSync')) {
          results.push({ file: fullPath, line: i + 1, type: 'COMMAND_INJECTION', match: line.trim().substring(0, 80) });
        }
      });
    }
  }
}

scanDir('src');

console.log('\n=== XSS / DANGEROUS PATTERNS ===');
results.filter(r => r.type).forEach(r => {
  console.log(`${r.file.split('\\').pop()}:${r.line} [${r.type}] ${r.match}`);
});

console.log('\n=== POTENTIAL HARDCODED SECRETS ===');
results.filter(r => !r.type).forEach(r => {
  console.log(`${r.file.split('\\').pop()}:${r.line} ${r.match}`);
});

console.log(`\nTotal: ${results.length} findings`);
