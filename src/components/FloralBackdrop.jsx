const floralSrc = `${import.meta.env.BASE_URL}floral-linework-white.png`

export default function FloralBackdrop() {
  return (
    <div
      className="floral-backdrop"
      style={{ '--floral-src': `url("${floralSrc}")` }}
      aria-hidden="true"
    />
  )
}
