'use client';

import { useState } from 'react';
import { useFeatureFlag } from '@/stores/feature-flags.store';
import toast from 'react-hot-toast';

const AI_MODELS = [
  { id: 'sdxl', name: 'Stable Diffusion XL', provider: 'Insforge' },
  { id: 'flux', name: 'FLUX', provider: 'Insforge' },
  { id: 'dalle', name: 'DALL-E', provider: 'OpenRouter' },
  { id: 'midjourney', name: 'Midjourney-style', provider: 'Kie.ai' },
];

const STYLE_PRESETS = [
  { id: 'photorealistic', name: 'Photorealistic', icon: '📷' },
  { id: 'illustration', name: 'Illustration', icon: '🎨' },
  { id: '3d-render', name: '3D Render', icon: '🎲' },
  { id: 'watercolor', name: 'Watercolor', icon: '🖌️' },
  { id: 'anime', name: 'Anime', icon: '✨' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
  { id: 'comic', name: 'Comic Book', icon: '💥' },
  { id: 'oil-painting', name: 'Oil Painting', icon: '🖼️' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1)', width: 1024, height: 1024 },
  { id: '16:9', label: 'Landscape (16:9)', width: 1920, height: 1080 },
  { id: '9:16', label: 'Portrait (9:16)', width: 1080, height: 1920 },
  { id: '4:3', label: 'Standard (4:3)', width: 1024, height: 768 },
  { id: '3:2', label: 'Photo (3:2)', width: 1080, height: 720 },
];

const AI_TOOLS = [
  { id: 'generate', name: 'Generate Image', description: 'Create images from text prompts', icon: '✨' },
  { id: 'enhance', name: 'Enhance Image', description: 'Upscale, denoise, sharpen photos', icon: '🔮' },
  { id: 'remove-bg', name: 'Remove Background', description: 'One-click AI background removal', icon: '✂️' },
  { id: 'prompt', name: 'Prompt Enhancer', description: 'Improve your prompts with AI', icon: '📝' },
  { id: 'content', name: 'Content Writer', description: 'Generate copy and captions', icon: '✍️' },
  { id: 'layout', name: 'Replicate Layout', description: 'Analyze and recreate designs', icon: '📐' },
];

export default function AIStudioPage() {
  const isEnabled = useFeatureFlag('aiImageGeneration');
  const [activeTab, setActiveTab] = useState<'generate' | 'tools'>('generate');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const newImage = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill="%237C3AED" width="512" height="512"/><text fill="white" font-family="sans-serif" font-size="48" x="50%" y="50%" text-anchor="middle">Generated</text></svg>`;
      setGeneratedImages([newImage, ...generatedImages]);
      toast.success('Image generated successfully!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to enhance');
      return;
    }
    toast.success('Prompt enhanced with professional modifiers!');
  };

  if (!isEnabled) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#141420] flex items-center justify-center">
          <span className="text-4xl">✨</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#F8F8FC] mb-4">AI Studio</h1>
        <p className="text-[#9090A8]">Upgrade your plan to access AI features.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#F8F8FC] mb-2">AI Studio</h1>
        <p className="text-[#9090A8]">Create stunning images and content with artificial intelligence</p>
      </header>

      <div className="flex gap-8">
        <div className="flex-1">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#141420] text-[#9090A8] hover:text-[#F8F8FC]'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#141420] text-[#9090A8] hover:text-[#F8F8FC]'
              }`}
            >
              AI Tools
            </button>
          </div>

          {activeTab === 'generate' && (
            <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED] resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleEnhancePrompt}
                    className="text-sm text-[#F59E0B] hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Enhance with AI
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F8F8FC] mb-2">
                  Negative Prompt <span className="text-[#9090A8]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What you don't want in the image..."
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Model</label>
                  <select
                    value={selectedModel.id}
                    onChange={(e) => setSelectedModel(AI_MODELS.find((m) => m.id === e.target.value) || AI_MODELS[0])}
                    className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] focus:outline-none focus:border-[#7C3AED]"
                  >
                    {AI_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Aspect Ratio</label>
                  <select
                    value={selectedRatio.id}
                    onChange={(e) => setSelectedRatio(ASPECT_RATIOS.find((r) => r.id === e.target.value) || ASPECT_RATIOS[0])}
                    className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] focus:outline-none focus:border-[#7C3AED]"
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <option key={ratio.id} value={ratio.id}>
                        {ratio.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Style</label>
                  <select
                    value={selectedStyle.id}
                    onChange={(e) => setSelectedStyle(STYLE_PRESETS.find((s) => s.id === e.target.value) || STYLE_PRESETS[0])}
                    className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] focus:outline-none focus:border-[#7C3AED]"
                  >
                    {STYLE_PRESETS.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.icon} {style.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Generate Image
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-2 gap-4">
              {AI_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  className="p-6 bg-[#141420] rounded-xl border border-[#2A2A3E] hover:border-[#7C3AED] transition-colors text-left"
                >
                  <span className="text-3xl mb-3 block">{tool.icon}</span>
                  <h3 className="font-semibold text-[#F8F8FC] mb-1">{tool.name}</h3>
                  <p className="text-sm text-[#9090A8]">{tool.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-80">
          <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-4">
            <h3 className="font-medium text-[#F8F8FC] mb-4">Generated Images</h3>
            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {generatedImages.map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-[#0A0A0F]">
                    <img src={img} alt={`Generated ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-[#0A0A0F] flex items-center justify-center">
                <div className="text-center text-[#9090A8]">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No images yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
