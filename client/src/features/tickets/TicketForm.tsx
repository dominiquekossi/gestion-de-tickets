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

  // onSubmit ne renvoie rien : le succès se déduit de la sortie de isCreating
  // sans erreur. Le champ n'est vidé qu'à ce moment-là, jamais avant.
  useEffect(() => {
    if (wasCreating.current && !isCreating && !createError) {
      setTitle('')
    }
    wasCreating.current = isCreating
  }, [isCreating, createError])

  // Simple confort de saisie : la validation qui fait autorité est celle du serveur.
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
