<script setup lang="ts">
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue'
import { useApi } from '../composables/useApi'

type Task = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
};

const props = defineProps<{ filter: string, reload?: number }>()
const emit = defineEmits(['edit', 'changed'])

const { get } = useApi()
const tasks = ref<Task[]>([])
const loading = ref(false)

async function loadTasks() {
  loading.value = true
  try {
    const result: Task[] = await get('/tasks')
    tasks.value = result
  } catch {}
  loading.value = false
}
onMounted(loadTasks)
watch(() => props.reload, loadTasks)

function filteredTasks() {
  const now = new Date()
  if (props.filter === 'all') return tasks.value
  if (props.filter === 'active') return tasks.value.filter(t => !t.completed)
  if (props.filter === 'completed') return tasks.value.filter(t => t.completed)
  if (props.filter === 'today') return tasks.value.filter(
    t => t.dueDate && (new Date(t.dueDate!)).toDateString() === now.toDateString()
  )
  return tasks.value
}

function editTask(task: Task) {
  emit('edit', task)
}

const { del } = useApi()
async function deleteTask(id: string) {
  if (!confirm('Delete this task?')) return
  await del('/tasks/' + id)
  emit('changed')
}
</script>

<template>
  <div>
    <div v-if="loading">Loading tasks...</div>
    <ul v-else class="task-list">
      <li v-for="task in filteredTasks()" :key="task.id" :class="{completed:task.completed}">
        <div class="task-details">
          <input type="checkbox" v-model="task.completed" @change="editTask({...task, completed:!task.completed})" />
          <span class="title">{{ task.title }}</span>
          <span class="cat" v-if="task.category">{{ task.category }}</span>
          <span v-if="task.dueDate" class="due" :class="{overdue:!task.completed && new Date(task.dueDate)<new Date()}">
            {{ new Date(task.dueDate).toLocaleDateString() }}
          </span>
        </div>
        <div class="actions">
          <button @click="editTask(task)">Edit</button>
          <button class="del-btn" @click="deleteTask(task.id)">Delete</button>
        </div>
        <div class="desc" v-if="task.description">{{ task.description }}</div>
      </li>
      <li v-if="!filteredTasks().length" class="empty">No tasks in this view.</li>
    </ul>
  </div>
</template>

<style scoped>
.task-list { list-style: none; padding: 0; }
.task-list li {
  background: var(--color-background-soft);
  margin-bottom: 1rem;
  border-radius: 9px;
  box-shadow: 0 1px 7px #2f80ed19;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.task-details {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}
.title { font-weight: 500; font-size: 1.08rem; }
.cat {
  background: #56cc9d32;
  color: #56cc9d;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.96rem;
}
.completed .title { text-decoration: line-through; color: #bcbcbc; }
.due {
  margin-left: auto;
  color: #2f80ed;
  font-size: 0.9rem;
}
.due.overdue { color: #f2994a; font-weight: bold; }
.actions {
  margin-top: 8px;
  display: flex;
  gap: 0.4em;
}
.actions button {
  border: none;
  border-radius: 5px;
  background: #2f80ed;
  color: #fff;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 1em;
}
.actions .del-btn { background: #f2994a; }
.desc { font-size: 0.95em; color: var(--color-text); margin-top: 4px; }
.empty { text-align: center; color: #888; }
</style>
