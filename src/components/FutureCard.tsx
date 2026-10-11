import {Button} from './ui'

function draw(text: string): string {
  const c = document.createElement('canvas')
  c.width = 640
  c.height = 360
  const x = c.getContext('2d')
  if (!x) return ''
  const g = x.createLinearGradient(0, 0, 640, 360)
  g.addColorStop(0, '#1b2a6b')
  g.addColorStop(1, '#6b2f8f')
  x.fillStyle = g
  x.fillRect(0, 0, 640, 360)
  x.fillStyle = '#fff'
  x.font = 'bold 30px sans-serif'
  x.fillText('ORBIT Future Card', 30, 60)
  x.font = '20px sans-serif'
  let line = ''
  let y = 120
  for (const w of text.split(' ')) {
    if (x.measureText(line + w).width > 580) {
      x.fillText(line, 30, y)
      y += 30
      line = ''
    }
    line += `${w} `
  }
  x.fillText(line, 30, y)
  x.font = '14px sans-serif'
  x.fillText('What happens to my month if I do this?', 30, 330)
  return c.toDataURL('image/png')
}

export default function FutureCard({text, onClose}: {text: string; onClose: () => void}) {
  const save = () => {
    const href = draw(text)
    if (!href) return
    const a = document.createElement('a')
    a.download = 'orbit-future-card.png'
    a.href = href
    a.click()
  }
  return (
    <aside className="future-card" aria-label="Future card">
      <h2>Future card</h2>
      <p>{text}</p>
      <div className="row">
        <Button variant="ghost" onClick={save}>
          Download image
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close card
        </Button>
      </div>
    </aside>
  )
}
