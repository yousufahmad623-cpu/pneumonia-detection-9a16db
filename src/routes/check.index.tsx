import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/check/')({
  beforeLoad: () => {
    throw redirect({ to: '/check/instructions' })
  },
})
