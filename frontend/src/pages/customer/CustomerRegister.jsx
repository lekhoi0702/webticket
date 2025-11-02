import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { toast } from 'react-toastify'

const CustomerRegister = ({ onRegisterSuccess }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      await authAPI.register({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password,
        role: 'customer'
      })
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      if (onRegisterSuccess) {
        onRegisterSuccess()
      }
      navigate('/login')
    } catch (err) {
      let errorMsg = 'Đăng ký thất bại'
      if (err.code === 'ERR_NETWORK' || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.'
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail
      }
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body className="p-4">
              <Card.Title className="text-center mb-4">
                <h2>Đăng Ký</h2>
                <p className="text-muted small">Tạo tài khoản để đặt vé dễ dàng</p>
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Nhập số điện thoại (tùy chọn)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
                <div className="text-center">
                  <p className="mb-0">
                    Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default CustomerRegister

