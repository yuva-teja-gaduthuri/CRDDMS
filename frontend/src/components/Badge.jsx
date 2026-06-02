// components/Badge.jsx
const STYLES = {
  approved:     'badge-success',
  pending:      'badge-pending',
  under_review: 'badge-info',
  rejected:     'badge-danger',
  archived:     'bg-purple-100 text-purple-700 badge',
  active:       'badge-success',
  inactive:     'badge-danger',
  NAAC:         'bg-blue-100 text-blue-700 badge',
  NBA:          'bg-green-100 text-green-700 badge',
  AICTE:        'bg-orange-100 text-orange-700 badge',
  UGC:          'bg-purple-100 text-purple-700 badge',
};

export default function Badge({ label }) {
  const cls = STYLES[label] || 'badge-pending';
  return (
    <span className={cls}>
      {label?.replace('_', ' ')}
    </span>
  );
}
