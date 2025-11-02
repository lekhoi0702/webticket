import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Table, Button, Card, Badge, Spinner, 
  Form, InputGroup, Pagination 
} from 'react-bootstrap'
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi'
import { eventsAPI } from '../services/api'
import { toast } from 'react-toastify'

const Events = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [pageSize] = useState(20)

  useEffect(() => {
    fetchEvents()
  }, [page, search])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        size: pageSize,
        ...(search && { search })
      }
      const response = await eventsAPI.getAll(params)
      setEvents(response.data.items || response.data || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách sự kiện')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sự kiện này?')) {
      return
    }
    try {
      await eventsAPI.delete(id)
      toast.success('Xóa sự kiện thành công')
      fetchEvents()
    } catch (error) {
      toast.error('Không thể xóa sự kiện')
    }
  }

  const formatDate = (dateString, timeString) => {
    if (!dateString) return '-'
    const date = new Date(dateString + (timeString ? `T${timeString}` : ''))
    return date.toLocaleString('vi-VN')
  }

  const getStatusText = (status) => {
    const statusMap = {
      'published': 'Đã xuất bản',
      'draft': 'Bản nháp',
      'cancelled': 'Đã hủy'
    }
    return statusMap[status] || status
  }

  const getCategoryText = (category) => {
    const categoryMap = {
      'CONCERT': 'Concert',
      'SPORTS': 'Thể thao',
      'THEATER': 'Kịch',
      'CONFERENCE': 'Hội thảo',
      'FESTIVAL': 'Lễ hội',
      'WORKSHOP': 'Workshop',
      'OTHER': 'Khác'
    }
    return categoryMap[category] || category
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Quản lý Sự kiện</h2>
        <Button variant="primary" onClick={() => navigate('/admin/events/new')}>
          <FiPlus className="me-2" />
          Sự kiện mới
        </Button>
      </div>

      <Card className="table-responsive">
        <Card.Header>
          <InputGroup>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm sự kiện..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </InputGroup>
        </Card.Header>
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
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Danh mục</th>
                    <th>Địa điểm</th>
                    <th>Ngày giờ</th>
                    <th>Trạng thái</th>
                    <th>Sức chứa</th>
                    <th>Đã bán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length > 0 ? (
                    events.map((event) => (
                      <tr key={event.event_id}>
                        <td>{event.event_id}</td>
                        <td>
                          <strong>{event.title}</strong>
                          {event.is_featured && (
                            <Badge bg="warning" className="ms-2">Nổi bật</Badge>
                          )}
                        </td>
                        <td>{getCategoryText(event.category)}</td>
                        <td>{event.venue_name}</td>
                        <td>{formatDate(event.event_date, event.event_time)}</td>
                        <td>
                          <Badge bg={
                            event.status === 'published' ? 'success' :
                            event.status === 'draft' ? 'secondary' : 'danger'
                          }>
                            {getStatusText(event.status)}
                          </Badge>
                        </td>
                        <td>{event.total_capacity || 0}</td>
                        <td>{event.tickets_sold || 0}</td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/admin/events/${event.event_id}`)}
                            title="Quản lý vé và chỗ ngồi"
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/admin/events/edit/${event.event_id}`)}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(event.event_id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center">Không tìm thấy sự kiện</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <Pagination className="mt-3">
                  <Pagination.First 
                    disabled={page === 1} 
                    onClick={() => setPage(1)} 
                  />
                  <Pagination.Prev 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)} 
                  />
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 2 && pageNum <= page + 2)
                    ) {
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === page}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      )
                    } else if (
                      pageNum === page - 3 ||
                      pageNum === page + 3
                    ) {
                      return <Pagination.Ellipsis key={pageNum} />
                    }
                    return null
                  })}
                  <Pagination.Next 
                    disabled={page === totalPages} 
                    onClick={() => setPage(page + 1)} 
                  />
                  <Pagination.Last 
                    disabled={page === totalPages} 
                    onClick={() => setPage(totalPages)} 
                  />
                </Pagination>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default Events
