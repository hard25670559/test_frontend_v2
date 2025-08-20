import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    users: [] as Array<{ id: number; name: string; email: string }>,
  }),
  actions: {
    setUsers(list: Array<{ id: number; name: string; email: string }>) {
      this.users = list
    },
    addUser(u: { id: number; name: string; email: string }) {
      this.users.push(u)
    },
    updateUser(u: { id: number; name: string; email: string }) {
      this.users = this.users.map((x) => (x.id === u.id ? u : x))
    },
    removeUser(id: number) {
      this.users = this.users.filter((x) => x.id !== id)
    },
  },
})
