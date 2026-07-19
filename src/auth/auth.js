import { apiRequest } from '../services/api.js'

export async function authenticateUser(credentials) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function registerUser(userData) {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}
