interface LoadingProps {
  loading: boolean
}

export function Loading({ loading }: LoadingProps) {
  if (!loading) return null
  return (
    <div id="gcim-loading" style={{ textAlign: 'center', padding: '2em' }}>
      <div
        style={{
          display: 'inline-block',
          width: '2.5em',
          height: '2.5em',
          border: '4px solid rgba(255,255,255,0.2)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}
