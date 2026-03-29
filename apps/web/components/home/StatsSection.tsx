const STATS = [
  { value: '500+', label: 'Verified Experts', note: 'across finance & law' },
  { value: '40+', label: 'Countries', note: 'globally represented' },
  { value: '1,200+', label: 'Expert Articles', note: 'peer-reviewed insights' },
  { value: '3,800+', label: 'Consultations', note: 'successfully matched' },
];

export default function StatsSection() {
  return (
    <section className="bg-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.08]">
          {STATS.map(({ value, label, note }, i) => (
            <div key={label} className={`px-6 sm:px-8 py-8 sm:py-10 text-center${i === 0 ? ' border-t border-white/[0.08] lg:border-t-0' : ''}`}>
              <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                {value}
              </p>
              <p className="mt-2 text-xs font-semibold text-brand-gold">
                {label}
              </p>
              <p className="mt-0.5 text-xs text-white/35">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
