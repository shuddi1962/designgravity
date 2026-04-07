import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <header className="border-b border-[#2A2A3E] px-6 py-4 flex items-center justify-between bg-[#141420]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#9333ea] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
            <span className="text-white font-bold text-lg">DG</span>
          </div>
          <span className="font-display font-bold text-xl text-[#F8F8FC]">DesignGravity</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/templates" className="text-[#9090A8] hover:text-[#F8F8FC] transition-colors text-sm font-medium">Templates</Link>
          <Link href="/ai-studio" className="text-[#9090A8] hover:text-[#F8F8FC] transition-colors text-sm font-medium">AI Studio</Link>
          <Link href="/birthday-card" className="text-[#9090A8] hover:text-[#F8F8FC] transition-colors text-sm font-medium">Birthday Cards</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[#9090A8] hover:text-[#F8F8FC] transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1E1E2E]"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium text-sm transition-all hover:shadow-lg hover:shadow-[#7C3AED]/25"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141420] border border-[#2A2A3E] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-sm text-[#9090A8]">Powered by AI</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight text-[#F8F8FC]">
            Design{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] bg-clip-text text-transparent">
              Without Limits
            </span>
          </h1>
          
          <p className="text-xl text-[#9090A8] mb-12 max-w-2xl mx-auto leading-relaxed">
            Create stunning graphics, videos, and AI-powered designs in minutes. 
            From social media to print, bring your vision to life.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#7C3AED]/30 text-center"
            >
              Start Creating Free
            </Link>
            <Link
              href="/templates"
              className="w-full sm:w-auto px-8 py-4 bg-[#141420] hover:bg-[#1E1E2E] border border-[#2A2A3E] hover:border-[#7C3AED] text-[#F8F8FC] rounded-xl font-semibold text-lg transition-all hover:scale-105 text-center"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#2A2A3E] px-6 py-16 bg-[#0A0A0F]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm font-medium text-[#9090A8] uppercase tracking-wider mb-12">
            Create Anything
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Social Media', icon: '📱' },
              { name: 'Print Designs', icon: '🖼️' },
              { name: 'Videos', icon: '🎬' },
              { name: 'Birthday Cards', icon: '🎂' },
              { name: 'Brand Kits', icon: '🎨' },
              { name: 'Mockups', icon: '📦' },
              { name: 'Presentations', icon: '📊' },
              { name: 'AI Designs', icon: '✨' },
            ].map((item) => (
              <Link
                key={item.name}
                href={`/${item.name.toLowerCase().replace(' ', '-')}`}
                className="group p-6 bg-[#141420] rounded-xl border border-[#2A2A3E] hover:border-[#7C3AED] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#7C3AED]/10"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="font-medium text-[#F8F8FC] group-hover:text-[#7C3AED] transition-colors">
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2A2A3E] px-6 py-8 text-center text-sm text-[#9090A8] bg-[#141420]">
        <p>© 2026 DesignGravity. All rights reserved.</p>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#141420',
            color: '#F8F8FC',
            border: '1px solid #2A2A3E',
          },
        }}
      />
    </main>
  );
}
