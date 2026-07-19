import { apiRequest } from './api.js'

export function getExams() {
  return apiRequest('/exams')
}

export function createExam(examData) {
  return apiRequest('/exams', {
    method: 'POST',
    body: JSON.stringify(examData),
  })
}

export function updateExam(id, updates) {
  return apiRequest(`/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function deleteExam(id) {
  return apiRequest(`/exams/${id}`, {
    method: 'DELETE',
  })
}
