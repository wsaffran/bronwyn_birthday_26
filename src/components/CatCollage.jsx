const catSrc = (id) => `${import.meta.env.BASE_URL}cats/cat-${id}.png`

// Around the page clockwise from top-left. Doubled poses are never adjacent.
const CAT_STICKERS = [
  { src: catSrc(1), className: 'cat-sticker cat-pos-1' },
  { src: catSrc(2), className: 'cat-sticker cat-pos-2' },
  { src: catSrc(5), className: 'cat-sticker cat-pos-3' },
  { src: catSrc(4), className: 'cat-sticker cat-pos-4' },
  { src: catSrc(1), className: 'cat-sticker cat-pos-5' },
  { src: catSrc(2), className: 'cat-sticker cat-pos-6' },
  { src: catSrc(3), className: 'cat-sticker cat-pos-7' },
  { src: catSrc(5), className: 'cat-sticker cat-pos-8' },
]

export default function CatCollage() {
  return (
    <div className="cat-collage" aria-hidden="true">
      {CAT_STICKERS.map((cat) => (
        <img key={cat.className} src={cat.src} alt="" className={cat.className} />
      ))}
    </div>
  )
}
