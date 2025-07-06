// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="flex flex-wrap space-x-6 mb-4 md:mb-0">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
          <div className="flex space-x-4">
            <a href="#" aria-label="Twitter" className="hover:text-white">
              🐦
            </a>
            <a href="#" aria-label="Discord" className="hover:text-white">
              💬
            </a>
            <a href="#" aria-label="GitHub" className="hover:text-white">
              🐙
            </a>
          </div>
        </div>
        <p className="text-center text-sm">Built by poker nerds 💻🃏</p>
      </div>
    </footer>
  );
}
