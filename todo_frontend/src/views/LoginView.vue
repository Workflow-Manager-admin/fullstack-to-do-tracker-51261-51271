<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()

// PUBLIC_INTERFACE
async function login() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await fetch(import.meta.env.VITE_API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      errorMessage.value = data.message || 'Invalid credentials'
      return
    }
    localStorage.setItem('token', data.token)
    router.push('/dashboard')
  } catch {
    errorMessage.value = 'Network error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-centered">
    <div class="auth-box">
      <h2>Sign In</h2>
      <form @submit.prevent="login">
        <label>
          Username
          <input v-model="username" required autocomplete="username" />
        </label>
        <label>
          Password
          <input type="password" v-model="password" required autocomplete="current-password" />
        </label>
        <button :disabled="loading" class="primary-btn" type="submit">
          <span v-if="loading">Loading...</span>
          <span v-else>Sign In</span>
        </button>
        <p class="error" v-if="errorMessage">{{ errorMessage }}</p>
      </form>
      <p class="auth-alt">
        Need an account? <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-centered {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
}
.auth-box {
  background: var(--color-background-soft);
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 2px 14px 0 #18181813;
  min-width: 310px;
  width: 100%;
  max-width: 380px;
}
h2 {
  margin-bottom: 1.8rem;
  text-align: center;
  color: var(--color-heading);
}
form label {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.3rem;
  color: var(--color-text);
  font-size: 0.98rem;
}
input {
  font: inherit;
  padding: 10px;
  margin-top: 7px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);  
  outline: none;
}
input:focus {
  border-color: var(--color-border-hover);
}
.primary-btn {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: none;
  background: #2f80ed;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 0.7rem;
  transition: background 0.15s;
}
.primary-btn:disabled { background: #6ea7ee; }
.error {
  color: #f2994a;
  text-align: center;
  margin-top: 4px;
}
.auth-alt {
  text-align: center;
  margin-top: 0.6rem;
}
</style>
