import React, { useState, useEffect } from 'react'
import { Table, Card, Badge, Spinner, Pagination, Row, Col, Form } from 'react-bootstrap'
import { adminAPI } from '../services/api'
import { toast } from 'react-toastify'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, size: pageSize }
      const response = await adminAPI.getAllUsers(params)
      setUsers(response.data.items || response.data || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getRoleText = (role) => {
    return role === 'admin' ? 'Quản trị viên' : 'Khách hàng'
  }

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Hoạt động',
      'suspended': 'Tạm khóa',
      'deleted': 'Đã xóa'
    }
    return statusMap[status] || status
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="page-header">
        <h2 className="mb-0">Quản lý Người dùng</h2>
      </div>

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
                    <th>ID</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Tên đăng nhập</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.user_id}>
                        <td>{user.user_id}</td>
                        <td>{user.full_name}</td>
                        <td>{user.email || '-'}</td>
                        <td>{user.username || '-'}</td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                            {getRoleText(user.role)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={
                            user.status === 'active' ? 'success' :
                            user.status === 'suspended' ? 'warning' : 'secondary'
                          }>
                            {getStatusText(user.status)}
                          </Badge>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center">Không tìm thấy người dùng</td>
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
    </div>
  )
}

export default Users
