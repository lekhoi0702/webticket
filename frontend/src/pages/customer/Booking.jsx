import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Form, Button, Alert, Row, Col, Table } from 'react-bootstrap'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { ordersAPI } from '../../services/api'
import { toast } from 'react-toastify'

const Booking = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { event, items } = location.state || {}
  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    payment_method: 'credit_card',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!event || !items || items.length === 0) {
      toast.error('Thông tin đặt vé không hợp lệ')
      navigate('/')
    }
  }, [event, items, navigate])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  const calculateTotal = () => {
    if (!items) return 0
    return items.reduce((sum, item) => {
      const ticketType = event?.ticket_types?.find(tt => tt.ticket_type_id === item.ticket_type_id)
      return sum + ((ticketType?.price || 0) * item.quantity)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        event_id: event.event_id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        payment_method: formData.payment_method,
        notes: formData.notes,
        items: items
      }

      const response = await ordersAPI.create(orderData)
      toast.success('Đặt vé thành công!')
      navigate('/booking-success', { state: { order: response.data } })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Đặt vé thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (!event || !items) {
    return (
      <Alert variant="warning">
        Vui lòng chọn vé trước khi đặt
      </Alert>
    )
  }

  return (
    <div>
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
        <FiArrowLeft className="me-2" />
        Quay lại
      </Button>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Thông tin sự kiện</h4>
            </Card.Header>
            <Card.Body>
              <h5>{event.title}</h5>
              <p className="text-muted">{event.venue_name}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h4 className="mb-0">Thông tin khách hàng</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        required
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Phương thức thanh toán *</Form.Label>
                  <Form.Select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    required
                  >
                    <option value="credit_card">Thẻ tín dụng</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="e_wallet">Ví điện tử</option>
                    <option value="cash">Tiền mặt</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Form.Group>

                <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Tóm tắt đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              <Table size="sm">
                <thead>
                  <tr>
                    <th>Loại vé</th>
                    <th>SL</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const ticketType = event.ticket_types?.find(tt => tt.ticket_type_id === item.ticket_type_id)
                    return (
                      <tr key={idx}>
                        <td>{ticketType?.name || 'N/A'}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(ticketType?.price || 0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Tổng cộng:</strong>
                <strong className="text-primary">{formatCurrency(calculateTotal())}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Booking

