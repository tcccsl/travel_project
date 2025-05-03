import api from './api'

export function login(data) {
  return api.post('/users/login', data)
}

export function register(data) {
  return api.post('/users/register', data)
} 