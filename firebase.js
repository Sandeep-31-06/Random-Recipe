import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyDG5rQLBOh0ClCu94mPWsSkMnQoILYRErk",
  authDomain: "recipe-f9692.firebaseapp.com",
  projectId: "recipe-f9692",
  storageBucket: "recipe-f9692.firebasestorage.app",
  messagingSenderId: "518051951258",
  appId: "1:518051951258:web:bd12889a6fe84c32e8e523",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth };
