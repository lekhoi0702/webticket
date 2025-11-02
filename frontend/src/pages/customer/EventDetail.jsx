import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Badge, Spinner, Table, Alert } from 'react-bootstrap'
import { FiCalendar, FiMapPin, FiUser, FiTag, FiShoppingCart } from 'react-icons/fi'
import { eventsAPI } from '../../services/api'
import { toast } from 'react-toastify'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [ticketTypes, setTicketTypes] = useState([])
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicketTypes, setSelectedTicketTypes] = useState({})
  const [selectedSeats, setSelectedSeats] = useState([])
  const [seatFilterSection, setSeatFilterSection] = useState('')

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    setLoading(true)
    try {
      const eventResponse = await eventsAPI.getById(id)
      const eventData = eventResponse.data
      setEvent(eventData)
      
      // Try to fetch ticket types, but don't fail if it doesn't work
      try {
        const ticketTypesResponse = await eventsAPI.getTicketTypes(id)
        const types = ticketTypesResponse.data || []
        setTicketTypes(types)
        
        // Store ticket types in event for booking
        if (eventData) {
          eventData.ticket_types = types
          setEvent(eventData)
        }
      } catch (ticketError) {
        console.warn('Could not load ticket types:', ticketError)
        setTicketTypes([])
      }

      // Try to fetch seats if event has seat map
      if (eventData?.has_seat_map) {
        try {
          const seatsResponse = await eventsAPI.getSeats(id)
          setSeats(seatsResponse.data || [])
        } catch (seatError) {
          console.warn('Could not load seats:', seatError)
          setSeats([])
        }
      }
    } catch (error) {
      toast.error('Không thể tải thông tin sự kiện')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString, timeString) => {
    if (!dateString) return '-'
    const date = new Date(dateString + (timeString ? `T${timeString}` : ''))
    return date.toLocaleDateString('vi-VN', {
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

  const handleQuantityChange = (ticketTypeId, quantity) => {
    setSelectedTicketTypes({
      ...selectedTicketTypes,
      [ticketTypeId]: Math.max(0, Math.min(quantity, ticketTypes.find(t => t.ticket_type_id === ticketTypeId)?.max_purchase || 10))
    })
  }

  const getSeatStatusColor = (seat) => {
    if (selectedSeats.includes(seat.seat_id)) {
      return 'primary'
    }
    if (seat.status === 'booked') {
      return 'danger'
    }
    if (seat.status === 'reserved') {
      return 'warning'
    }
    if (seat.status === 'blocked') {
      return 'secondary'
    }
    return 'success'
  }

  const handleSeatToggle = (seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  const handleBooking = () => {
    const items = []

    // Add ticket types
    ticketTypes
      .filter(tt => selectedTicketTypes[tt.ticket_type_id] > 0)
      .forEach(tt => {
        items.push({
          ticket_type_id: tt.ticket_type_id,
          quantity: selectedTicketTypes[tt.ticket_type_id]
        })
      })

    // Add seats
    selectedSeats.forEach(seatId => {
      items.push({
        seat_id: seatId,
        quantity: 1
      })
    })

    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất một loại vé hoặc chỗ ngồi')
      return
    }

    navigate('/booking', {
      state: {
        event,
        items
      }
    })
  }

  const calculateTotal = () => {
    let total = 0
    
    // Ticket types total
    ticketTypes.forEach(tt => {
      const qty = selectedTicketTypes[tt.ticket_type_id] || 0
      total += parseFloat(tt.price) * qty
    })

    // Seats total
    selectedSeats.forEach(seatId => {
      const seat = seats.find(s => s.seat_id === seatId)
      if (seat) {
        total += parseFloat(seat.price)
      }
    })

    return total
  }

  const totalItems = Object.values(selectedTicketTypes).reduce((sum, qty) => sum + qty, 0) + selectedSeats.length

  // Get available sections for seat map
  const availableSections = [...new Set(seats.map(s => s.section))].filter(Boolean)

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (!event) {
    return (
      <Alert variant="danger">
        Không tìm thấy sự kiện
      </Alert>
    )
  }

  return (
    <div>
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
        ← Quay lại
      </Button>

      <Row>
        <Col md={8}>
          {event.banner_url && (
            <img 
              src={event.banner_url} 
              alt={event.title}
              className="img-fluid rounded mb-4"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=Event+Banner'
              }}
            />
          )}

          <Card className="mb-4">
            <Card.Body>
              <div className="mb-3">
                <Badge bg="primary" className="me-2">{event.category}</Badge>
                {event.is_featured && <Badge bg="danger">Nổi bật</Badge>}
              </div>
              <h1 className="mb-3">{event.title}</h1>
              <p className="lead">{event.description}</p>

              <hr />

              <Row className="mb-3">
                <Col md={6}>
                  <p><FiCalendar className="me-2" /><strong>Ngày giờ:</strong></p>
                  <p>{formatDate(event.event_date, event.event_time)}</p>
                  {event.event_end_date && (
                    <p className="text-muted small">
                      Kết thúc: {formatDate(event.event_end_date, event.event_end_time)}
                    </p>
                  )}
                </Col>
                <Col md={6}>
                  <p><FiMapPin className="me-2" /><strong>Địa điểm:</strong></p>
                  <p>{event.venue_name}</p>
                  {event.venue_address && (
                    <p className="text-muted small">{event.venue_address}</p>
                  )}
                  {event.city && (
                    <Badge bg="info">{event.city}</Badge>
                  )}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <p><FiUser className="me-2" /><strong>Người tổ chức:</strong> {event.organizer}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Tình trạng:</strong> <Badge bg={event.status === 'published' ? 'success' : 'secondary'}>
                    {event.status === 'published' ? 'Đang bán vé' : 'Sắp diễn ra'}
                  </Badge></p>
                  <p><strong>Sức chứa:</strong> {event.total_capacity || 0} chỗ</p>
                  <p><strong>Đã bán:</strong> {event.tickets_sold || 0} vé</p>
                </Col>
              </Row>

              {event.description && (
                <div className="mt-4">
                  <h5>Mô tả sự kiện</h5>
                  <p className="text-muted">{event.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0"><FiTag className="me-2" />Chọn vé</h5>
            </Card.Header>
            <Card.Body>
              {ticketTypes.length > 0 ? (
                <>
                  <Table striped size="sm">
                    <thead>
                      <tr>
                        <th>Loại vé</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketTypes.map((tt) => {
                        const available = tt.quantity_available - tt.quantity_sold
                        const selectedQty = selectedTicketTypes[tt.ticket_type_id] || 0
                        return (
                          <tr key={tt.ticket_type_id}>
                            <td>
                              <small>{tt.name}</small>
                              {available <= 0 && (
                                <Badge bg="danger" className="ms-2">Hết vé</Badge>
                              )}
                            </td>
                            <td>{formatCurrency(tt.price)}</td>
                            <td>
                              {available > 0 ? (
                                <div className="d-flex align-items-center">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => handleQuantityChange(tt.ticket_type_id, selectedQty - 1)}
                                    disabled={selectedQty <= 0}
                                  >
                                    -
                                  </Button>
                                  <span className="mx-2">{selectedQty}</span>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => handleQuantityChange(tt.ticket_type_id, selectedQty + 1)}
                                    disabled={selectedQty >= Math.min(available, tt.max_purchase)}
                                  >
                                    +
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>

                  {/* Seat Map Section */}
                  {event.has_seat_map && seats.length > 0 && (
                    <div className="mt-4">
                      <hr />
                      <h6 className="mb-3">Chọn chỗ ngồi</h6>
                      
                      {availableSections.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label small">Lọc theo khu vực:</label>
                          <select 
                            className="form-select form-select-sm"
                            value={seatFilterSection}
                            onChange={(e) => setSeatFilterSection(e.target.value)}
                          >
                            <option value="">Tất cả khu vực</option>
                            {availableSections.map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="seat-map-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <div className="d-flex flex-wrap gap-2">
                          {seats
                            .filter(s => !seatFilterSection || s.section === seatFilterSection)
                            .map(seat => {
                              const isSelected = selectedSeats.includes(seat.seat_id)
                              const isAvailable = seat.status === 'available'
                              return (
                                <button
                                  key={seat.seat_id}
                                  type="button"
                                  className={`btn btn-sm ${getSeatStatusColor(seat)} ${isSelected ? 'border border-3 border-dark' : ''}`}
                                  onClick={() => isAvailable && handleSeatToggle(seat.seat_id)}
                                  disabled={!isAvailable}
                                  title={`${seat.section}-${seat.row_label}-${seat.seat_number} - ${formatCurrency(seat.price)}`}
                                  style={{ 
                                    width: '40px', 
                                    height: '40px',
                                    fontSize: '10px'
                                  }}
                                >
                                  {seat.row_label}{seat.seat_number}
                                </button>
                              )
                            })}
                        </div>
                        <div className="mt-3 small">
                          <div className="d-flex gap-3">
                            <div><span className="badge bg-success me-2">■</span> Trống</div>
                            <div><span className="badge bg-primary me-2">■</span> Đã chọn</div>
                            <div><span className="badge bg-danger me-2">■</span> Đã đặt</div>
                            <div><span className="badge bg-warning me-2">■</span> Đã giữ</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {totalItems > 0 && (
                    <div className="mt-3">
                      <hr />
                      <div className="d-flex justify-content-between mb-2">
                        <strong>Tổng số vé/chỗ:</strong>
                        <strong>{totalItems}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-3">
                        <strong>Tổng tiền:</strong>
                        <strong className="text-primary fs-5">{formatCurrency(calculateTotal())}</strong>
                      </div>
                      <Button
                        variant="primary"
                        className="w-100"
                        size="lg"
                        onClick={handleBooking}
                      >
                        <FiShoppingCart className="me-2" />
                        Đặt vé ngay
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted text-center">Chưa có loại vé nào</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default EventDetail

