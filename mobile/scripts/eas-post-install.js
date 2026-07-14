#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

if (process.env.EAS_BUILD_PLATFORM !== 'android') {
  console.log('Skipping the Android Gradle wrapper check.');
  process.exit(0);
}

const projectRoot = path.resolve(__dirname, '..');
const wrapperJar = path.join(
  projectRoot,
  'android',
  'gradle',
  'wrapper',
  'gradle-wrapper.jar'
);

if (fs.existsSync(wrapperJar)) {
  console.log('Gradle wrapper JAR is present.');
  process.exit(0);
}

console.log('Gradle wrapper JAR is missing; regenerating the Android project.');

const expoCli = require.resolve('expo/bin/cli');
const result = spawnSync(
  process.execPath,
  [
    expoCli,
    'prebuild',
    '--platform',
    'android',
    '--clean',
    '--no-install',
  ],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      EXPO_NO_GIT_STATUS: '1',
    },
    stdio: 'inherit',
  }
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (!fs.existsSync(wrapperJar)) {
  throw new Error(`Expo Prebuild did not create ${wrapperJar}`);
}

console.log('Gradle wrapper JAR regenerated successfully.');
