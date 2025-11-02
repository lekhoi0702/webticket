import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to false when not using cookies/auth tokens
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
      console.error('CORS Error: Make sure backend is running and CORS is configured correctly')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (orderId, orderStatus, paymentStatus) => {
    const params = { order_status: orderStatus }
    if (paymentStatus) {
      params.payment_status = paymentStatus
    }
    return api.put(`/admin/orders/${orderId}/status`, null, { params })
  },
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getEventStats: (eventId) => api.get(`/admin/events/stats/${eventId}`),
}

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getBySlug: (slug) => api.get(`/events/slug/${slug}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  // Ticket Types
  getTicketTypes: (eventId) => api.get(`/events/${eventId}/ticket-types`),
  createTicketType: (eventId, data) => api.post(`/events/${eventId}/ticket-types`, data),
  updateTicketType: (eventId, ticketTypeId, data) => api.put(`/events/${eventId}/ticket-types/${ticketTypeId}`, data),
  deleteTicketType: (eventId, ticketTypeId) => api.delete(`/events/${eventId}/ticket-types/${ticketTypeId}`),
  // Seats
  getSeats: (eventId, section) => api.get(`/events/${eventId}/seats`, { params: section ? { section } : {} }),
  createSeat: (eventId, data) => api.post(`/events/${eventId}/seats`, data),
  createSeatsBulk: (eventId, data) => api.post(`/events/${eventId}/seats/bulk`, data),
  updateSeat: (eventId, seatId, data) => api.put(`/events/${eventId}/seats/${seatId}`, data),
  deleteSeat: (eventId, seatId) => api.delete(`/events/${eventId}/seats/${seatId}`),
}

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByNumber: (number) => api.get(`/orders/number/${number}`),
  create: (data) => api.post('/orders', data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  confirmPayment: (id, transactionId) => 
    api.post(`/orders/${id}/payment`, null, { params: { transaction_id: transactionId } }),
}

// Tickets API
export const ticketsAPI = {
  getAll: () => api.get('/tickets'),
  getByCode: (code) => api.get(`/tickets/${code}`),
  checkin: (ticketCode) => api.post('/tickets/checkin', { ticket_code: ticketCode }),
  verify: (code) => api.get(`/tickets/verify/${code}`),
}

// Users API
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getById: (id) => api.get(`/users/${id}`),
}

export default api

