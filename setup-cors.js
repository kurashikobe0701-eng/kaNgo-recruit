import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'kurashi-recruit.firebasestorage.app'
});

const bucket = admin.storage().bucket();

const corsConfig = [
  {
    origin: ['*'],
    method: ['GET', 'HEAD', 'DELETE', 'POST', 'PUT'],
    responseHeader: ['Content-Type', 'x-goog-meta-uploaded-content-type'],
    maxAgeSeconds: 3600
  }
];

bucket.setCorsConfiguration(corsConfig)
  .then(() => {
    console.log('CORS configuration set successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting CORS configuration:', error);
    process.exit(1);
  });
