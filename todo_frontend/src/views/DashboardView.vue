<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TaskList from '../components/TaskList.vue'
import TaskModal from '../components/TaskModal.vue'
import { useApi } from '../composables/useApi'

type Task = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
};

const sidebarLinks = [
  { label: 'All', filter: 'all', icon: '📋' },
  { label: 'Active', filter: 'active', icon: '🟢' },
  { label: 'Completed', filter: 'completed', icon: '✅' },
  { label: 'Today', filter: 'today', icon: '🗓️' },
]

const selectedFilter = ref('all')
const showModal = ref(false)
const modalTask = ref<Task | null>(null)

const { get } = useApi()
const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}

const reloadRef = ref(0)
function refreshTasks() {
  reloadRef.value++
}

function openAddTask() {
  modalTask.value = null
  showModal.value = true
}

function openEditTask(task: Task) {
  modalTask.value = { ...task }
  showModal.value = true
}

// List overdue and due-soon tasks for "reminders"
const dueSoon = ref<Task[]>([])
async function loadReminders() {
  try {
    const all: Task[] = await get('/tasks')
    dueSoon.value = all.filter(
      (t) =>
        t.dueDate &&
        !t.completed &&
        new Date(t.dueDate).getTime() <= Date.now() + 86400000 // Next 24h
    )
  } catch {}
}
onMounted(loadReminders)

function onTaskChanged() {
  refreshTasks()
  loadReminders()
}
</script>

<template>
  <div class="dashboard">
    <aside class="sidebar">
      <div class="logo-text">📝 To-Do</div>
      <nav>
        <ul>
          <li v-for="item in sidebarLinks" :key="item.filter">
            <a :class="{active: selectedFilter == item.filter}" @click="selectedFilter = item.filter">
              <span class="icon">{{ item.icon }}</span> {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
      <div class="sidebar-bottom">
        <button @click="logout" class="sidebar-btn">Sign Out</button>
      </div>
    </aside>
    <main>
      <header>
        <div class="title-ct">
          <h1>Tasks</h1>
          <button class="accent-btn" @click="openAddTask">+ Add Task</button>
        </div>
        <div class="reminders" v-if="dueSoon.length">
          <span class="remind-icon">⏰</span>
          <span>Upcoming: 
            <span v-for="t in dueSoon" :key="t.id" class="remind-title" :title="t.title">
              {{ t.title }} <span class="due">({{ t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '' }})</span>
            </span>
          </span>
        </div>
      </header>
      <TaskList :filter="selectedFilter" :reload="reloadRef" @edit="openEditTask" @changed="onTaskChanged" />
    </main>
    <TaskModal v-model:visible="showModal" :task="modalTask" @saved="onTaskChanged"/>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.sidebar {
  width: 210px;
  background: #2f80ed;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 1.3rem 0 1rem 0;
}
.logo-text {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0 0 2.8rem 1.2rem;
  letter-spacing: 0.03em;
  color: #fff;
}
nav ul {
  list-style: none;
  padding: 0 0.7rem;
}
nav li {
  margin-bottom: 0.5rem;
}
nav a {
  color: #fff;
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.18s;
}
nav a.active,
nav a:hover {
  background: #56cc9d;
  color: #fff;
}
.icon {
  font-size: 1.15em;
  margin-right: 7px;
}
.sidebar-bottom {
  margin-top: auto;
  padding: 0.7rem 1.2rem 0 1.2rem;
}
.sidebar-btn {
  background: #f2994a;
  color: #fff;
  border: none;
  padding: 9px 0;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.07rem;
  font-weight: 500;
  transition: background 0.17s;
}
.sidebar-btn:hover { background: #d9792c; }

main {
  flex: 1;
  padding: 2.3rem 2.6rem;
  max-width: 750px;
  width: 100%;
}
header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.7rem;
}
.title-ct {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h1 { margin: 0; color: var(--color-heading); }
.accent-btn {
  background: #56cc9d;
  color: #fff;
  border: none;
  padding: 9px 15px;
  border-radius: 8px;
  font-size: 1.06rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.16s;
}
.accent-btn:hover { background: #47b686; }
.reminders {
  margin-top: 0.2rem;
  font-size: 0.97rem;
  color: #2f80ed;
  display: flex;
  align-items: center;
  gap: 0.6em;
}
.remind-icon {
  font-size: 1.2em;
  margin-right: 4px;
}
.remind-title {
  font-weight: 500;
  margin: 0 7px 0 3px;
}
.due { color: #f2994a; font-weight: 400; font-size: 0.99em; }

@media (max-width: 800px) {
  .dashboard { flex-direction: column; }
  .sidebar { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; }
  .logo-text { margin: 0 1.2rem 0 1.2rem; }
  nav ul { display: flex; flex-direction: row; gap: 0.5rem; padding: 0 0.7rem;}
  nav li { margin-bottom: 0; }
  main { padding: 1.2rem; }
}

@media (max-width: 600px) {
  .sidebar { flex-direction: column; width: 100%; }
  main { padding: 0.7rem; }
}
</style>
