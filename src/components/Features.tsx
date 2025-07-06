// components/Features.tsx
export default function Features() {
  const features = [
    {
      icon: '👤',
      title: 'Player Profiles',
      desc: 'Detailed breakdowns of opponent tendencies, stats, and exploitable patterns from thousands of hands.'
    },
    {
      icon: '🧠',
      title: 'AI Leak Detection',
      desc: 'Advanced algorithms identify your biggest mistakes and provide personalized improvement strategies.'
    },
    {
      icon: '🛡️',
      title: 'Watchlist & Alerts',
      desc: 'Track your key opponents and get notified when they join your tables or show new patterns.'
    },
    {
      icon: '📊',
      title: 'Game Recording',
      desc: 'Import and analyze your hand histories with detailed breakdowns and AI-powered insights.'
    },
    {
      icon: '📈',
      title: 'Weekly AI Reviews',
      desc: 'Get comprehensive performance reports with actionable insights to improve your game.'
    },
    {
      icon: '🔍',
      title: 'Instant Search',
      desc: 'Find any player instantly and access their complete profile with advanced filtering options.'
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-3">
          Everything You Need to <span className="text-green-400">Dominate the Tables</span>
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Professional-grade tools trusted by winning players worldwide
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 bg-gray-800 rounded-2xl border border-gray-700"
            >
              <h3 className="flex items-center text-xl font-semibold mb-2">
                <span className="mr-2">{f.icon}</span>
                {f.title}
              </h3>
              <p className="text-gray-300 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
