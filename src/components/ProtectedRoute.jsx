import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('mammoscan_token')
  const user  = JSON.parse(localStorage.getItem('mammoscan_user') || '{}')

  if (!token || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}