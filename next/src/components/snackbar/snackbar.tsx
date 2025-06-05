// components/GlobalSnackbar.tsx
"use client"

import * as Toast from "@radix-ui/react-toast"
import { useEffect } from "react"
import clsx from "clsx"
import { useSnackbarStore } from "@/store/snackbar.store"

export const GlobalSnackbar = () => {
  const {
    open,
    title,
    description,
    type,
    action,
    actionLabel,
    closeSnackbar,
  } = useSnackbarStore()

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => closeSnackbar(), 5000)
      return () => clearTimeout(timer)
    }
  }, [open, closeSnackbar])

  const typeClasses = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600 text-black",
  }

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        open={open}
        onOpenChange={(v) => {
          if (!v) closeSnackbar()
        }}
        className={clsx(
          "rounded-lg shadow-lg text-white p-4 space-y-1 w-[300px]",
          typeClasses[type]
        )}
      >
        <Toast.Title className="font-bold text-lg">{title}</Toast.Title>
        <Toast.Description className="text-sm">{description}</Toast.Description>
        {action && actionLabel && (
          <Toast.Action
            asChild
            altText={actionLabel}
          >
            <button
              onClick={action}
              className="mt-2 bg-white text-black font-medium px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              {actionLabel}
            </button>
          </Toast.Action>
        )}
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-4 right-4 z-50" />
    </Toast.Provider>
  )
}
