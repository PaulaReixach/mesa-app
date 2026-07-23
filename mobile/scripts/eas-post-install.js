#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

if (process.env.EAS_BUILD_PLATFORM !== 'android') {
  console.log('Skipping the Android Gradle wrapper check.');
  process.exit(0);
}

const projectRoot = path.resolve(__dirname, '..');
const wrapperBackup = path.join(__dirname, 'gradle-wrapper.jar.base64');
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

console.log('Gradle wrapper JAR is missing; restoring the bundled copy.');

const encodedWrapper = fs
  .readFileSync(wrapperBackup, 'utf8')
  .replace(/\s/g, '');

fs.mkdirSync(path.dirname(wrapperJar), {
  recursive: true,
});
fs.writeFileSync(wrapperJar, Buffer.from(encodedWrapper, 'base64'));

if (!fs.existsSync(wrapperJar)) {
  throw new Error(`Could not restore ${wrapperJar}`);
}

console.log('Gradle wrapper JAR restored successfully.');
