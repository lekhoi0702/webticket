import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Badge, Spinner, Button, Row, Col } from 'react-bootstrap'
import { FiEye, FiCalendar, FiMapPin } from 'react-icons/fi'
import { ticketsAPI } from '../../services/api'
import { toast } from 'react-toastify'

const CustomerTickets = () => {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await ticketsAPI.getAll()
      setTickets(response.data || [])
    } catch (error) {
      toast.error('Không thể tải danh sách vé')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { bg: 'success', text: 'Còn hiệu lực' },
      'used': { bg: 'info', text: 'Đã sử dụng' },
      'cancelled': { bg: 'danger', text: 'Đã hủy' }
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
      <h2 className="mb-4">Vé của tôi</h2>
      {tickets.length > 0 ? (
        <Row>
          {tickets.map((ticket) => (
            <Col md={6} key={ticket.ticket_id} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">{ticket.event?.title || 'N/A'}</h5>
                      <p className="text-muted small mb-0">
                        <FiCalendar className="me-1" />
                        {formatDate(ticket.event?.event_date)}
                      </p>
                      {ticket.event?.venue_name && (
                        <p className="text-muted small mb-0">
                          <FiMapPin className="me-1" />
                          {ticket.event.venue_name}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <hr />
                  <div className="mb-3">
                    <small className="text-muted d-block">Mã vé</small>
                    <strong className="fs-5">{ticket.ticket_code}</strong>
                  </div>
                  {ticket.ticket_type_name && (
                    <div className="mb-2">
                      <small className="text-muted">Loại vé: </small>
                      <span>{ticket.ticket_type_name}</span>
                    </div>
                  )}
                  {ticket.seat_info && (
                    <div className="mb-2">
                      <small className="text-muted">Ghế: </small>
                      <span>{ticket.seat_info}</span>
                    </div>
                  )}
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="w-100"
                    onClick={() => navigate(`/my-tickets/${ticket.ticket_code}`)}
                  >
                    <FiEye className="me-2" />
                    Xem chi tiết
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">Bạn chưa có vé nào.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default CustomerTickets

