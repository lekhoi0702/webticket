import React from 'react'
import { NavLink } from 'react-router-dom'
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap'
import { 
  FiHome, FiCalendar, FiShoppingBag, FiUsers, 
  FiTag, FiLogOut, FiMenu 
} from 'react-icons/fi'

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar" style={{ width: '250px', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
        <div className="p-3 text-white border-bottom">
          <h4 className="mb-0">WebTicket Admin</h4>
          <small className="text-muted">Bảng điều khiển</small>
        </div>
        <Nav className="flex-column mt-3">
          <NavLink to="/admin/dashboard" className="nav-link">
            <FiHome className="me-2" />
            Tổng quan
          </NavLink>
          <NavLink to="/admin/events" className="nav-link">
            <FiCalendar className="me-2" />
            Sự kiện
          </NavLink>
          <NavLink to="/admin/orders" className="nav-link">
            <FiShoppingBag className="me-2" />
            Đơn hàng
          </NavLink>
          <NavLink to="/admin/users" className="nav-link">
            <FiUsers className="me-2" />
            Người dùng
          </NavLink>
          <NavLink to="/admin/tickets" className="nav-link">
            <FiTag className="me-2" />
            Vé
          </NavLink>
        </Nav>
        <div className="p-3 mt-auto border-top position-absolute bottom-0 w-100">
          <div className="text-white mb-2">
            <small>{user?.full_name || user?.email}</small>
          </div>
          <button 
            className="btn btn-outline-light btn-sm w-100"
            onClick={onLogout}
          >
            <FiLogOut className="me-2" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

