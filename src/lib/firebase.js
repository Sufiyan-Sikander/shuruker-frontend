import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: 'AIzaSyBSSk5WF7gpbVvjUEDniiZCIN58hx3jzt8',
  authDomain: 'shurukerai.vercel.app',   // ← updated
  projectId: 'shruker-77fd2',
  storageBucket: 'shruker-77fd2.firebasestorage.app',
  messagingSenderId: '370811810935',
  appId: '1:370811810935:web:78f508d53c9c4df47f8272',
}

export function getFirebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}
