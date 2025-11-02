import React, { useState, useEffect } from 'react'
import { 
  Table, Card, Badge, Button, Spinner, 
  Form, InputGroup, Pagination, Modal, Row, Col 
} from 'react-bootstrap'
import { FiSearch, FiEye } from 'react-icons/fi'
import { adminAPI, ordersAPI } from '../services/api'
import { toast } from 'react-toastify'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [pageSize] = useState(20)

  useEffect(() => {
    fetchOrders()
  }, [page, filters])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        size: pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.payment_status && { payment_status: filters.payment_status }),
      }
      const response = await adminAPI.getAllOrders(params)
      setOrders(response.data.items || response.data || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId)
      return response.data
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Không thể tải chi tiết đơn hàng')
      return null
    }
  }

  const handleUpdateStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, orderStatus, paymentStatus)
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      fetchOrders()
      setShowModal(false)
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái đơn hàng')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'cancelled': 'Đã hủy'
    }
    return statusMap[status] || status
  }

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ thanh toán',
      'completed': 'Đã thanh toán',
      'failed': 'Thất bại',
      'cancelled': 'Đã hủy'
    }
    return statusMap[status] || status
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

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="page-header">
        <h2 className="mb-0">Quản lý Đơn hàng</h2>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Label>Trạng thái đơn hàng</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value })
                  setPage(1)
                }}
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Trạng thái thanh toán</Form.Label>
              <Form.Select
                value={filters.payment_status}
                onChange={(e) => {
                  setFilters({ ...filters, payment_status: e.target.value })
                  setPage(1)
                }}
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="completed">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
                <option value="cancelled">Đã hủy</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>&nbsp;</Form.Label>
              <div>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setFilters({ status: '', payment_status: '' })
                    setPage(1)
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="table-responsive">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>TT Thanh toán</th>
                    <th>TT Đơn hàng</th>
                    <th>Ngày</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.order_id}>
                        <td>{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>{order.customer_email}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td>{getPaymentMethodText(order.payment_method)}</td>
                        <td>
                          <Badge bg={
                            order.payment_status === 'completed' ? 'success' :
                            order.payment_status === 'pending' ? 'warning' : 'danger'
                          }>
                            {getPaymentStatusText(order.payment_status)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={
                            order.order_status === 'confirmed' ? 'success' :
                            order.order_status === 'pending' ? 'warning' : 'secondary'
                          }>
                            {getStatusText(order.order_status)}
                          </Badge>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={async () => {
                              const orderDetails = await fetchOrderDetails(order.order_id)
                              if (orderDetails) {
                                setSelectedOrder(orderDetails)
                                setShowModal(true)
                              }
                            }}
                          >
                            <FiEye className="me-1" />
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center">Không tìm thấy đơn hàng</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <Pagination className="mt-3">
                  <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
                  <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1
                    if (pageNum === 1 || pageNum === totalPages || 
                        (pageNum >= page - 2 && pageNum <= page + 2)) {
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === page}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      )
                    }
                    return null
                  })}
                  <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
                  <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
                </Pagination>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng - {selectedOrder?.order_number}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Khách hàng:</strong> {selectedOrder.customer_name}
                </Col>
                <Col md={6}>
                  <strong>Email:</strong> {selectedOrder.customer_email}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Số điện thoại:</strong> {selectedOrder.customer_phone || 'N/A'}
                </Col>
                <Col md={6}>
                  <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.total_amount)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Phương thức thanh toán:</strong> {getPaymentMethodText(selectedOrder.payment_method)}
                </Col>
                <Col md={6}>
                  <strong>Mã giao dịch:</strong> {selectedOrder.transaction_id || 'N/A'}
                </Col>
              </Row>
              <hr />
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Trạng thái đơn hàng</Form.Label>
                  <Form.Select
                    value={selectedOrder.order_status}
                    onChange={(e) => setSelectedOrder({
                      ...selectedOrder,
                      order_status: e.target.value
                    })}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Trạng thái thanh toán</Form.Label>
                  <Form.Select
                    value={selectedOrder.payment_status}
                    onChange={(e) => setSelectedOrder({
                      ...selectedOrder,
                      payment_status: e.target.value
                    })}
                  >
                    <option value="pending">Chờ thanh toán</option>
                    <option value="completed">Đã thanh toán</option>
                    <option value="failed">Thất bại</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                </Col>
              </Row>
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div className="mt-3">
                  <h6>Chi tiết đơn hàng</h6>
                  <Table size="sm" striped className="mt-2">
                    <thead>
                      <tr>
                        <th>Loại vé/Ghế</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items.map((item, idx) => (
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
                        <td><strong>{formatCurrency(selectedOrder.total_amount)}</strong></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={() => handleUpdateStatus(
              selectedOrder.order_id,
              selectedOrder.order_status,
              selectedOrder.payment_status
            )}
          >
            Cập nhật trạng thái
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Orders
