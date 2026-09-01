export default function Button({ children, variant = 'primary', className = '', ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-sm hover:shadow-md',
    ghost: 'border border-[var(--surface-border)] text-[var(--text-primary)] bg-[var(--surface)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
    soft: 'bg-[var(--primary-soft)] text-[var(--primary-dark)] hover:bg-[var(--primary)] hover:text-white',
    danger: 'border border-[var(--danger)] text-[var(--danger)] bg-[var(--surface)] hover:bg-[var(--danger)] hover:text-white',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
