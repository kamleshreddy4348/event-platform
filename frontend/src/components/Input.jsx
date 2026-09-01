export default function Input(props) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] ' +
        (props.className || '')
      }
    />
  )
}
