<template>
  <div class="e-textfield">
    <label v-if="label" :for="id" class="e-textfield__label">{{ label }}</label>
    <input
      :id="id"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      :type="type"
      class="e-textfield__input"
    />
    <p v-if="error" class="e-textfield__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id?: string
  label?: string
  placeholder?: string
  modelValue?: string
  type?: string
  error?: string | null
}

const _props = withDefaults(defineProps<Props>(), { modelValue: '', type: 'text', error: null })
const { id, label, placeholder, modelValue, type, error } = toRefs(_props)
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

function onInput(e: Event) {
  const t = e.target as HTMLInputElement | null
  emit('update:modelValue', t?.value ?? '')
}
</script>

<style scoped lang="scss">
.e-textfield {
  display: flex;
  flex-direction: column;
}

.e-textfield__label {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.e-textfield__input {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.e-textfield__input:focus {
  outline: none;
  border-color: #60a5fa;
}

.e-textfield__error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
</style>
.e-textfield__input { padding: 0.5rem; border-radius: 6px; border: 1px solid #e5e7eb }
