import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Badge, Spinner, Button, Row, Col, Alert } from 'react-bootstrap'
import { FiArrowLeft, FiCalendar, FiMapPin, FiUser, FiDollarSign } from 'react-icons/fi'
import { ticketsAPI } from '../../services/api'
import { toast } from 'react-toastify'

const TicketDetail = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (code) {
      fetchTicket()
    }
  }, [code])

  const fetchTicket = async () => {
    setLoading(true)
    try {
      const response = await ticketsAPI.getByCode(code)
      setTicket(response.data)
    } catch (error) {
      toast.error('Không thể tải thông tin vé')
      navigate('/my-tickets')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { bg: 'success', text: 'Còn hiệu lực' },
      'used': { bg: 'info', text: 'Đã sử dụng' },
      'cancelled': { bg: 'danger', text: 'Đã hủy' },
      'refunded': { bg: 'warning', text: 'Đã hoàn tiền' }
    }
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status }
    return <Badge bg={statusInfo.bg} className="fs-6">{statusInfo.text}</Badge>
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <Alert variant="danger">Không tìm thấy vé</Alert>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/my-tickets')}>
          <FiArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Thông tin vé</h4>
            {getStatusBadge(ticket.status)}
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={12} className="text-center mb-3">
              <div className="bg-light p-4 rounded">
                <small className="text-muted d-block mb-2">Mã vé</small>
                <h2 className="text-primary mb-0 font-monospace">{ticket.ticket_code}</h2>
              </div>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md={6}>
              <h5 className="mb-3">Thông tin sự kiện</h5>
              <p className="mb-2">
                <strong>Tên sự kiện:</strong><br />
                <span className="fs-5">{ticket.event?.title || 'N/A'}</span>
              </p>
              {ticket.event?.organizer && (
                <p className="mb-2">
                  <strong>Người tổ chức:</strong> {ticket.event.organizer}
                </p>
              )}
              <p className="mb-2">
                <FiCalendar className="me-2" />
                <strong>Ngày giờ:</strong> {formatDate(ticket.event?.event_date + 'T' + ticket.event?.event_time)}
              </p>
              {ticket.event?.venue_name && (
                <p className="mb-2">
                  <FiMapPin className="me-2" />
                  <strong>Địa điểm:</strong> {ticket.event.venue_name}
                </p>
              )}
              {ticket.event?.city && (
                <p className="mb-2">
                  <strong>Thành phố:</strong> {ticket.event.city}
                </p>
              )}
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Thông tin vé</h5>
              <p className="mb-2">
                <strong>Giá vé:</strong>
                <span className="fs-5 text-primary ms-2">{formatCurrency(ticket.price)}</span>
              </p>
              {ticket.ticket_type_name && (
                <p className="mb-2">
                  <strong>Loại vé:</strong> {ticket.ticket_type_name}
                </p>
              )}
              {ticket.seat_info && (
                <p className="mb-2">
                  <strong>Chỗ ngồi:</strong> {ticket.seat_info}
                </p>
              )}
              <p className="mb-2">
                <FiUser className="me-2" />
                <strong>Chủ vé:</strong> {ticket.user?.full_name || 'N/A'}
              </p>
              <p className="mb-2">
                <strong>Ngày mua:</strong> {formatDate(ticket.created_at)}
              </p>
              {ticket.checked_in_at && (
                <p className="mb-2">
                  <strong>Đã check-in lúc:</strong> {formatDate(ticket.checked_in_at)}
                </p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {ticket.order && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Thông tin đơn hàng</h5>
          </Card.Header>
          <Card.Body>
            <p><strong>Mã đơn hàng:</strong> {ticket.order.order_number}</p>
            <p><strong>Ngày đặt:</strong> {formatDate(ticket.order.created_at)}</p>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/my-orders/${ticket.order.order_id}`)}
            >
              Xem chi tiết đơn hàng
            </Button>
          </Card.Body>
        </Card>
      )}

      <Alert variant="info" className="mt-4">
        <strong>Lưu ý:</strong> Vui lòng giữ mã vé này để sử dụng khi tham gia sự kiện.
        {ticket.status === 'active' && ' Vé này vẫn còn hiệu lực.'}
      </Alert>
    </div>
  )
}

export default TicketDetail

