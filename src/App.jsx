import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { StartPage } from './pages/StartPage'
import { LoginPage } from './pages/LoginPage'
import { FreelancerLoginPage } from './pages/FreelancerLoginPage'
import { RegisterFreelancerPage } from './pages/RegisterFreelancerPage'
import { ExplorePage } from './pages/ExplorePage'
import ChatPage from './pages/ChatPage'
import { FreelancersPage } from './pages/FreelancersPage'
import { DirectMessagesPage } from './pages/DirectMessagesPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/start" element={<StartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/freelancers" element={<FreelancersPage />} />
      <Route path="/freelancers/:category" element={<FreelancersPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/client-messages" element={<DirectMessagesPage role="client" />} />
      <Route path="/freelancer-inbox" element={<DirectMessagesPage role="freelancer" />} />
      <Route path="/freelancer-login" element={<FreelancerLoginPage />} />
      <Route path="/register-freelancer" element={<RegisterFreelancerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
