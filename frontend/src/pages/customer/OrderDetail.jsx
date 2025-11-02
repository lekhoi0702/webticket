import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Table, Badge, Spinner, Button, Row, Col, Alert, Modal } from 'react-bootstrap'
import { FiArrowLeft, FiXCircle } from 'react-icons/fi'
import { ordersAPI } from '../../services/api'
import { toast } from 'react-toastify'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await ordersAPI.getById(id)
      setOrder(response.data)
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng')
      navigate('/my-orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await ordersAPI.cancel(id)
      toast.success('Hủy đơn hàng thành công')
      setShowCancelModal(false)
      fetchOrder()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể hủy đơn hàng')
    } finally {
      setCancelling(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { bg: 'warning', text: 'Chờ xử lý' },
      'confirmed': { bg: 'success', text: 'Đã xác nhận' },
      'cancelled': { bg: 'danger', text: 'Đã hủy' }
    }
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status }
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>
  }

  const getPaymentBadge = (status) => {
    const statusMap = {
      'pending': { bg: 'warning', text: 'Chờ thanh toán' },
      'completed': { bg: 'success', text: 'Đã thanh toán' },
      'failed': { bg: 'danger', text: 'Thất bại' },
      'cancelled': { bg: 'secondary', text: 'Đã hủy' },
      'refunded': { bg: 'info', text: 'Đã hoàn tiền' }
    }
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status }
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>
  }

  const getPaymentMethodText = (method) => {
    const methodMap = {
      'credit_card': 'Thẻ tín dụng',
      'bank_transfer': 'Chuyển khoản',
      'e_wallet': 'Ví điện tử',
      'cash': 'Tiền mặt'
    }
    return methodMap[method] || method
  }

  const canCancel = order && 
    order.order_status === 'pending' && 
    order.payment_status !== 'completed'

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (!order) {
    return (
      <Alert variant="danger">Không tìm thấy đơn hàng</Alert>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/my-orders')}>
          <FiArrowLeft className="me-2" />
          Quay lại
        </Button>
        {canCancel && (
          <Button
            variant="outline-danger"
            onClick={() => setShowCancelModal(true)}
          >
            <FiXCircle className="me-2" />
            Hủy đơn hàng
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Thông tin đơn hàng</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Mã đơn hàng:</strong> {order.order_number}</p>
              <p><strong>Ngày đặt:</strong> {formatDate(order.created_at)}</p>
              <p><strong>Trạng thái đơn:</strong> {getStatusBadge(order.order_status)}</p>
              <p><strong>Trạng thái thanh toán:</strong> {getPaymentBadge(order.payment_status)}</p>
            </Col>
            <Col md={6}>
              <p><strong>Sự kiện:</strong> {order.event?.title || 'N/A'}</p>
              <p><strong>Phương thức thanh toán:</strong> {getPaymentMethodText(order.payment_method)}</p>
              {order.transaction_id && (
                <p><strong>Mã giao dịch:</strong> {order.transaction_id}</p>
              )}
              {order.paid_at && (
                <p><strong>Ngày thanh toán:</strong> {formatDate(order.paid_at)}</p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Thông tin khách hàng</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Họ và tên:</strong> {order.customer_name}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
            </Col>
            <Col md={6}>
              <p><strong>Số điện thoại:</strong> {order.customer_phone || 'N/A'}</p>
            </Col>
          </Row>
          {order.notes && (
            <div className="mt-3">
              <strong>Ghi chú:</strong>
              <p className="text-muted">{order.notes}</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {order.order_items && order.order_items.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">Chi tiết đơn hàng</h4>
          </Card.Header>
          <Card.Body>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Loại vé/Ghế</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.ticket_type_id ? (
                        <span>Loại vé ID: {item.ticket_type_id}</span>
                      ) : (
                        <span>Ghế ID: {item.seat_id}</span>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-end"><strong>Tổng cộng:</strong></td>
                  <td><strong className="text-primary fs-5">{formatCurrency(order.total_amount)}</strong></td>
                </tr>
              </tfoot>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Alert variant="info">
        <strong>Lưu ý:</strong> Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email {order.customer_email}
      </Alert>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận hủy đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn hủy đơn hàng <strong>{order.order_number}</strong>?</p>
          <Alert variant="warning">
            Đơn hàng chỉ có thể hủy khi chưa thanh toán. Sau khi hủy, bạn sẽ không thể hoàn tác.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Đóng
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default OrderDetail

