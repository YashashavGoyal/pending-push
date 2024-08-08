import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './utils/auth.jsx'
import { ToastContainer } from 'react-toastify'
import App from './App.jsx'
import './index.css'
import 'react-toastify/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <React.StrictMode>
      <App />
    <ToastContainer />
    </React.StrictMode>
  </AuthProvider>
)
