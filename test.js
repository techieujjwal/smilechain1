const { execSync } = require('child_process');
const fs = require('fs');
try {
  console.log('Running tsc...');
  const out = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  fs.writeFileSync('tsc_log.txt', out);
  console.log('Done tsc.');
} catch (e) {
  fs.writeFileSync('tsc_log.txt', String(e.stdout) + '\n' + String(e.stderr));
  console.log('Error tsc.');
}
