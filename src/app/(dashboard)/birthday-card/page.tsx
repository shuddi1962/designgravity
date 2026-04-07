'use client';

import { useState, useCallback, useEffect } from 'react';
import { useBirthdayCardStore } from '@/stores/birthday-card.store';
import { useFeatureFlag } from '@/stores/feature-flags.store';
import { eventBus, EVENTS } from '@/lib/event-bus';
import toast from 'react-hot-toast';

type Step = 'info' | 'photo' | 'message' | 'template' | 'customize' | 'preview';
type BirthdayTone = 'funny' | 'warm' | 'elegant' | 'bold' | 'cute';

interface BirthdayFormData {
  personName: string;
  age: string;
  occasionType: string;
  tone: BirthdayTone;
  message: string;
  senderName: string;
}

const BIRTHDAY_MESSAGES = {
  funny: [
    "Another year wiser... but let's focus on the cake!",
    "Age is just a number, but yours is looking fabulous!",
    "Warning: You're now officially {age}! Handle with cake.",
    "Congratulations on surviving another trip around the sun!",
    "They say you get better with age — you must be extraordinary!",
  ],
  warm: [
    "Wishing {name} a birthday as beautiful and bright as you make every day around you.",
    "Today we celebrate the amazing person you are — may your day be filled with joy.",
    "Happy Birthday, {name}. You make the world a warmer, kinder place. Here's to you.",
    "On your special day, may every wish you make come true. We love you!",
    "You deserve all the happiness the world can offer. Happy Birthday!",
  ],
  elegant: [
    "Many happy returns of this most splendid day, dear {name}.",
    "To {name} on this celebrated occasion — wishing you a year of grace and abundance.",
    "With warmest wishes on your birthday — may the year ahead bring you everything you deserve.",
    "{name}, you carry yourself with elegance and grace. Happy Birthday.",
    "Today we raise a glass to {name} — brilliant, accomplished, and dearly celebrated.",
  ],
  bold: [
    "IT'S {name}'S DAY! Let's make it legendary!",
    "HAPPY BIRTHDAY {name}! Time to turn up and celebrate YOU!",
    "{name} is {age} and absolutely THRIVING! Let's gooooo!",
    "This is your moment! Happy Birthday — own it!",
    "New level unlocked: {name} is now {age}! Boss mode activated!",
  ],
  cute: [
    "Happy Birthday to the sweetest person I know!",
    "{name}, you make every day brighter just by being you. Happy Birthday!",
    "Wishing my favorite human the most beautiful birthday!",
    "Happy Birthday {name}! You deserve ALL the sprinkles today!",
    "Today is YOUR day! We hope it's as magical as you are!",
  ],
};

const COLOR_THEMES = [
  { id: 'rose-gold', name: 'Rose Gold Party', colors: ['#C9A96E', '#E8C0C0', '#F7D7DA', '#FFFFFF'] },
  { id: 'tropical', name: 'Tropical Fiesta', colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1'] },
  { id: 'midnight-glam', name: 'Midnight Glam', colors: ['#6C3483', '#D4AC0D', '#F9E4B7', '#FDFEFE'] },
  { id: 'garden', name: 'Garden Fresh', colors: ['#27AE60', '#F1C40F', '#E74C3C', '#FFFFFF'] },
  { id: 'ocean', name: 'Ocean Breeze', colors: ['#3498DB', '#1ABC9C', '#F39C12', '#FFFFFF'] },
  { id: 'pastel', name: 'Pastel Dream', colors: ['#FFB3C6', '#BDE0FE', '#CAFFBF', '#FFC9DE'] },
  { id: 'golden', name: 'Golden Birthday', colors: ['#F39C12', '#D4AC0D', '#F8C471', '#FFF3E0'] },
  { id: 'pink', name: 'Pink Celebration', colors: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFF0F5'] },
  { id: 'purple', name: 'Royal Purple', colors: ['#8E44AD', '#BB8FCE', '#D2B4DE', '#F5EEF8'] },
  { id: 'sunset', name: 'Sunset Vibes', colors: ['#FF6B6B', '#FFA07A', '#FFD700', '#FF8C00'] },
];

const FONT_COMBOS = [
  { id: 'fun', heading: 'Pacifico', body: 'Nunito', description: 'Fun and friendly' },
  { id: 'elegant', heading: 'Great Vibes', body: 'Raleway', description: 'Elegant and romantic' },
  { id: 'bold', heading: 'Fredoka One', body: 'Poppins', description: 'Bold and modern' },
  { id: 'luxury', heading: 'Playfair Display', body: 'Cormorant Garamond', description: 'Luxury milestone' },
  { id: 'urban', heading: 'Bebas Neue', body: 'Montserrat', description: 'Urban and bold' },
];

const TEMPLATES = [
  { id: 'floral-1', name: 'Rose Garden', category: 'floral', thumbnail: null },
  { id: 'floral-2', name: 'Sunflower Field', category: 'floral', thumbnail: null },
  { id: 'balloon-1', name: 'Party Balloons', category: 'balloons', thumbnail: null },
  { id: 'balloon-2', name: 'Confetti Blast', category: 'balloons', thumbnail: null },
  { id: 'gold-1', name: 'Golden Elegance', category: 'gold-luxury', thumbnail: null },
  { id: 'gold-2', name: 'Champagne Toast', category: 'gold-luxury', thumbnail: null },
  { id: 'pastel-1', name: 'Soft Blush', category: 'pastel', thumbnail: null },
  { id: 'pastel-2', name: 'Lavender Dreams', category: 'pastel', thumbnail: null },
  { id: 'bold-1', name: 'Neon Party', category: 'bold-colorful', thumbnail: null },
  { id: 'minimal-1', name: 'Clean & Simple', category: 'minimal', thumbnail: null },
  { id: 'photo-1', name: 'Photo Focus', category: 'photo-forward', thumbnail: null },
  { id: 'milestone-30', name: 'Dirty 30', category: 'age-milestone', thumbnail: null },
];

const PHOTO_FILTERS = [
  { id: 'none', name: 'Original' },
  { id: 'warm-glow', name: 'Warm Glow' },
  { id: 'vibrant-pop', name: 'Vibrant Pop' },
  { id: 'soft-pastel', name: 'Soft Pastel' },
  { id: 'golden-hour', name: 'Golden Hour' },
  { id: 'birthday-glow', name: 'Birthday Glow' },
];

export default function BirthdayCardPage() {
  const isEnabled = useFeatureFlag('aiBirthdayCard');
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [formData, setFormData] = useState({
    personName: '',
    age: '',
    occasionType: 'birthday',
    tone: 'warm' as 'funny' | 'warm' | 'elegant' | 'bold' | 'cute',
    message: '',
    senderName: '',
  });
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedColorTheme, setSelectedColorTheme] = useState(COLOR_THEMES[0]);
  const [selectedFontCombo, setSelectedFontCombo] = useState(FONT_COMBOS[0]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const { createCard, updateCard, resetCard, currentCard } = useBirthdayCardStore();

  useEffect(() => {
    return () => {
      resetCard();
    };
  }, [resetCard]);

  const steps = [
    { id: 'info', label: 'Info', number: 1 },
    { id: 'photo', label: 'Photo', number: 2 },
    { id: 'message', label: 'Message', number: 3 },
    { id: 'template', label: 'Template', number: 4 },
    { id: 'customize', label: 'Customize', number: 5 },
    { id: 'preview', label: 'Preview', number: 6 },
  ];

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Photo must be less than 20MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhoto(event.target?.result as string);
        toast.success('Photo uploaded! We\'ll enhance it automatically.');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerateCard = async () => {
    if (!formData.personName) {
      toast.error("Please enter the birthday person's name");
      return;
    }

    setIsGenerating(true);
    try {
      const card = createCard(formData.personName);
      updateCard({
        age: formData.age ? parseInt(formData.age) : undefined,
        occasionType: formData.occasionType,
        tone: formData.tone,
        message: formData.message || selectedMessage || undefined,
        senderName: formData.senderName || undefined,
        photoUrl: uploadedPhoto || undefined,
        templateId: selectedTemplate || undefined,
        colorTheme: selectedColorTheme?.colors,
        fontCombo: selectedFontCombo,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("AI is creating your card...");
      setCurrentStep('preview');
    } catch {
      toast.error('Failed to generate card');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoDesign = async () => {
    const { currentCard } = useBirthdayCardStore.getState();
    if (!currentCard) {
      toast.error('Please complete the card info first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          personName: formData.personName,
          age: formData.age,
          tone: formData.tone,
          templateId: selectedTemplate,
          colorTheme: selectedColorTheme,
          fontCombo: selectedFontCombo,
          photoUrl: uploadedPhoto,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      updateCard({ designUrl: data.designUrl, status: 'draft' });
      toast.success('Surprise Me! Your AI-designed card is ready!');
    } catch {
      toast.error('Auto-design failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    const { currentCard } = useBirthdayCardStore.getState();
    if (!currentCard) {
      toast.error('No card to export');
      return;
    }

    try {
      updateCard({ status: 'exported' });
      toast.success(`Exporting as ${format.toUpperCase()}...`);
      eventBus.emit(EVENTS.CARD_EXPORTED, { cardId: currentCard.id, format });
    } catch {
      toast.error('Export failed');
    }
  };

  if (!isEnabled) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#141420] flex items-center justify-center">
          <span className="text-4xl">🎂</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#F8F8FC] mb-4">Birthday Card Studio</h1>
        <p className="text-[#9090A8]">This feature is currently unavailable. Please upgrade your plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#F8F8FC] mb-2">Birthday Card Studio</h1>
        <p className="text-[#9090A8]">Create a personalized birthday card in minutes with AI</p>
      </header>

      <div className="flex gap-8">
        <div className="flex-1">
          <StepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

          <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-6">
            {currentStep === 'info' && (
              <InfoStep formData={formData} setFormData={setFormData} onNext={() => setCurrentStep('photo')} />
            )}
            {currentStep === 'photo' && (
              <PhotoStep
                uploadedPhoto={uploadedPhoto}
                onUpload={handlePhotoUpload}
                onNext={() => setCurrentStep('message')}
                onBack={() => setCurrentStep('info')}
              />
            )}
            {currentStep === 'message' && (
              <MessageStep
                formData={formData}
                setFormData={setFormData}
                selectedMessage={selectedMessage}
                setSelectedMessage={setSelectedMessage}
                onNext={() => setCurrentStep('template')}
                onBack={() => setCurrentStep('photo')}
              />
            )}
            {currentStep === 'template' && (
              <TemplateStep
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                onNext={() => setCurrentStep('customize')}
                onBack={() => setCurrentStep('message')}
              />
            )}
            {currentStep === 'customize' && (
              <CustomizeStep
                selectedColorTheme={selectedColorTheme}
                setSelectedColorTheme={setSelectedColorTheme}
                selectedFontCombo={selectedFontCombo}
                setSelectedFontCombo={setSelectedFontCombo}
                onNext={() => setCurrentStep('preview')}
                onBack={() => setCurrentStep('template')}
              />
            )}
            {currentStep === 'preview' && (
              <PreviewStep
                formData={formData}
                uploadedPhoto={uploadedPhoto}
                selectedMessage={selectedMessage}
                selectedTemplate={selectedTemplate}
                selectedColorTheme={selectedColorTheme}
                selectedFontCombo={selectedFontCombo}
                isGenerating={isGenerating}
                onAutoDesign={handleAutoDesign}
                onExport={handleExport}
                onEdit={() => setCurrentStep('customize')}
              />
            )}
          </div>
        </div>

        <div className="w-80">
          <CardPreview
            formData={formData}
            uploadedPhoto={uploadedPhoto}
            selectedMessage={selectedMessage}
            selectedColorTheme={selectedColorTheme}
            selectedFontCombo={selectedFontCombo}
          />
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: Array<{ id: string; label: string; number: number }>;
  currentStep: Step;
  onStepClick: (step: Step) => void;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => index <= currentIndex && onStepClick(step.id as Step)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
              index < currentIndex
                ? 'bg-[#7C3AED] text-white'
                : index === currentIndex
                ? 'bg-[#7C3AED] text-white ring-4 ring-[#7C3AED]/30'
                : 'bg-[#141420] border border-[#2A2A3E] text-[#9090A8]'
            }`}
          >
            {index < currentIndex ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step.number
            )}
          </button>
          <span className={`ml-2 text-sm ${index <= currentIndex ? 'text-[#F8F8FC]' : 'text-[#9090A8]'}`}>
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-4 ${index < currentIndex ? 'bg-[#7C3AED]' : 'bg-[#2A2A3E]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InfoStep({
  formData,
  setFormData,
  onNext,
}: {
  formData: BirthdayFormData;
  setFormData: (data: BirthdayFormData) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-4">Who is this card for?</h2>
        <p className="text-[#9090A8] mb-6">Tell us about the birthday person and we&apos;ll create something special.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8F8FC] mb-2">
          Birthday Person&apos;s Name <span className="text-[#EF4444]">*</span>
        </label>
        <input
          type="text"
          value={formData.personName}
          onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
          placeholder="Enter name"
          className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Age (optional)</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          placeholder="Enter age"
          className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Occasion</label>
        <select
          value={formData.occasionType}
          onChange={(e) => setFormData({ ...formData, occasionType: e.target.value })}
          className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] focus:outline-none focus:border-[#7C3AED]"
        >
          <option value="birthday">Birthday</option>
          <option value="milestone-18">18th Birthday</option>
          <option value="milestone-30">30th Birthday</option>
          <option value="milestone-40">40th Birthday</option>
          <option value="milestone-50">50th Birthday</option>
          <option value="milestone-60">60th Birthday</option>
          <option value="milestone-70+">70+ Birthday</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Tone</label>
        <div className="grid grid-cols-5 gap-2">
          {(['funny', 'warm', 'elegant', 'bold', 'cute'] as const).map((tone) => (
            <button
              key={tone}
              onClick={() => setFormData({ ...formData, tone })}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                formData.tone === tone
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#0A0A0F] border border-[#2A2A3E] text-[#9090A8] hover:border-[#7C3AED]'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8F8FC] mb-2">From (optional)</label>
        <input
          type="text"
          value={formData.senderName}
          onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
          placeholder="Your name or 'From all of us'"
          className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED]"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!formData.personName}
        className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        Continue
      </button>
    </div>
  );
}

function PhotoStep({
  uploadedPhoto,
  onUpload,
  onNext,
  onBack,
}: {
  uploadedPhoto: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-2">Add a Photo</h2>
        <p className="text-[#9090A8]">Upload a photo of the birthday person. We&apos;ll enhance it automatically!</p>
      </div>

      <div className="border-2 border-dashed border-[#2A2A3E] rounded-xl p-8 text-center">
        {uploadedPhoto ? (
          <div className="relative">
            <img
              src={uploadedPhoto}
              alt="Uploaded"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              onClick={() => {}}
              className="absolute top-2 right-2 p-2 bg-[#0A0A0F] rounded-full"
            >
              <svg className="w-5 h-5 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0A0A0F] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#F8F8FC] mb-2">Drag & drop a photo or click to browse</p>
            <p className="text-sm text-[#9090A8] mb-4">JPG, PNG, WEBP up to 20MB</p>
            <label className="inline-block px-6 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg cursor-pointer transition-colors">
              Upload Photo
              <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
            </label>
          </>
        )}
      </div>

      {uploadedPhoto && (
        <div className="space-y-4">
          <h3 className="font-medium text-[#F8F8FC]">Enhancement Filters</h3>
          <div className="grid grid-cols-6 gap-2">
            {PHOTO_FILTERS.map((filter) => (
              <button
                key={filter.id}
                className="p-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A3E] hover:border-[#7C3AED] transition-colors"
              >
                <span className="text-xs text-[#9090A8]">{filter.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#2A2A3E] rounded-lg text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium transition-colors"
        >
          {uploadedPhoto ? 'Continue' : 'Skip Photo'}
        </button>
      </div>
    </div>
  );
}

function MessageStep({
  formData,
  setFormData,
  selectedMessage,
  setSelectedMessage,
  onNext,
  onBack,
}: {
  formData: BirthdayFormData;
  setFormData: (data: BirthdayFormData) => void;
  selectedMessage: string | null;
  setSelectedMessage: (message: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const tone = formData.tone as keyof typeof BIRTHDAY_MESSAGES;
  const messages = BIRTHDAY_MESSAGES[tone] || BIRTHDAY_MESSAGES.warm;

  const personalizedMessages = messages.map((msg) =>
    msg.replace('{name}', formData.personName || 'Friend').replace('{age}', formData.age || '')
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-2">Choose a Message</h2>
        <p className="text-[#9090A8]">Select a heartfelt message or write your own</p>
      </div>

      <div className="space-y-3 max-h-64 overflow-auto">
        {personalizedMessages.map((msg, index) => (
          <button
            key={index}
            onClick={() => setSelectedMessage(msg)}
            className={`w-full p-4 rounded-lg text-left transition-colors ${
              selectedMessage === msg
                ? 'bg-[#7C3AED] text-white'
                : 'bg-[#0A0A0F] border border-[#2A2A3E] hover:border-[#7C3AED]'
            }`}
          >
            <p className={selectedMessage === msg ? 'text-white' : 'text-[#F8F8FC]'}>{msg}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8F8FC] mb-2">Or write your own (max 200 chars)</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value.slice(0, 200) })}
          placeholder="Write a personal message..."
          rows={3}
          className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED] resize-none"
        />
        <p className="text-xs text-[#9090A8] text-right mt-1">{formData.message.length}/200</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#2A2A3E] rounded-lg text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function TemplateStep({
  selectedTemplate,
  setSelectedTemplate,
  onNext,
  onBack,
}: {
  selectedTemplate: string | null;
  setSelectedTemplate: (template: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const categories = ['All', 'Floral', 'Balloons', 'Gold & Luxury', 'Pastel', 'Bold', 'Minimal'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-2">Choose a Template</h2>
        <p className="text-[#9090A8]">Pick a design style for your birthday card</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-lg text-sm bg-[#0A0A0F] border border-[#2A2A3E] text-[#9090A8] hover:border-[#7C3AED] transition-colors"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`aspect-[5/7] rounded-lg overflow-hidden border-2 transition-colors ${
              selectedTemplate === template.id
                ? 'border-[#7C3AED]'
                : 'border-[#2A2A3E] hover:border-[#7C3AED]/50'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#7C3AED]/20 to-[#F59E0B]/20 flex items-center justify-center">
              <span className="text-4xl">
                {template.category === 'floral' && '🌸'}
                {template.category === 'balloons' && '🎈'}
                {template.category === 'gold-luxury' && '✨'}
                {template.category === 'pastel' && '💕'}
                {template.category === 'bold-colorful' && '🎉'}
                {template.category === 'minimal' && '💎'}
                {template.category === 'photo-forward' && '📸'}
                {template.category === 'age-milestone' && '🎂'}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#2A2A3E] rounded-lg text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function CustomizeStep({
  selectedColorTheme,
  setSelectedColorTheme,
  selectedFontCombo,
  setSelectedFontCombo,
  onNext,
  onBack,
}: {
  selectedColorTheme: (typeof COLOR_THEMES)[0];
  setSelectedColorTheme: (theme: (typeof COLOR_THEMES)[0]) => void;
  selectedFontCombo: (typeof FONT_COMBOS)[0];
  setSelectedFontCombo: (combo: (typeof FONT_COMBOS)[0]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-2">Customize</h2>
        <p className="text-[#9090A8]">Choose colors and fonts for your card</p>
      </div>

      <div>
        <h3 className="font-medium text-[#F8F8FC] mb-3">Color Theme</h3>
        <div className="grid grid-cols-5 gap-3">
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedColorTheme(theme)}
              className={`p-2 rounded-lg border-2 transition-colors ${
                selectedColorTheme.id === theme.id
                  ? 'border-[#7C3AED]'
                  : 'border-[#2A2A3E] hover:border-[#7C3AED]/50'
              }`}
            >
              <div className="flex h-6 rounded overflow-hidden">
                {theme.colors.map((color, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <p className="text-xs text-[#9090A8] mt-1 truncate">{theme.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-[#F8F8FC] mb-3">Font Combination</h3>
        <div className="space-y-2">
          {FONT_COMBOS.map((combo) => (
            <button
              key={combo.id}
              onClick={() => setSelectedFontCombo(combo)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                selectedFontCombo.id === combo.id
                  ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                  : 'border-[#2A2A3E] hover:border-[#7C3AED]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#F8F8FC]">{combo.heading} + {combo.body}</p>
                  <p className="text-sm text-[#9090A8]">{combo.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#2A2A3E] rounded-lg text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-medium transition-colors"
        >
          Preview Card
        </button>
      </div>
    </div>
  );
}

function PreviewStep({
  formData,
  uploadedPhoto,
  selectedMessage,
  selectedTemplate,
  selectedColorTheme,
  selectedFontCombo,
  isGenerating,
  onAutoDesign,
  onExport,
  onEdit,
}: {
  formData: { personName: string; age: string; tone: string; message: string; senderName: string };
  uploadedPhoto: string | null;
  selectedMessage: string | null;
  selectedTemplate: string | null;
  selectedColorTheme: (typeof COLOR_THEMES)[0];
  selectedFontCombo: (typeof FONT_COMBOS)[0];
  isGenerating: boolean;
  onAutoDesign: () => void;
  onExport: (format: 'png' | 'jpg' | 'pdf') => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#F8F8FC] mb-2">Preview & Export</h2>
        <p className="text-[#9090A8]">Your card is ready! Export it or let AI create a surprise design.</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onAutoDesign}
          disabled={isGenerating}
          className="flex-1 py-3 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:opacity-90 disabled:opacity-50 text-[#0A0A0F] rounded-lg font-medium transition-all flex items-center justify-center gap-2"
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
              Surprise Me! (AI Auto-Design)
            </>
          )}
        </button>
      </div>

      <div className="border-t border-[#2A2A3E] pt-6">
        <h3 className="font-medium text-[#F8F8FC] mb-4">Export Options</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onExport('png')}
            className="p-4 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg hover:border-[#7C3AED] transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">🖼️</span>
            <span className="text-sm font-medium text-[#F8F8FC]">PNG</span>
            <p className="text-xs text-[#9090A8]">For printing</p>
          </button>
          <button
            onClick={() => onExport('jpg')}
            className="p-4 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg hover:border-[#7C3AED] transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">📷</span>
            <span className="text-sm font-medium text-[#F8F8FC]">JPG</span>
            <p className="text-xs text-[#9090A8]">For sharing</p>
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="p-4 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg hover:border-[#7C3AED] transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">📄</span>
            <span className="text-sm font-medium text-[#F8F8FC]">PDF</span>
            <p className="text-xs text-[#9090A8]">Print-ready</p>
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 border border-[#2A2A3E] rounded-lg text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors"
        >
          Edit in Canvas
        </button>
        <button className="flex-1 py-3 bg-[#141420] border border-[#2A2A3E] rounded-lg text-[#9090A8]">
          Share Card
        </button>
      </div>
    </div>
  );
}

function CardPreview({
  formData,
  uploadedPhoto,
  selectedMessage,
  selectedColorTheme,
  selectedFontCombo,
}: {
  formData: { personName: string; age: string; tone: string; message: string; senderName: string };
  uploadedPhoto: string | null;
  selectedMessage: string | null;
  selectedColorTheme: (typeof COLOR_THEMES)[0];
  selectedFontCombo: (typeof FONT_COMBOS)[0];
}) {
  return (
    <div className="bg-[#141420] rounded-xl border border-[#2A2A3E] p-4 sticky top-4">
      <h3 className="font-medium text-[#F8F8FC] mb-4">Card Preview</h3>
      <div
        className="aspect-[5/7] rounded-lg overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${selectedColorTheme.colors[0]}, ${selectedColorTheme.colors[1]})`,
        }}
      >
        <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative">
          {uploadedPhoto && (
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/50 mb-4">
              <img src={uploadedPhoto} alt="Photo" className="w-full h-full object-cover" />
            </div>
          )}

          {formData.personName && (
            <h1
              className="text-2xl font-bold text-white mb-2 drop-shadow-lg"
              style={{ fontFamily: selectedFontCombo.heading }}
            >
              Happy Birthday
            </h1>
          )}

          {formData.personName && (
            <h2
              className="text-3xl font-bold text-white drop-shadow-lg"
              style={{ fontFamily: selectedFontCombo.heading }}
            >
              {formData.personName}
            </h2>
          )}

          {formData.age && (
            <div
              className="text-6xl font-bold text-white/90 my-4 drop-shadow-lg"
              style={{ fontFamily: selectedFontCombo.heading }}
            >
              {formData.age}
            </div>
          )}

          {selectedMessage && (
            <p
              className="text-sm text-white/90 max-w-full px-2 drop-shadow"
              style={{ fontFamily: selectedFontCombo.body }}
            >
              {selectedMessage}
            </p>
          )}

          {formData.senderName && (
            <p
              className="absolute bottom-6 text-sm text-white/80"
              style={{ fontFamily: selectedFontCombo.body }}
            >
              {formData.senderName}
            </p>
          )}

          <div className="absolute top-2 right-2 flex gap-1">
            <span className="text-lg">🎈</span>
            <span className="text-lg">🎉</span>
            <span className="text-lg">🎂</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex h-4 rounded overflow-hidden">
          {selectedColorTheme.colors.map((color, i) => (
            <div key={i} className="w-6" style={{ backgroundColor: color }} />
          ))}
        </div>
        <span className="text-xs text-[#9090A8]">{selectedColorTheme.name}</span>
      </div>
    </div>
  );
}
