import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from './components/Layout'
import CustomerLayout from './components/CustomerLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventForm from './pages/EventForm'
import EventDetail from './pages/EventDetail'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Tickets from './pages/Tickets'
import CustomerHome from './pages/customer/CustomerHome'
import CustomerEventDetail from './pages/customer/EventDetail'
import Booking from './pages/customer/Booking'
import BookingSuccess from './pages/customer/BookingSuccess'
import CustomerLogin from './pages/customer/CustomerLogin'
import CustomerRegister from './pages/customer/CustomerRegister'
import CustomerOrders from './pages/customer/CustomerOrders'
import OrderDetail from './pages/customer/OrderDetail'
import CustomerTickets from './pages/customer/CustomerTickets'
import TicketDetail from './pages/customer/TicketDetail'
import Profile from './pages/customer/Profile'
import { authAPI } from './services/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // First, try to load user from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setLoading(false)
        return
      } catch (e) {
        // Invalid data in localStorage, clear it
        localStorage.removeItem('user')
      }
    }
    
    // If no saved user, try to get from API (will fail without auth, that's ok)
    try {
      const response = await authAPI.getMe()
      if (response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      // Not authenticated or connection error - that's fine
      setUser(null)
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const userData = response.data
      setUser(userData)
      // Save user to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (error) {
      throw error
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    )
  }

  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.role?.value === 'admin' || (typeof user.role === 'string' && user.role.toLowerCase() === 'admin'))

  return (
    <>
      <Routes>
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            isAdmin ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:id" element={<EventDetail />} />
                      <Route path="/events/new" element={<EventForm />} />
                      <Route path="/events/edit/:id" element={<EventForm />} />
                      <Route path="/orders" element={<Orders />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/tickets" element={<Tickets />} />
                </Routes>
              </Layout>
            ) : user ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } 
        />
        <Route 
          path="/admin/login" 
          element={
            isAdmin ? <Navigate to="/admin/dashboard" replace /> :
            <Login onLogin={handleLogin} />
          } 
        />
        
        {/* Customer Routes */}
        <Route 
          path="/*" 
          element={
            <CustomerLayout user={!isAdmin ? user : null} onLogout={handleLogout}>
              <CustomerRoutes 
                user={!isAdmin ? user : null} 
                isAdmin={isAdmin}
                onLogin={handleLogin}
                onRegisterSuccess={checkAuth}
              />
            </CustomerLayout>
          } 
        />
      </Routes>
      <ToastContainer />
    </>
  )
}

function CustomerRoutes({ user, isAdmin, onLogin, onRegisterSuccess }) {
  return (
    <Routes>
      <Route path="/" element={<CustomerHome />} />
      <Route path="/events" element={<CustomerHome />} />
      <Route path="/events/:id" element={<CustomerEventDetail />} />
      <Route 
        path="/login" 
        element={
          user && !isAdmin ? <Navigate to="/" replace /> : 
          <CustomerLogin onLogin={onLogin} />
        } 
      />
      <Route 
        path="/register" 
        element={
          user && !isAdmin ? <Navigate to="/" replace /> : 
          <CustomerRegister onRegisterSuccess={onRegisterSuccess} />
        } 
      />
      <Route 
        path="/booking" 
        element={
          user && !isAdmin ? <Booking user={user} /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/booking-success" 
        element={
          user && !isAdmin ? <BookingSuccess /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/my-orders" 
        element={
          user && !isAdmin ? <CustomerOrders /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/my-orders/:id" 
        element={
          user && !isAdmin ? <OrderDetail /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/my-tickets" 
        element={
          user && !isAdmin ? <CustomerTickets /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/my-tickets/:code" 
        element={
          user && !isAdmin ? <TicketDetail /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/profile" 
        element={
          user && !isAdmin ? <Profile /> : <Navigate to="/login" replace />
        } 
      />
    </Routes>
  )
}

export default App
