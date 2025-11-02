import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Badge, Spinner, Button } from 'react-bootstrap'
import { FiEye } from 'react-icons/fi'
import { ordersAPI } from '../../services/api'
import { toast } from 'react-toastify'

const CustomerOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await ordersAPI.getAll({ page: 1, size: 50 })
      setOrders(response.data.items || response.data || [])
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
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
      'cancelled': { bg: 'secondary', text: 'Đã hủy' }
    }
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status }
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4">Đơn hàng của tôi</h2>
      <Card>
        <Card.Body>
          {orders.length > 0 ? (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Sự kiện</th>
                  <th>Số lượng vé</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái thanh toán</th>
                  <th>Trạng thái đơn</th>
                  <th>Ngày đặt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_number}</td>
                    <td>{order.event?.title || 'N/A'}</td>
                    <td>{order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>{getPaymentBadge(order.payment_status)}</td>
                    <td>{getStatusBadge(order.order_status)}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/my-orders/${order.order_id}`)}
                      >
                        <FiEye className="me-1" />
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">Bạn chưa có đơn hàng nào.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default CustomerOrders

