// app/page.tsx
import Link from 'next/link';
import Header from '../components/Header';
import PlayerCardPreview from '../components/PlayerCardPreview';
import Features from '../components/Features';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-y-12 gap-x-16">
            
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                The #1 Tool for <br />
                <span className="text-green-400">Professional Poker Players</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-lg">
                Study opponents, analyze leaks, track performance, and stay ahead with AI-powered insights. Powered by community data and your game history.
              </p>
              
              <Link href="/login">
                <button className="mt-6 px-8 py-4 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition">
                  Get Started
                </button>
              </Link>
            </div>

            <div className="lg:w-1/2 flex justify-center">
              <PlayerCardPreview />
            </div>
          </div>
        </div>

        {/* Features */}
        <Features />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
