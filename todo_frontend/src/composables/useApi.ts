import { ref } from 'vue'

export type Task = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
}

// PUBLIC_INTERFACE
export function useApi() {
  const API_URL = import.meta.env.VITE_API_URL
  const error = ref<string|null>(null)

  // PUBLIC_INTERFACE
  async function get<T=unknown>(path: string): Promise<T> {
    error.value = null
    const res = await fetch(API_URL + path, {
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      }
    })
    if (!res.ok) {
      const message = (await res.json()).message || res.statusText
      error.value = message
      throw new Error(message)
    }
    return await res.json()
  }

  // PUBLIC_INTERFACE
  async function post<T=unknown, B=unknown>(path: string, data: B): Promise<T> {
    error.value = null
    const res = await fetch(API_URL + path, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const message = (await res.json()).message || res.statusText
      error.value = message
      throw new Error(message)
    }
    return await res.json()
  }

  // PUBLIC_INTERFACE
  async function put<T=unknown, B=unknown>(path: string, data: B): Promise<T> {
    error.value = null
    const res = await fetch(API_URL + path, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const message = (await res.json()).message || res.statusText
      error.value = message
      throw new Error(message)
    }
    return await res.json()
  }

  // PUBLIC_INTERFACE
  async function del<T=unknown>(path: string): Promise<T> {
    error.value = null
    const res = await fetch(API_URL + path, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      }
    })
    if (!res.ok) {
      const message = (await res.json()).message || res.statusText
      error.value = message
      throw new Error(message)
    }
    return await res.json()
  }

  return { error, get, post, put, del }
}
