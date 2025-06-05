// lib/snackbar.store.ts
import { create } from "zustand"

type SnackbarType = "success" | "error" | "warning"

interface SnackbarState {
  open: boolean
  title: string
  description: string
  type: SnackbarType
  action?: () => void
  actionLabel?: string
  showSnackbar: (opts: {
    title: string
    description: string
    type?: SnackbarType
    action?: () => void
    actionLabel?: string
  }) => void
  closeSnackbar: () => void
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  title: "",
  description: "",
  type: "success",
  action: undefined,
  actionLabel: undefined,
  showSnackbar: ({ title, description, type = "success", action, actionLabel }) =>
    set({ open: true, title, description, type, action, actionLabel }),
  closeSnackbar: () => set({ open: false }),
}))
