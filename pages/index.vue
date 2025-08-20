<template>
  <div class="page">
    <div class="locale-switcher">
      <select v-model="selectedLocale" @change="onLocaleChange">
        <option v-for="l in locales" :key="l.code" :value="l.code">
          {{ $t(l.code === 'zh-TW' ? 'languages.tw' : 'languages.en') }}
        </option>
      </select>
    </div>
    <h1>{{ $t('welcome') }}</h1>

    <section class="form">
      <ETextField v-model:modelValue="form.name" :label="$t('form.name')" :placeholder="$t('form.namePlaceholder')"
        :error="errors.name" />
      <ETextField v-model:modelValue="form.email" :label="$t('form.email')"
        :placeholder="safeT('form.emailPlaceholder', 'you@example.com')" :error="errors.email" />
      <div class="actions">
        <EBtn color="primary" @click="onSubmit">{{
          editId ? $t('action.update') : $t('action.create')
        }}</EBtn>
        <EBtn color="warn" @click="resetForm">{{ $t('action.reset') }}</EBtn>
      </div>
    </section>

    <section class="list">
      <h2>{{ $t('users.title') }}</h2>
      <ul>
        <li v-for="u in store.users" :key="u.id" class="user-item">
          <div>
            <strong>{{ u.name }}</strong> — <small>{{ u.email }}</small>
          </div>
          <div class="item-actions">
            <EBtn color="primary" @click="onEdit(u)">{{ $t('action.edit') }}</EBtn>
            <EBtn color="error" @click="confirmDelete(u)">{{ $t('action.delete') }}</EBtn>
          </div>
        </li>
      </ul>
    </section>

    <!-- dialog -->
    <dialog ref="confirmDialog">
      <p>{{ dialogMessage }}</p>
      <div class="dialog-actions">
        <EBtn color="warn" @click="onDialogCancel">{{ $t('action.cancel') }}</EBtn>
        <EBtn color="error" @click="onDialogConfirm">{{ $t('action.confirm') }}</EBtn>
      </div>
    </dialog>
    <footer class="footer">
      <small>
        &copy; 2025 hardanonymous &nbsp;|&nbsp; 聯絡方式：<a href="mailto:hard25670559@gmail.com">hard25670559@gmail.com</a>
        &nbsp;|&nbsp; <a href="https://github.com/hard25670559" target="_blank" rel="noopener">GitHub</a>
      </small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ETextField from '~/components/ETextField.vue'
import EBtn from '~/components/EBtn.vue'
import { useAppStore } from '~/store/app'

const store = useAppStore()
const { t, locale } = useI18n()

const locales = computed(() => [{ code: 'zh-TW' }, { code: 'en-US' }])

const selectedLocale = ref(locale.value)

function onLocaleChange() {
  // switch language by navigating to the corresponding locale route so @nuxtjs/i18n will load messages
  try {
    const localePath = useLocalePath()
    const route = useRoute()
    const target = localePath(route.path, selectedLocale.value)
    // navigateTo will change route and trigger i18n to render the requested locale
    navigateTo(target, { replace: true })
  } catch (e) {
    console.error('[i18n] onLocaleChange navigation error', e)
    // fallback: set locale value directly if navigation fails
    locale.value = selectedLocale.value
  }
}

const form = reactive({ name: '', email: '' })
const errors = reactive<{ name?: string; email?: string }>({})
const editId = ref<number | null>(null)
const confirmDialog = ref<HTMLDialogElement | null>(null)
const dialogMessage = ref('')
let pendingAction: (() => Promise<void>) | null = null

const fetchUsers = async () => {
  const { data } = await useFetch('/api/users')
  if (data.value) {
    store.setUsers(data.value as any)
  }
}

// SSR fetch on server
await fetchUsers()

function validate() {
  errors.name = form.name ? '' : (t('validation.nameRequired') as string)
  errors.email = /\S+@\S+\.\S+/.test(form.email) ? '' : (t('validation.invalidEmail') as string)
  return !errors.name && !errors.email
}

async function onSubmit() {
  if (!validate()) return

  if (editId.value) {
    pendingAction = async () => {
      await $fetch('/api/users', { method: 'PUT', body: { id: editId.value, ...form } })
      store.updateUser({ id: editId.value!, name: form.name, email: form.email })
      resetForm()
    }
    dialogMessage.value = t('dialog.confirmUpdate') as string
    confirmDialog.value?.showModal()
  } else {
    pendingAction = async () => {
      await $fetch('/api/users', { method: 'POST', body: form })
      await fetchUsers()
      resetForm()
    }
    dialogMessage.value = t('dialog.confirmCreate') as string
    confirmDialog.value?.showModal()
  }
}

function resetForm() {
  form.name = ''
  form.email = ''
  editId.value = null
}

function onEdit(u: { id: number; name: string; email: string }) {
  editId.value = u.id
  form.name = u.name
  form.email = u.email
}

function confirmDelete(u: { id: number; name: string; email: string }) {
  pendingAction = async () => {
    await $fetch(`/api/users?id=${u.id}`, { method: 'DELETE' })
    store.removeUser(u.id)
  }
  dialogMessage.value = t('dialog.confirmDelete', { name: u.name }) as string
  confirmDialog.value?.showModal()
}

async function onDialogConfirm() {
  confirmDialog.value?.close()
  if (pendingAction) await pendingAction()
  pendingAction = null
}

function onDialogCancel() {
  confirmDialog.value?.close()
  pendingAction = null
}

// safe translation accessor: if t(key) returns non-string (e.g. parsed object), return fallback
function safeT(key: string, fallback = '') {
  try {
    const res = t(key as any)
    if (typeof res === 'string') return res
    console.warn(
      '[i18n] translation for',
      key,
      'is not a string, using fallback',
      fallback,
      '->',
      res
    )
    return fallback
  } catch (e) {
    console.error('[i18n] safeT error for', key, e)
    return fallback
  }
}
</script>

<style scoped lang="scss">
.page {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.form {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.list ul {
  list-style: none;
  padding: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.dialog-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

dialog {
  border: none;
  padding: 1rem;
  border-radius: 8px;
}

.locale-switcher {
  position: absolute;
  right: 1rem;
  top: 1rem;
}

.footer {
  margin-top: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.95rem;
}
</style>
