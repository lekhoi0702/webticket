import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Button, Card, Row, Col } from 'react-bootstrap'
import { eventsAPI } from '../services/api'
import { toast } from 'react-toastify'

const EventForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    organizer: '',
    title: '',
    description: '',
    category: 'OTHER',
    venue_name: '',
    venue_address: '',
    city: '',
    event_date: '',
    event_time: '',
    event_end_date: '',
    event_end_time: '',
    image_url: '',
    banner_url: '',
    has_seat_map: false,
    is_featured: false,
    total_capacity: 0,
    status: 'draft',
  })

  useEffect(() => {
    if (isEdit) {
      fetchEvent()
    }
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getById(id)
      const event = response.data
      setFormData({
        organizer: event.organizer || '',
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'OTHER',
        venue_name: event.venue_name || '',
        venue_address: event.venue_address || '',
        city: event.city || '',
        event_date: event.event_date || '',
        event_time: event.event_time || '',
        event_end_date: event.event_end_date || '',
        event_end_time: event.event_end_time || '',
        image_url: event.image_url || '',
        banner_url: event.banner_url || '',
        has_seat_map: event.has_seat_map || false,
        is_featured: event.is_featured || false,
        total_capacity: event.total_capacity || 0,
        status: event.status || 'draft',
      })
    } catch (error) {
      toast.error('Không thể tải thông tin sự kiện')
      navigate('/admin/events')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await eventsAPI.update(id, formData)
        toast.success('Cập nhật sự kiện thành công')
      } else {
        await eventsAPI.create(formData)
        toast.success('Tạo sự kiện thành công')
      }
      navigate('/admin/events')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể lưu sự kiện')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="mb-0">{isEdit ? 'Chỉnh sửa Sự kiện' : 'Tạo Sự kiện Mới'}</h2>
      </div>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Người tổ chức *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="CONCERT">Concert</option>
                    <option value="SPORTS">Thể thao</option>
                    <option value="THEATER">Kịch</option>
                    <option value="CONFERENCE">Hội thảo</option>
                    <option value="FESTIVAL">Lễ hội</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="OTHER">Khác</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái *</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={!isEdit}
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sức chứa</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.total_capacity}
                    onChange={(e) => setFormData({ ...formData, total_capacity: parseInt(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên địa điểm *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thành phố</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ địa điểm</Form.Label>
              <Form.Control
                type="text"
                value={formData.venue_address}
                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày sự kiện *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giờ sự kiện *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.event_end_date}
                    onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giờ kết thúc</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.event_end_time}
                    onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL Hình ảnh</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL Banner</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Có sơ đồ chỗ ngồi"
                  checked={formData.has_seat_map}
                  onChange={(e) => setFormData({ ...formData, has_seat_map: e.target.checked })}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Sự kiện nổi bật"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
              </Col>
            </Row>

            <div className="mt-4">
              <Button variant="primary" type="submit" disabled={loading} className="me-2">
                {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật Sự kiện' : 'Tạo Sự kiện'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/events')}>
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default EventForm
