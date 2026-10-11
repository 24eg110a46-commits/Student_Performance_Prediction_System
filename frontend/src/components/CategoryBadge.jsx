const LABELS = { HIGH: 'High', AVERAGE: 'Average', LOW: 'Low' }

export default function CategoryBadge({ category }) {
  return <span className={`badge badge-${category.toLowerCase()}`}>{LABELS[category] ?? category}</span>
}
