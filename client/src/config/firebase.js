import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Setup invisible reCAPTCHA verifier for Phone Auth
 */
export const setupRecaptcha = (elementId = 'recaptcha-container') => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Error clearing old recaptcha verifier:', e);
    }
    window.recaptchaVerifier = null;
  }

  const container = document.getElementById(elementId);
  if (container) {
    container.innerHTML = '';
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    }
  });

  return window.recaptchaVerifier;
};

/**
 * Send OTP via Firebase Phone Auth
 */
export const sendFirebaseOTP = async (mobileNumber, elementId = 'recaptcha-container') => {
  try {
    const verifier = setupRecaptcha(elementId);
    let formatted = mobileNumber.trim();
    if (!formatted.startsWith('+')) {
      formatted = `+91${formatted}`;
    }
    const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    console.error('[Firebase Phone Auth] Error sending OTP:', error);
    // Reset recaptcha if failed
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = '';
    }
    throw error;
  }
};

