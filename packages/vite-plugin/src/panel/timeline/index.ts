import './TimelinePanel'
 
export function mountTimeline() {
  const el = document.createElement('vue-lens-timeline')
  el.style.display = 'none'
  document.body.appendChild(el)
  return el
}