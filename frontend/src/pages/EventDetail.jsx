import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card, Tabs, Tab, Button, Table, Modal, Form, Row, Col,
  Badge, Spinner, Alert, InputGroup
} from 'react-bootstrap'
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi'
import { eventsAPI } from '../services/api'
import { toast } from 'react-toastify'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [ticketTypes, setTicketTypes] = useState([])
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ticket-types')
  
  // Ticket Type Modal
  const [showTicketTypeModal, setShowTicketTypeModal] = useState(false)
  const [editingTicketType, setEditingTicketType] = useState(null)
  const [ticketTypeForm, setTicketTypeForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity_available: '',
    min_purchase: 1,
    max_purchase: 10,
    sale_start_date: '',
    sale_end_date: '',
  })
  
  // Seat Modal
  const [showSeatModal, setShowSeatModal] = useState(false)
  const [editingSeat, setEditingSeat] = useState(null)
  const [seatForm, setSeatForm] = useState({
    section: '',
    row_label: '',
    seat_number: '',
    price: '',
  })
  
  // Bulk Seat Modal
  const [showBulkSeatModal, setShowBulkSeatModal] = useState(false)
  const [bulkSeatForm, setBulkSeatForm] = useState({
    section: '',
    rows: '',
    seats_per_row: '',
    start_row: 'A',
    price: '',
  })

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fetchEventDetails = async () => {
    setLoading(true)
    try {
      const [eventRes, ticketTypesRes, seatsRes] = await Promise.all([
        eventsAPI.getById(id),
        eventsAPI.getTicketTypes(id).catch(() => ({ data: [] })),
        eventsAPI.getSeats(id).catch(() => ({ data: [] })),
      ])
      setEvent(eventRes.data)
      setTicketTypes(ticketTypesRes.data || [])
      setSeats(seatsRes.data || [])
    } catch (error) {
      toast.error('Không thể tải thông tin sự kiện')
      navigate('/admin/events')
    } finally {
      setLoading(false)
    }
  }

  // Ticket Type Handlers
  const handleTicketTypeSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTicketType) {
        await eventsAPI.updateTicketType(id, editingTicketType.ticket_type_id, ticketTypeForm)
        toast.success('Cập nhật loại vé thành công')
      } else {
        await eventsAPI.createTicketType(id, ticketTypeForm)
        toast.success('Tạo loại vé thành công')
      }
      setShowTicketTypeModal(false)
      resetTicketTypeForm()
      fetchEventDetails()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể lưu loại vé')
    }
  }

  const handleEditTicketType = (ticketType) => {
    setEditingTicketType(ticketType)
    setTicketTypeForm({
      name: ticketType.name || '',
      description: ticketType.description || '',
      price: ticketType.price || '',
      quantity_available: ticketType.quantity_available || '',
      min_purchase: ticketType.min_purchase || 1,
      max_purchase: ticketType.max_purchase || 10,
      sale_start_date: ticketType.sale_start_date ? ticketType.sale_start_date.split('T')[0] : '',
      sale_end_date: ticketType.sale_end_date ? ticketType.sale_end_date.split('T')[0] : '',
    })
    setShowTicketTypeModal(true)
  }

  const handleDeleteTicketType = async (ticketTypeId) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại vé này?')) return
    try {
      await eventsAPI.deleteTicketType(id, ticketTypeId)
      toast.success('Xóa loại vé thành công')
      fetchEventDetails()
    } catch (error) {
      toast.error('Không thể xóa loại vé')
    }
  }

  const resetTicketTypeForm = () => {
    setTicketTypeForm({
      name: '',
      description: '',
      price: '',
      quantity_available: '',
      min_purchase: 1,
      max_purchase: 10,
      sale_start_date: '',
      sale_end_date: '',
    })
    setEditingTicketType(null)
  }

  // Seat Handlers
  const handleSeatSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSeat) {
        await eventsAPI.updateSeat(id, editingSeat.seat_id, seatForm)
        toast.success('Cập nhật chỗ ngồi thành công')
      } else {
        await eventsAPI.createSeat(id, seatForm)
        toast.success('Tạo chỗ ngồi thành công')
      }
      setShowSeatModal(false)
      resetSeatForm()
      fetchEventDetails()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể lưu chỗ ngồi')
    }
  }

  const handleEditSeat = (seat) => {
    setEditingSeat(seat)
    setSeatForm({
      section: seat.section || '',
      row_label: seat.row_label || '',
      seat_number: seat.seat_number || '',
      price: seat.price || '',
    })
    setShowSeatModal(true)
  }

  const handleDeleteSeat = async (seatId) => {
    if (!window.confirm('Bạn có chắc muốn xóa chỗ ngồi này?')) return
    try {
      await eventsAPI.deleteSeat(id, seatId)
      toast.success('Xóa chỗ ngồi thành công')
      fetchEventDetails()
    } catch (error) {
      toast.error('Không thể xóa chỗ ngồi')
    }
  }

  const handleBulkSeatSubmit = async (e) => {
    e.preventDefault()
    try {
      const seatsData = []
      const rows = parseInt(bulkSeatForm.rows) || 0
      const seatsPerRow = parseInt(bulkSeatForm.seats_per_row) || 0
      const startRowCharCode = bulkSeatForm.start_row.charCodeAt(0)
      
      for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
        const rowLabel = String.fromCharCode(startRowCharCode + rowIdx)
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
          seatsData.push({
            section: bulkSeatForm.section,
            row_label: rowLabel,
            seat_number: seatNum,
            price: parseFloat(bulkSeatForm.price) || 0,
          })
        }
      }
      
      await eventsAPI.createSeatsBulk(id, seatsData)
      toast.success(`Tạo ${seatsData.length} chỗ ngồi thành công`)
      setShowBulkSeatModal(false)
      setBulkSeatForm({
        section: '',
        rows: '',
        seats_per_row: '',
        start_row: 'A',
        price: '',
      })
      fetchEventDetails()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể tạo chỗ ngồi')
    }
  }

  const resetSeatForm = () => {
    setSeatForm({
      section: '',
      row_label: '',
      seat_number: '',
      price: '',
    })
    setEditingSeat(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { variant: 'success', text: 'Đang bán' },
      'sold_out': { variant: 'danger', text: 'Hết vé' },
      'inactive': { variant: 'secondary', text: 'Ngừng bán' },
      'available': { variant: 'success', text: 'Trống' },
      'reserved': { variant: 'warning', text: 'Đã giữ' },
      'booked': { variant: 'danger', text: 'Đã đặt' },
      'blocked': { variant: 'secondary', text: 'Bị khóa' },
    }
    const config = statusMap[status] || { variant: 'secondary', text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (!event) {
    return <Alert variant="danger">Không tìm thấy sự kiện</Alert>
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/events')} className="me-3">
            <FiArrowLeft className="me-2" />
            Quay lại
          </Button>
          <h2 className="mb-0 d-inline">{event.title}</h2>
        </div>
        <Button variant="outline-primary" onClick={() => navigate(`/admin/events/edit/${id}`)}>
          <FiEdit className="me-2" />
          Chỉnh sửa Sự kiện
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Người tổ chức:</strong> {event.organizer}</p>
              <p><strong>Địa điểm:</strong> {event.venue_name}</p>
              <p><strong>Thành phố:</strong> {event.city || '-'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Ngày giờ:</strong> {new Date(event.event_date + 'T' + event.event_time).toLocaleString('vi-VN')}</p>
              <p><strong>Sức chứa:</strong> {event.total_capacity || 0}</p>
              <p><strong>Đã bán:</strong> {event.tickets_sold || 0}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="ticket-types" title="Loại Vé">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Quản lý Loại Vé</h5>
              <Button variant="primary" size="sm" onClick={() => { resetTicketTypeForm(); setShowTicketTypeModal(true) }}>
                <FiPlus className="me-2" />
                Thêm Loại Vé
              </Button>
            </Card.Header>
            <Card.Body>
              {ticketTypes.length > 0 ? (
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Mô tả</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Đã bán</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketTypes.map((tt) => (
                      <tr key={tt.ticket_type_id}>
                        <td><strong>{tt.name}</strong></td>
                        <td>{tt.description || '-'}</td>
                        <td>{formatCurrency(tt.price)}</td>
                        <td>{tt.quantity_available}</td>
                        <td>{tt.quantity_sold || 0}</td>
                        <td>{getStatusBadge(tt.status)}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditTicketType(tt)}>
                            <FiEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTicketType(tt.ticket_type_id)}>
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Chưa có loại vé nào. Hãy thêm loại vé để sự kiện có thể bán vé.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="seats" title="Chỗ Ngồi">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Quản lý Chỗ Ngồi</h5>
              <div>
                <Button variant="success" size="sm" className="me-2" onClick={() => setShowBulkSeatModal(true)}>
                  <FiPlus className="me-2" />
                  Tạo Hàng Loạt
                </Button>
                <Button variant="primary" size="sm" onClick={() => { resetSeatForm(); setShowSeatModal(true) }}>
                  <FiPlus className="me-2" />
                  Thêm Chỗ Ngồi
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {seats.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Khu vực</th>
                      <th>Hàng</th>
                      <th>Số ghế</th>
                      <th>Giá</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seats.map((seat) => (
                      <tr key={seat.seat_id}>
                        <td>{seat.section}</td>
                        <td>{seat.row_label}</td>
                        <td>{seat.seat_number}</td>
                        <td>{formatCurrency(seat.price)}</td>
                        <td>{getStatusBadge(seat.status)}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditSeat(seat)}>
                            <FiEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSeat(seat.seat_id)}>
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Chưa có chỗ ngồi nào. Hãy thêm chỗ ngồi nếu sự kiện có sơ đồ chỗ ngồi.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Ticket Type Modal */}
      <Modal show={showTicketTypeModal} onHide={() => { setShowTicketTypeModal(false); resetTicketTypeForm() }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTicketType ? 'Chỉnh sửa Loại Vé' : 'Thêm Loại Vé'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleTicketTypeSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên loại vé *</Form.Label>
              <Form.Control
                type="text"
                value={ticketTypeForm.name}
                onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={ticketTypeForm.description}
                onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, description: e.target.value })}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá (VND) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1000"
                    value={ticketTypeForm.price}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={ticketTypeForm.quantity_available}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, quantity_available: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mua tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={ticketTypeForm.min_purchase}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, min_purchase: parseInt(e.target.value) || 1 })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mua tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={ticketTypeForm.max_purchase}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, max_purchase: parseInt(e.target.value) || 10 })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu bán</Form.Label>
                  <Form.Control
                    type="date"
                    value={ticketTypeForm.sale_start_date}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, sale_start_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc bán</Form.Label>
                  <Form.Control
                    type="date"
                    value={ticketTypeForm.sale_end_date}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, sale_end_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowTicketTypeModal(false); resetTicketTypeForm() }}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingTicketType ? 'Cập nhật' : 'Tạo'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Seat Modal */}
      <Modal show={showSeatModal} onHide={() => { setShowSeatModal(false); resetSeatForm() }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSeat ? 'Chỉnh sửa Chỗ Ngồi' : 'Thêm Chỗ Ngồi'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSeatSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Khu vực *</Form.Label>
              <Form.Control
                type="text"
                value={seatForm.section}
                onChange={(e) => setSeatForm({ ...seatForm, section: e.target.value })}
                required
              />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Hàng *</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength="10"
                    value={seatForm.row_label}
                    onChange={(e) => setSeatForm({ ...seatForm, row_label: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số ghế *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={seatForm.seat_number}
                    onChange={(e) => setSeatForm({ ...seatForm, seat_number: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá (VND) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1000"
                    value={seatForm.price}
                    onChange={(e) => setSeatForm({ ...seatForm, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowSeatModal(false); resetSeatForm() }}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingSeat ? 'Cập nhật' : 'Tạo'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Bulk Seat Modal */}
      <Modal show={showBulkSeatModal} onHide={() => setShowBulkSeatModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo Chỗ Ngồi Hàng Loạt</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBulkSeatSubmit}>
          <Modal.Body>
            <Alert variant="info">
              Tính năng này sẽ tạo nhiều chỗ ngồi cùng lúc. Ví dụ: 5 hàng x 10 ghế = 50 chỗ ngồi.
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label>Khu vực *</Form.Label>
              <Form.Control
                type="text"
                value={bulkSeatForm.section}
                onChange={(e) => setBulkSeatForm({ ...bulkSeatForm, section: e.target.value })}
                required
              />
            </Form.Group>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Số hàng *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={bulkSeatForm.rows}
                    onChange={(e) => setBulkSeatForm({ ...bulkSeatForm, rows: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Số ghế mỗi hàng *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={bulkSeatForm.seats_per_row}
                    onChange={(e) => setBulkSeatForm({ ...bulkSeatForm, seats_per_row: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Hàng bắt đầu</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength="1"
                    value={bulkSeatForm.start_row}
                    onChange={(e) => setBulkSeatForm({ ...bulkSeatForm, start_row: e.target.value.toUpperCase() })}
                    placeholder="A"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá mỗi ghế (VND) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1000"
                    value={bulkSeatForm.price}
                    onChange={(e) => setBulkSeatForm({ ...bulkSeatForm, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            {bulkSeatForm.rows && bulkSeatForm.seats_per_row && (
              <Alert variant="success">
                Sẽ tạo: <strong>{parseInt(bulkSeatForm.rows) * parseInt(bulkSeatForm.seats_per_row)}</strong> chỗ ngồi
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBulkSeatModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Tạo Chỗ Ngồi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default EventDetail

