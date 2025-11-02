import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Form, InputGroup, Spinner, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi'
import { eventsAPI } from '../../services/api'
import { toast } from 'react-toastify'

const CustomerHome = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchAllEvents()
  }, [search, category])

  const fetchAllEvents = async () => {
    setLoading(true)
    try {
      // Fetch featured events
      const featuredParams = {
        page: 1,
        size: 6,
        status: 'published',
        is_featured: true
      }
      const featuredResponse = await eventsAPI.getAll(featuredParams)
      setFeaturedEvents(featuredResponse.data?.items || [])

      // Fetch upcoming events
      const today = new Date().toISOString().split('T')[0]
      const upcomingParams = {
        page: 1,
        size: 6,
        status: 'published',
        from_date: today
      }
      const upcomingResponse = await eventsAPI.getAll(upcomingParams)
      setUpcomingEvents(upcomingResponse.data?.items || [])

      // Fetch filtered events
      const params = {
        page: 1,
        size: 12,
        status: 'published',
        ...(search && { search }),
        ...(category && { category })
      }
      const response = await eventsAPI.getAll(params)
      const eventsData = response.data?.items || response.data || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])
    } catch (error) {
      console.error('Error fetching events:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Không thể tải danh sách sự kiện'
      toast.error(errorMsg)
      setEvents([])
      setFeaturedEvents([])
      setUpcomingEvents([])
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

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white text-center py-5 rounded mb-5">
        <h1 className="display-4 mb-3">Khám phá Sự kiện Tuyệt vời</h1>
        <p className="lead">Tìm và đặt vé cho các sự kiện hot nhất</p>
        
        {/* Search Bar */}
        <div className="mt-4">
          <Row className="justify-content-center">
            <Col md={8}>
              <InputGroup size="lg">
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm sự kiện..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="justify-content-center mt-3">
            <Col md={4}>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                <option value="CONCERT">Concert</option>
                <option value="SPORTS">Thể thao</option>
                <option value="THEATER">Kịch</option>
                <option value="CONFERENCE">Hội thảo</option>
                <option value="FESTIVAL">Lễ hội</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="OTHER">Khác</option>
              </Form.Select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Featured Events */}
      {!loading && featuredEvents.length > 0 && (
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Sự kiện nổi bật</h2>
            <Button variant="outline-primary" size="sm" onClick={() => {
              setCategory('')
              setSearch('')
              fetchAllEvents()
            }}>
              Xem tất cả
            </Button>
          </div>
          <Row>
            {featuredEvents.map((event) => (
              <Col md={4} key={event.event_id} className="mb-4">
                <Card className="h-100 shadow-sm border-primary">
                  {event.image_url && (
                    <Card.Img 
                      variant="top" 
                      src={event.image_url} 
                      style={{ height: '220px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x220?text=Event'
                      }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <Badge bg="primary" className="me-2">
                        {event.category}
                      </Badge>
                      <Badge bg="danger">Nổi bật</Badge>
                    </div>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text className="text-muted small">
                      <FiCalendar className="me-1" />
                      {formatDate(event.event_date, event.event_time)}
                    </Card.Text>
                    <Card.Text className="text-muted small mb-3">
                      <FiMapPin className="me-1" />
                      {event.venue_name}
                      {event.city && ` - ${event.city}`}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-primary fw-bold fs-5">
                          {event.ticket_types && event.ticket_types.length > 0 
                            ? `Từ ${formatCurrency(event.ticket_types[0]?.price || 0)}`
                            : 'Liên hệ'}
                        </span>
                        <span className="text-muted small">
                          Đã bán: {event.tickets_sold || 0}/{event.total_capacity || 0}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => navigate(`/events/${event.event_id}`)}
                      >
                        Xem chi tiết <FiArrowRight className="ms-2" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Upcoming Events */}
      {!loading && upcomingEvents.length > 0 && !search && !category && (
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Sự kiện sắp tới</h2>
          </div>
          <Row>
            {upcomingEvents.slice(0, 3).map((event) => (
              <Col md={4} key={event.event_id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  {event.image_url && (
                    <Card.Img 
                      variant="top" 
                      src={event.image_url} 
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Event'
                      }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <Badge bg="warning" className="me-2">
                        {event.category}
                      </Badge>
                      {event.is_featured && (
                        <Badge bg="danger">Nổi bật</Badge>
                      )}
                    </div>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text className="text-muted small">
                      <FiCalendar className="me-1" />
                      {formatDate(event.event_date, event.event_time)}
                    </Card.Text>
                    <Card.Text className="text-muted small mb-3">
                      <FiMapPin className="me-1" />
                      {event.venue_name}
                      {event.city && ` - ${event.city}`}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-primary fw-bold">
                          {event.ticket_types && event.ticket_types.length > 0 
                            ? `Từ ${formatCurrency(event.ticket_types[0]?.price || 0)}`
                            : 'Liên hệ'}
                        </span>
                        <span className="text-muted small">
                          Đã bán: {event.tickets_sold || 0}/{event.total_capacity || 0}
                        </span>
                      </div>
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={() => navigate(`/events/${event.event_id}`)}
                      >
                        Xem chi tiết <FiArrowRight className="ms-2" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* All Events / Filtered Results */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">
            {search || category ? 'Kết quả tìm kiếm' : 'Tất cả sự kiện'}
          </h2>
          {(search || category) && (
            <Button variant="outline-secondary" size="sm" onClick={() => {
              setSearch('')
              setCategory('')
            }}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : events.length > 0 ? (
          <Row>
            {events.map((event) => (
              <Col md={4} key={event.event_id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  {event.image_url && (
                    <Card.Img 
                      variant="top" 
                      src={event.image_url} 
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Event'
                      }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <Badge bg="warning" className="me-2">
                        {event.category}
                      </Badge>
                      {event.is_featured && (
                        <Badge bg="danger">Nổi bật</Badge>
                      )}
                    </div>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text className="text-muted small">
                      <FiCalendar className="me-1" />
                      {formatDate(event.event_date, event.event_time)}
                    </Card.Text>
                    <Card.Text className="text-muted small mb-3">
                      <FiMapPin className="me-1" />
                      {event.venue_name}
                      {event.city && ` - ${event.city}`}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-primary fw-bold">
                          {event.ticket_types && event.ticket_types.length > 0 
                            ? `Từ ${formatCurrency(event.ticket_types[0]?.price || 0)}`
                            : 'Liên hệ'}
                        </span>
                        <span className="text-muted small">
                          Đã bán: {event.tickets_sold || 0}/{event.total_capacity || 0}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => navigate(`/events/${event.event_id}`)}
                      >
                        Xem chi tiết <FiArrowRight className="ms-2" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">Không tìm thấy sự kiện nào.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerHome

