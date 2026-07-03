const fs = require('fs');
const path = require('path');

function loadLocalEnvironment() {
  const environmentFile =
    path.join(__dirname, '.env');

  if (!fs.existsSync(environmentFile)) {
    return;
  }

  const fileContent =
    fs.readFileSync(
      environmentFile,
      'utf8',
    );

  fileContent
    .split(/\r?\n/)
    .forEach(line => {
      const normalizedLine =
        line.trim();

      if (
        !normalizedLine
        || normalizedLine.startsWith('#')
        || !normalizedLine.includes('=')
      ) {
        return;
      }

      const separatorIndex =
        normalizedLine.indexOf('=');

      const name =
        normalizedLine
          .slice(0, separatorIndex)
          .trim();

      const value =
        normalizedLine
          .slice(separatorIndex + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');

      if (
        name
        && process.env[name] === undefined
      ) {
        process.env[name] = value;
      }
    });
}

loadLocalEnvironment();

module.exports = ({ config }) => {
  const googleMapsApiKey =
    process.env
      .EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    throw new Error(
      'Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. '
      + 'Añádela a mobile/.env o al entorno de EAS.',
    );
  }

  return {
    ...config,

    plugins: [
      ...(config.plugins ?? []),

      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Mesa usa tu ubicación para mostrarte restaurantes cercanos.',
        },
      ],

      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey:
            googleMapsApiKey,
        },
      ],
    ],
  };
};