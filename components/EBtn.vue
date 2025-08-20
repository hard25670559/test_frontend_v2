<template>
  <button :class="['e-btn', `e-btn--${color}`]" :disabled="disabled" @click="onClick">
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  color?: 'primary' | 'success' | 'error' | 'warn'
  disabled?: boolean
}
// 故意型別錯誤範例：color 改為 number，template 仍用 string
// interface Props {
//   text?: string
//   color?: number // 應為 string union，但故意寫 number
//   disabled?: boolean
// }

const props = withDefaults(defineProps<Props>(), { color: 'primary', disabled: false })
const { text, color, disabled } = toRefs(props)
const emit = defineEmits<{ (e: 'click'): void }>()

function onClick(e: Event) {
  if (disabled?.value) return
  emit('click')
}
</script>

<style scoped lang="scss">
.e-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease;

  &--primary {
    background: #0ea5ff;
    color: white;
  }

  &--success {
    background: #16a34a;
    color: white;
  }

  &--error {
    background: #ef4444;
    color: white;
  }

  &--warn {
    background: #f59e0b;
    color: white;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
