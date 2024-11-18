// @ts-nocheck
import { exec } from 'child_process';

const isContainer = process.env.APPTAINER_CONTAINER || process.env.DOCKER_CONTAINER;

var command = 'nodemon --watch src --ext ts --exec ts-node src/server.ts';
if (isContainer) {
  console.log('[INFO] Server Running in container environment');
  command += ' --legacy-watch';
} else {
  console.log('[INFO] Server Running in local environment');
}

const child = exec(command);

// Safely handle potentially null streams
child.stdout?.pipe(process.stdout);
child.stderr?.pipe(process.stderr);
