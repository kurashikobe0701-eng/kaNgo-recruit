import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { ConfigProvider } from './ConfigContext'
import LoginPage from './components/LoginPage'
import ManagePage from './components/ManagePage'
import HiredPage from './components/HiredPage'
import SettingsPage from './components/SettingsPage'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('manage')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <ConfigProvider>
      <div className="container">
        <header>
          <h1>採用管理システム</h1>
          <button onClick={handleLogout}>ログアウト</button>
        </header>

        <div className="main-tabs">
          <div
            className={currentPage === 'manage' ? 'main-tab active' : 'main-tab'}
            onClick={() => setCurrentPage('manage')}
          >
            採用管理
          </div>
          <div
            className={currentPage === 'hired' ? 'main-tab active' : 'main-tab'}
            onClick={() => setCurrentPage('hired')}
          >
            採用実績
          </div>
          <div
            className={currentPage === 'settings' ? 'main-tab active' : 'main-tab'}
            onClick={() => setCurrentPage('settings')}
          >
            設定
          </div>
        </div>

        <main>
          {currentPage === 'manage' && <ManagePage />}
          {currentPage === 'hired' && <HiredPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </ConfigProvider>
  )
}

export default App
