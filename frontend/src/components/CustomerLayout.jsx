import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap'
import { FiUser, FiLogOut, FiTag, FiShoppingBag, FiCalendar } from 'react-icons/fi'

const CustomerLayout = ({ children, user, onLogout }) => {
  const navigate = useNavigate()

  return (
    <div className="customer-layout">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            <FiTag className="me-2" />
            WebTicket
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/">
                Trang chủ
              </Nav.Link>
              <Nav.Link as={NavLink} to="/events">
                <FiCalendar className="me-1" />
                Sự kiện
              </Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              {user ? (
                <>
                  <Nav.Link as={NavLink} to="/my-orders">
                    <FiShoppingBag className="me-1" />
                    Đơn hàng của tôi
                  </Nav.Link>
                      <Nav.Link as={NavLink} to="/my-tickets">
                        <FiTag className="me-1" />
                        Vé của tôi
                      </Nav.Link>
                      <Dropdown align="end" className="ms-2">
                        <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                          <FiUser className="me-2" />
                          {user.full_name || user.email}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.ItemText>
                            <small>{user.email}</small>
                          </Dropdown.ItemText>
                          <Dropdown.Divider />
                          <Dropdown.Item as={NavLink} to="/profile">
                            <FiUser className="me-2" />
                            Tài khoản của tôi
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={onLogout}>
                            <FiLogOut className="me-2" />
                            Đăng xuất
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline-light" 
                    className="me-2"
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/register')}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="pb-5">
        {children}
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <Container>
          <p className="mb-0">&copy; 2024 WebTicket. Tất cả quyền được bảo lưu.</p>
        </Container>
      </footer>
    </div>
  )
}

export default CustomerLayout

