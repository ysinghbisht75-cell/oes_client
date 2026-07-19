import { apiRequest } from './api.js'

export function getQuestions() {
  return apiRequest('/questions')
}

export function createQuestion(questionData) {
  return apiRequest('/questions', {
    method: 'POST',
    body: JSON.stringify(questionData),
  })
}

export function updateQuestion(id, updates) {
  return apiRequest(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function deleteQuestion(id) {
  return apiRequest(`/questions/${id}`, {
    method: 'DELETE',
  })
}
