import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Spinner } from 'react-bootstrap'
import { 
  FiShoppingBag, FiDollarSign, FiTag, 
  FiTrendingUp, FiCalendar, FiClock 
} from 'react-icons/fi'
import { adminAPI } from '../services/api'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard()
      setStats(response.data)
    } catch (error) {
      toast.error('Không thể tải dữ liệu tổng quan')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4">Tổng quan</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Tổng đơn hàng</h6>
                  <h3>{stats?.total_orders || 0}</h3>
                </div>
                <FiShoppingBag size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Tổng doanh thu</h6>
                  <h3>{formatCurrency(stats?.total_revenue || 0)}</h3>
                </div>
                <FiDollarSign size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Vé đã bán</h6>
                  <h3>{stats?.total_tickets || 0}</h3>
                </div>
                <FiTag size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Sự kiện sắp tới</h6>
                  <h3>{stats?.upcoming_events || 0}</h3>
                </div>
                <FiCalendar size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="stat-card bg-danger text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Đơn hàng hôm nay</h6>
                  <h3>{stats?.orders_today || 0}</h3>
                </div>
                <FiClock size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="stat-card bg-secondary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Doanh thu tháng này</h6>
                  <h3>{formatCurrency(stats?.revenue_this_month || 0)}</h3>
                </div>
                <FiTrendingUp size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="table-responsive">
        <Card.Header>
          <h5 className="mb-0">Đơn hàng gần đây</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Trạng thái thanh toán</th>
                <th>Trạng thái đơn</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_orders?.length > 0 ? (
                stats.recent_orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span className={`badge ${
                        order.payment_status === 'completed' ? 'bg-success' :
                        order.payment_status === 'pending' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {order.payment_status === 'completed' ? 'Đã thanh toán' :
                         order.payment_status === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        order.order_status === 'confirmed' ? 'bg-success' :
                        order.order_status === 'pending' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {order.order_status === 'confirmed' ? 'Đã xác nhận' :
                         order.order_status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                      </span>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">Không có đơn hàng gần đây</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Dashboard
