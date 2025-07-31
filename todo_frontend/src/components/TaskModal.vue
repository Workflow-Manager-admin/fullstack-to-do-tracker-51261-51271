<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useApi } from '../composables/useApi'

type Task = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
}

const props = defineProps<{
  visible: boolean,
  task: Task | null
}>()
const emit = defineEmits(['update:visible', 'saved'])

const isEditing = ref(false)
const title = ref('')
const description = ref('')
const category = ref('')
const dueDate = ref('')
const completed = ref(false)
const error = ref('')
const loading = ref(false)

watch(() => props.visible, (v) => {
  if (v) initForm()
})
watch(() => props.task, () => {
  if (props.visible) initForm()
})

function initForm() {
  title.value = props.task?.title || ''
  description.value = props.task?.description || ''
  category.value = props.task?.category || ''
  dueDate.value = props.task?.dueDate ? props.task.dueDate.slice(0, 16) : ''
  completed.value = !!props.task?.completed
  isEditing.value = !!props.task
  error.value = ''
}

const { post, put } = useApi()

// PUBLIC_INTERFACE
async function saveTask() {
  loading.value = true
  error.value = ''
  const payload = {
    title: title.value,
    description: description.value,
    category: category.value,
    dueDate: dueDate.value,
    completed: completed.value
  }
  try {
    if (isEditing.value && props.task && props.task.id) {
      await put('/tasks/' + props.task.id, payload)
    } else {
      await post('/tasks', payload)
    }
    emit('update:visible', false)
    emit('saved')
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e) {
      error.value = (e as { message: string }).message;
    } else {
      error.value = "Error";
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="emit('update:visible', false)">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Edit Task' : 'Add New Task' }}</h2>
        <button class="close-btn" @click="emit('update:visible', false)">×</button>
      </div>
      <form @submit.prevent="saveTask">
        <label>
          Title
          <input v-model="title" required maxlength="100" />
        </label>
        <label>
          Description
          <textarea v-model="description" maxlength="300"></textarea>
        </label>
        <label>
          Category
          <input v-model="category" maxlength="35" />
        </label>
        <label>
          Due Date
          <input type="datetime-local" v-model="dueDate" />
        </label>
        <div v-if="isEditing" class="checkbox">
          <input type="checkbox" v-model="completed" :id="'cmpl'+title" />
          <label :for="'cmpl'+title">Mark as Completed</label>
        </div>
        <button class="accent-btn" :disabled="loading">{{ isEditing ? 'Save' : 'Add' }}</button>
        <span class="loading-span" v-if="loading">Saving...</span>
        <span class="error" v-if="error">{{ error }}</span>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; left: 0; top: 0; right: 0; bottom: 0;
  z-index: 99;
  background: #0004;
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: var(--color-background);
  padding: 2rem 1.3rem;
  border-radius: 16px;
  min-width: 320px;
  box-shadow: 0 6px 40px #2f80ed30;
  width: 97vw; max-width: 400px;
  position: relative;
  overflow: hidden;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;
}
h2 { margin: 0; color: #2f80ed; }
.close-btn {
  background: none; border: none; font-size: 1.7rem; color: #f2994a; cursor: pointer;
  margin-left: 1rem;
}
form label { display: flex; flex-direction: column; margin-bottom: 1rem;}
input, textarea {
  padding: 7px 9px;
  border-radius: 7px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  font: inherit;
  margin-top: 6px;
}
textarea { min-height: 54px; }
input:focus, textarea:focus { border-color: #2f80ed; }
.checkbox { display: flex; align-items: center; gap: 0.35em; margin-bottom: 1rem;}
.accent-btn {
  background: #56cc9d;
  color: #fff;
  border: none;
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 1.01rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.loading-span { color: #2f80ed; margin-left: 1em;}
.error { color: #f2994a; margin-left: 8px;}
</style>
