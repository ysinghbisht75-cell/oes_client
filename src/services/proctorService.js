import { apiRequest } from './api.js'

export function logProctorEvent(eventData) {
  return apiRequest('/proctor/event', {
    method: 'POST',
    body: JSON.stringify(eventData),
  })
}