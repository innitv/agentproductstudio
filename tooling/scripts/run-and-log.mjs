import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const name = process.argv[2];
const commandString = process.argv[3];

if (!name || !commandString) {
  console.error('Usage: node run-and-log.mjs <log-name> "<command>"');
  process.exit(1);
}

const logsDir = path.resolve(__dirname, '../../reports/logs');

// Ensure directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `${name}.log`);
const writeStream = fs.createWriteStream(logFile, { flags: 'w', encoding: 'utf8' });

// Log execution start
const timestamp = new Date().toISOString();
writeStream.write(`=== Execution Started at ${timestamp} ===\n`);
writeStream.write(`Command: ${commandString}\n\n`);

console.log(`\x1b[36m[Logger]\x1b[0m Running: "${commandString}" (logging to reports/logs/${name}.log)...`);

// Execute command
const child = spawn(commandString, { shell: true });

child.stdout.on('data', (data) => {
  process.stdout.write(data);
  writeStream.write(data);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
  writeStream.write(data);
});

child.on('close', (code) => {
  const endTimestamp = new Date().toISOString();
  writeStream.write(`\n=== Execution Finished at ${endTimestamp} with code ${code} ===\n`);
  writeStream.end();

  if (code !== 0) {
    console.error(`\n\x1b[31m[Logger] Command "${commandString}" failed with exit code ${code}\x1b[0m`);
  } else {
    console.log(`\n\x1b[32m[Logger] Command "${commandString}" completed successfully!\x1b[0m`);
  }
  process.exit(code ?? 0);
});
