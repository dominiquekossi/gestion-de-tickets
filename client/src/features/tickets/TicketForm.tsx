import { useState } from 'react'
import type { FormEvent } from 'react'

type TicketFormProps = {
  onSubmit: (title: string, onSuccess: () => void) => void
  isCreating: boolean
  createError: string | null
  clearCreateError: () => void
}

export function TicketForm({ onSubmit, isCreating, createError, clearCreateError }: TicketFormProps) {
  const [title, setTitle] = useState('')

  // Simple confort de saisie : la validation qui fait autorité est celle du serveur.
  const canSubmit = title.trim() !== '' && !isCreating

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(title.trim(), () => setTitle(''))
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="ticket-title">Titre du ticket</label>
      <input
        id="ticket-title"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
          // L'erreur porte sur le titre refusé : elle n'a plus lieu d'être dès qu'il change.
          if (createError) clearCreateError()
        }}
      />
      <button type="submit" disabled={!canSubmit}>
        {isCreating ? 'Création…' : 'Créer le ticket'}
      </button>
      {createError && <p className="error">{createError}</p>}
    </form>
  )
}
