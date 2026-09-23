import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSH4qb9fCiKsOe-zDnpGpmZvt3yRzwtlA",
  authDomain: "strona-mamy-146b5.firebaseapp.com",
  projectId: "strona-mamy-146b5",
  storageBucket: "strona-mamy-146b5.firebasestorage.app",
  messagingSenderId: "596370059815",
  appId: "1:596370059815:web:4ddff70892950d851c5402",
  measurementId: "G-M1Q529LHYN",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

window.firebaseAccount = {
  signInWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password).then(
      ({ user }) => user,
    );
  },
  resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  },
  async createOrSignInWithEmail(name, email, password) {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (name) {
        await updateProfile(user, { displayName: name });
      }

      return { user, created: true };
    } catch (error) {
      if (error.code !== "auth/email-already-in-use") {
        throw error;
      }

      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return { user, created: false };
    }
  },
  signInWithGoogle() {
    return signInWithRedirect(auth, googleProvider);
  },
  signOut() {
    return signOut(auth);
  },
  getIdToken() {
    return auth.currentUser?.getIdToken() || Promise.resolve(null);
  },
  subscribe(callback) {
    return onAuthStateChanged(auth, callback);
  },
};

getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      console.info("Zalogowano przez Google:", result.user.email);
    }
  })
  .catch((error) => {
    console.error("Błąd logowania przez przekierowanie:", error);
  });

document.dispatchEvent(new CustomEvent("firebase-account-ready"));
