const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const firebaseApp = initializeApp();

const dbProduction = getFirestore(firebaseApp);
const dbDevelopment = getFirestore(firebaseApp, 'development');

module.exports =
  process.env.NODE_ENV === 'production' ? dbProduction : dbDevelopment;
