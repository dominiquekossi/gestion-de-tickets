import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

type TicketFormProps = {
  onSubmit: (title: string) => void
  isCreating: boolean
  createError: string | null
}

export function TicketForm({ onSubmit, isCreating, createError }: TicketFormProps) {
  const [title, setTitle] = useState('')
  const wasCreating = useRef(false)

  // onSubmit returns nothing, so a success is read from the transition out of
  // isCreating without error: the field is cleared then, and only then.
  useEffect(() => {
    if (wasCreating.current && !isCreating && !createError) {
      setTitle('')
    }
    wasCreating.current = isCreating
  }, [isCreating, createError])

  // Ergonomics only: the server validates the title on its own.
  const canSubmit = title.trim() !== '' && !isCreating

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(title.trim())
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="ticket-title">Titre du ticket</label>
      <input
        id="ticket-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit" disabled={!canSubmit}>
        {isCreating ? 'Création…' : 'Créer le ticket'}
      </button>
      {createError && <p className="error">{createError}</p>}
    </form>
  )
}
