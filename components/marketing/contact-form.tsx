'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      subject: String(data.get('subject') ?? ''),
      message: String(data.get('message') ?? ''),
      company: String(data.get('company') ?? ''), // honeypot
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      setDone(true)
      form.reset()
      toast.success('Message sent — we’ll be in touch soon!')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[#E7E6DF] bg-white p-8 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE566] text-xl">
          ✅
        </div>
        <h2
          className="text-xl font-bold text-[#1a1a1a]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Thanks — your message is on its way.
        </h2>
        <p className="mt-2 text-[#6B7280]">
          We sent a confirmation to your inbox and someone on the team will reply shortly.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 nb-btn-ghost text-sm px-4 py-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E7E6DF] bg-white p-6 sm:p-8 space-y-5"
    >
      {/* Honeypot — hidden from real users. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            className="w-full rounded-lg border border-[#E0DFD8] bg-[#FAFAF8] px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:bg-white"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className="w-full rounded-lg border border-[#E0DFD8] bg-[#FAFAF8] px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
          Subject <span className="text-[#9CA3AF] font-normal">(optional)</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          maxLength={160}
          className="w-full rounded-lg border border-[#E0DFD8] bg-[#FAFAF8] px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:bg-white"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          className="w-full rounded-lg border border-[#E0DFD8] bg-[#FAFAF8] px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] focus:bg-white resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="nb-btn-primary text-sm px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
