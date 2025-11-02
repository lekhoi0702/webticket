import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const CustomerLogin = ({ onLogin }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onLogin(formData)
      toast.success('Đăng nhập thành công!')
      navigate('/')
    } catch (err) {
      let errorMsg = 'Đăng nhập thất bại'
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
        <Col md={5}>
          <Card>
            <Card.Body className="p-4">
              <Card.Title className="text-center mb-4">
                <h2>Đăng Nhập</h2>
                <p className="text-muted small">Đăng nhập để đặt vé và quản lý đơn hàng</p>
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
                <div className="text-center">
                  <p className="mb-0">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
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

export default CustomerLogin

