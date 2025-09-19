const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 3000;

app.use(express.json());

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
};

app.get('/api/tourists', authenticate, (req, res) => {
  // Fetch tourist data from Firestore
  res.send('This is a protected route');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});