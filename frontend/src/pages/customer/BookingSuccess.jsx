import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, Button, Alert } from 'react-bootstrap'
import { FiCheckCircle, FiHome, FiTag } from 'react-icons/fi'

const BookingSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  if (!order) {
    return (
      <Alert variant="warning">
        Không tìm thấy thông tin đơn hàng
      </Alert>
    )
  }

  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <FiCheckCircle size={80} className="text-success" />
      </div>
      <h2 className="mb-3">Đặt vé thành công!</h2>
      <Card className="mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <p className="mb-2"><strong>Mã đơn hàng:</strong></p>
          <p className="fs-4 text-primary mb-4">{order.order_number}</p>
          <p className="text-muted">
            Chúng tôi đã gửi thông tin đơn hàng đến email của bạn.
            Vui lòng kiểm tra email để xem chi tiết vé.
          </p>
          <div className="mt-4">
            <Button
              variant="primary"
              className="me-2"
              onClick={() => navigate('/my-orders')}
            >
              <FiTag className="me-2" />
              Xem đơn hàng
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => navigate('/')}
            >
              <FiHome className="me-2" />
              Về trang chủ
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default BookingSuccess

