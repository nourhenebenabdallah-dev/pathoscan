const BASE = 'http://localhost:8000'

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  getStats:    () => req('/admin/stats'),
  getAdvancedStats: () => req('/admin/stats/advanced'),
  getDoctors:  (status) => req(`/admin/doctors${status ? `?status=${status}` : ''}`),
  getDoctor:   (id) => req(`/admin/doctors/${id}`),
  verifyDoctor:(id) => req(`/admin/doctors/${id}/verify`, { method: 'POST' }),
  doctorAction:(id, action, reason) => req(`/admin/doctors/${id}/action`, {
    method: 'POST', body: JSON.stringify({ action, reason }),
  }),
  batchVerify: () => req('/admin/doctors/batch-verify', { method: 'POST' }),
  deleteDoctor:(id) => req(`/admin/doctors/${id}`, { method: 'DELETE' }),
  chat:        (message, session_id) => req('/admin/chat', {
    method: 'POST', body: JSON.stringify({ message, session_id }),
  }),
  getChatHistory:    (session_id) => req(`/admin/chat/history/${session_id}`),
  getChatSessions:   () => req('/admin/chat/sessions'),
  deleteChatSession: (session_id) => req(`/admin/chat/history/${session_id}`, { method: 'DELETE' }),

  // ─── Register (User Side) ───────────────────────────
  register: (data) =>
    req('/admin/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRegistrationStatus: (id) => req(`/admin/register/${id}/status`),
}