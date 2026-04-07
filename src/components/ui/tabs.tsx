import React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-[#2A2A3E]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.id
              ? 'border-[#7C3AED] text-[#7C3AED]'
              : 'border-transparent text-[#9090A8] hover:text-[#F8F8FC]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
