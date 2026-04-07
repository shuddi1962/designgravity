'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const recentDesigns = [
  { id: '1', name: 'Summer Sale Banner', thumbnail: null, updatedAt: '2 hours ago' },
  { id: '2', name: 'Product Launch Poster', thumbnail: null, updatedAt: '5 hours ago' },
  { id: '3', name: 'Social Media Pack', thumbnail: null, updatedAt: '1 day ago' },
  { id: '4', name: 'Birthday Card - Mom', thumbnail: null, updatedAt: '2 days ago' },
];

const quickStartOptions = [
  { id: 'blank', label: 'Blank Canvas', icon: '📄', description: 'Start from scratch' },
  { id: 'social', label: 'Social Media', icon: '📱', description: 'Instagram, Facebook, more' },
  { id: 'print', label: 'Print Design', icon: '🖨️', description: 'Flyers, posters, cards' },
  { id: 'video', label: 'Video', icon: '🎬', description: 'Short-form content' },
  { id: 'birthday', label: 'Birthday Card', icon: '🎂', description: 'AI-powered cards' },
  { id: 'ai', label: 'AI Generate', icon: '✨', description: 'Let AI create for you' },
];

const templateCategories = [
  { name: 'Social Media', count: 2450 },
  { name: 'Marketing', count: 1820 },
  { name: 'Events', count: 980 },
  { name: 'Birthday', count: 750 },
  { name: 'Business', count: 1200 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleNewDesign = () => {
    setShowNewDesignModal(true);
  };

  const handleCreateDesign = () => {
    toast.success('Creating new design...');
    router.push('/editor/new');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#F8F8FC] mb-2">Welcome back!</h1>
        <p className="text-[#9090A8]">Create something amazing today</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-[#F8F8FC]">Quick Start</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={handleNewDesign}
                className="col-span-2 md:col-span-3 p-6 bg-gradient-to-r from-[#7C3AED] to-[#9333ea] rounded-xl flex items-center gap-4 hover:opacity-90 transition-opacity"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold text-lg">Create New Design</div>
                  <div className="text-white/80 text-sm">Choose from templates or start blank</div>
                </div>
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-[#F8F8FC]">Recent Designs</h2>
              <Link href="/dashboard" className="text-sm text-[#7C3AED] hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentDesigns.map((design) => (
                <Link
                  key={design.id}
                  href={`/editor/${design.id}`}
                  className="group bg-[#141420] rounded-xl border border-[#2A2A3E] overflow-hidden hover:border-[#7C3AED] transition-colors"
                >
                  <div className="aspect-video bg-[#0A0A0F] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#2A2A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-[#F8F8FC] text-sm truncate">{design.name}</div>
                    <div className="text-xs text-[#9090A8]">{design.updatedAt}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div>
          <section className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6 mb-6">
            <h3 className="font-display font-semibold text-[#F8F8FC] mb-4">Storage</h3>
            <div className="mb-3">
              <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gradient-to-r from-[#7C3AED] to-[#9333ea] rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090A8]">2.5 GB used</span>
              <span className="text-[#F8F8FC]">10 GB total</span>
            </div>
            <button className="mt-4 w-full py-2 text-sm text-[#7C3AED] hover:bg-[#0A0A0F] rounded-lg transition-colors">
              Upgrade Plan
            </button>
          </section>

          <section className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6">
            <h3 className="font-display font-semibold text-[#F8F8FC] mb-4">Template Categories</h3>
            <div className="space-y-2">
              {templateCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/templates?category=${category.name.toLowerCase()}`}
                  className="flex items-center justify-between py-2 text-[#9090A8] hover:text-[#F8F8FC] transition-colors"
                >
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs bg-[#0A0A0F] px-2 py-1 rounded">{category.count.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {showNewDesignModal && (
        <NewDesignModal
          onClose={() => setShowNewDesignModal(false)}
          onCreate={handleCreateDesign}
        />
      )}
    </div>
  );
}

function NewDesignModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [selectedSize, setSelectedSize] = useState('instagram-post');

  const sizes = [
    { id: 'instagram-post', label: 'Instagram Post', size: '1080 × 1080' },
    { id: 'instagram-story', label: 'Instagram Story', size: '1080 × 1920' },
    { id: 'facebook-post', label: 'Facebook Post', size: '1200 × 630' },
    { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', size: '1280 × 720' },
    { id: 'twitter-post', label: 'Twitter/X Post', size: '1200 × 675' },
    { id: 'a4-print', label: 'A4 Print', size: '210 × 297 mm' },
    { id: 'business-card', label: 'Business Card', size: '85 × 55 mm' },
    { id: 'custom', label: 'Custom Size', size: 'Set your own' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#141420] rounded-2xl border border-[#2A2A3E] w-full max-w-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#2A2A3E]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#F8F8FC]">Create New Design</h2>
            <button onClick={onClose} className="text-[#9090A8] hover:text-[#F8F8FC]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Design Name</label>
            <input
              type="text"
              placeholder="Untitled Design"
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F8F8FC] mb-3">Choose Size</label>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSize(item.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedSize === item.id
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                      : 'border-[#2A2A3E] hover:border-[#7C3AED]/50'
                  }`}
                >
                  <div className="font-medium text-sm text-[#F8F8FC]">{item.label}</div>
                  <div className="text-xs text-[#9090A8]">{item.size}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-[#2A2A3E] rounded-lg text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg text-white font-medium transition-colors"
            >
              Create Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
