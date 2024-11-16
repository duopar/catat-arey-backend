const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const config = {
    credential: cert(process.env.FIRESTORE_CREDENTIALS)
}
const firebaseApp = initializeApp(config)

const dbProduction = getFirestore(firebaseApp)
const dbDevelopment = getFirestore(firebaseApp, 'development')

module.exports = process.env.NODE_ENV === 'production' ? dbProduction : dbDevelopment