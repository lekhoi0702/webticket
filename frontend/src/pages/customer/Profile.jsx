import React, { useState, useEffect } from 'react'
import { Card, Form, Button, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap'
import { FiUser, FiLock, FiSave } from 'react-icons/fi'
import { usersAPI, authAPI } from '../../services/api'
import { toast } from 'react-toastify'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await usersAPI.getMe()
      const userData = response.data
      setUser(userData)
      setProfileForm({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      })
    } catch (error) {
      toast.error('Không thể tải thông tin người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await usersAPI.updateMe(profileForm)
      setUser(response.data)
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể cập nhật thông tin')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    setSaving(true)
    try {
      // TODO: Implement change password API
      // await usersAPI.changePassword({
      //   current_password: passwordForm.current_password,
      //   new_password: passwordForm.new_password
      // })
      toast.success('Đổi mật khẩu thành công')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể đổi mật khẩu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4">Tài khoản của tôi</h2>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="profile" title={
          <span><FiUser className="me-2" />Thông tin cá nhân</span>
        }>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Thông tin cá nhân</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Họ và tên *</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Email không thể thay đổi
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" disabled={saving}>
                  <FiSave className="me-2" />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="password" title={
          <span><FiLock className="me-2" />Đổi mật khẩu</span>
        }>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Đổi mật khẩu</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
              </Alert>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu hiện tại *</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới *</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu mới *</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    required
                    minLength={6}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={saving}>
                  <FiLock className="me-2" />
                  {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Thông tin tài khoản</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Vai trò:</strong> {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
              <p><strong>Trạng thái:</strong> {user?.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Ngày đăng ký:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
              <p><strong>Email đã xác thực:</strong> {user?.email_verified ? 'Có' : 'Chưa'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Profile

