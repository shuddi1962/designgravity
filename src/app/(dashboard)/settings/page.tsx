'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'api' | 'billing' | 'team';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: 'user' },
    { id: 'api' as const, label: 'API Vault', icon: 'key' },
    { id: 'billing' as const, label: 'Billing', icon: 'card' },
    { id: 'team' as const, label: 'Team', icon: 'users' },
  ];

  const icons: Record<string, React.ReactNode> = {
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    key: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
    card: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-[#F8F8FC] mb-8">Settings</h1>

      <div className="flex gap-8">
        <nav className="w-48">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#9090A8] hover:text-[#F8F8FC] hover:bg-[#141420]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icons[tab.icon]}
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'api' && <APIVaultSettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'team' && <TeamSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6">
      <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-6">Profile Settings</h2>

      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9333ea] flex items-center justify-center">
          <span className="text-white text-2xl font-bold">JD</span>
        </div>
        <button className="px-4 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] hover:border-[#7C3AED] transition-colors">
          Change Photo
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Timezone</label>
          <select className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] focus:outline-none focus:border-[#7C3AED]">
            <option>UTC-8 Pacific Time</option>
            <option>UTC-5 Eastern Time</option>
            <option>UTC+0 London</option>
            <option>UTC+1 Paris</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
}

function APIVaultSettings() {
  const [apiKeys, setApiKeys] = useState([
    { name: 'OpenRouter', key: 'sk-or-...', active: true },
    { name: 'Kie.ai', key: 'sk-kie...', active: true },
    { name: 'Stability AI', key: 'sk-stab...', active: false },
  ]);

  const handleAddKey = () => {
    toast.success('API key added (encrypted and stored securely)');
  };

  return (
    <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F8F8FC]">API Vault</h2>
          <p className="text-sm text-[#9090A8] mt-1">All keys are encrypted with AES-256</p>
        </div>
        <button
          onClick={handleAddKey}
          className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Key
        </button>
      </div>

      <div className="space-y-3">
        {apiKeys.map((apiKey, index) => (
          <div key={index} className="p-4 bg-[#0A0A0F] rounded-lg border border-[#2A2A3E] flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[#F8F8FC]">{apiKey.name}</h3>
              <p className="text-sm text-[#9090A8] font-mono">{apiKey.key}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded ${apiKey.active ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#9090A8]/20 text-[#9090A8]'}`}>
                {apiKey.active ? 'Active' : 'Inactive'}
              </span>
              <button className="p-2 hover:bg-[#141420] rounded transition-colors">
                <svg className="w-4 h-4 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#7C3AED]/10 rounded-lg border border-[#7C3AED]/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#7C3AED] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-[#F8F8FC]">Security Note</h4>
            <p className="text-sm text-[#9090A8] mt-1">
              All API keys are encrypted at rest using AES-256 encryption. Keys are never logged or exposed in client-side code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  const plans = [
    { id: 'free', name: 'Free', price: '$0', features: ['5 projects', '500MB storage', 'Basic templates', 'Watermarked exports'] },
    { id: 'pro', name: 'Pro', price: '$19', features: ['Unlimited projects', '10GB storage', 'All templates', 'No watermarks', 'All AI features'], popular: true },
    { id: 'business', name: 'Business', price: '$49', features: ['Pro features', '5 team seats', 'Brand kits', 'Collaboration', 'Priority AI queue'] },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-6">Billing & Plans</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-xl border-2 transition-colors ${
              plan.popular
                ? 'border-[#7C3AED] bg-[#7C3AED]/5'
                : 'border-[#2A2A3E] bg-[#141420]'
            }`}
          >
            {plan.popular && (
              <span className="inline-block px-2 py-1 text-xs bg-[#7C3AED] text-white rounded mb-2">Popular</span>
            )}
            <h3 className="font-semibold text-[#F8F8FC]">{plan.name}</h3>
            <div className="my-4">
              <span className="text-3xl font-bold text-[#F8F8FC]">{plan.price}</span>
              <span className="text-[#9090A8]">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-[#9090A8]">
                  <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                  : 'bg-[#0A0A0F] border border-[#2A2A3E] text-[#F8F8FC] hover:border-[#7C3AED]'
              }`}
            >
              {plan.id === 'free' ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6">
        <h3 className="font-medium text-[#F8F8FC] mb-4">Current Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#9090A8]">Projects</span>
              <span className="text-[#F8F8FC]">3 / Unlimited</span>
            </div>
            <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden">
              <div className="h-full bg-[#7C3AED] rounded-full w-[10%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#9090A8]">Storage</span>
              <span className="text-[#F8F8FC]">2.5 GB / 10 GB</span>
            </div>
            <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#9333ea] rounded-full w-[25%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSettings() {
  const members = [
    { name: 'John Doe', email: 'john@example.com', role: 'Owner' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
    { name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor' },
  ];

  return (
    <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F8F8FC]">Team</h2>
          <p className="text-sm text-[#9090A8] mt-1">Manage your workspace members</p>
        </div>
        <button className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium transition-colors">
          Invite Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((member, index) => (
          <div key={index} className="p-4 bg-[#0A0A0F] rounded-lg border border-[#2A2A3E] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9333ea] flex items-center justify-center">
                <span className="text-white text-sm font-medium">{member.name.split(' ').map((n) => n[0]).join('')}</span>
              </div>
              <div>
                <h3 className="font-medium text-[#F8F8FC]">{member.name}</h3>
                <p className="text-sm text-[#9090A8]">{member.email}</p>
              </div>
            </div>
            <select
              defaultValue={member.role}
              className="px-3 py-1 bg-[#141420] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm"
            >
              <option>Owner</option>
              <option>Admin</option>
              <option>Editor</option>
              <option>Commenter</option>
              <option>Viewer</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
