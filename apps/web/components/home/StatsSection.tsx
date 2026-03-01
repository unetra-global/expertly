const STATS = [
  { value: '500+', label: 'Verified Experts' },
  { value: '40+', label: 'Countries Represented' },
  { value: '1,200+', label: 'Articles Published' },
  { value: '3,800+', label: 'Consultations Booked' },
];

export default function StatsSection() {
  return (
    <section className="bg-brand-surface-alt border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-brand-navy tabular-nums">
                {value}
              </p>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-brand-text-secondary uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
