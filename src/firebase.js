import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBFjkg5uPikQb9qwGL5JuIT9G--2DP26RY",
  authDomain: "uos-exam-archive.firebaseapp.com",
  projectId: "uos-exam-archive",
  storageBucket: "uos-exam-archive.firebasestorage.app",
  messagingSenderId: "765098538563",
  appId: "1:765098538563:web:f20704a4502ec001a1c6f6",
  measurementId: "G-8SCYF7PZ6L"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
