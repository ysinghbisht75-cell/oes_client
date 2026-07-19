import { apiRequest } from './api.js'

export function getResults() {
  return apiRequest('/results')
}

export function createResult(resultData) {
  return apiRequest('/results', {
    method: 'POST',
    body: JSON.stringify(resultData),
  })
}

export function updateResult(id, updates) {
  return apiRequest(`/results/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}