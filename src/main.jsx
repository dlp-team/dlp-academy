import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode removed: Firebase onSnapshot listeners are incompatible with
// StrictMode's intentional double-invocation of effects in dev mode.
// This causes Firestore SDK internal assertion failures (ID: b815/ca9)
// when watch stream targets are rapidly added/removed/added on the same query.
createRoot(document.getElementById('root')).render(
  <App />
)
