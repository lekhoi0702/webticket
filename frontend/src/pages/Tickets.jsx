import React from 'react'
import { Card, Alert } from 'react-bootstrap'
import { FiTag } from 'react-icons/fi'

const Tickets = () => {
  return (
    <div>
      <div className="page-header">
        <h2 className="mb-0">Quản lý Vé</h2>
      </div>

      <Card>
        <Card.Body>
          <Alert variant="info">
            <FiTag className="me-2" />
            <strong>Thông tin:</strong> Trang này hiển thị danh sách vé trong hệ thống. 
            Vui lòng sử dụng menu bên trái để điều hướng đến các chức năng khác.
          </Alert>
          <p className="text-muted">
            Để xem danh sách vé chi tiết, vui lòng truy cập từ các đơn hàng hoặc sự kiện tương ứng.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Tickets
