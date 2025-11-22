
import React, { useState, useEffect, useRef } from 'react';
import { AppStep, GeneratedImage, GenerationConfig } from './types';
import { checkApiKey, openApiKeySelector, generateCatImage, generateDancingVideo } from './services/geminiService';
import { AudioManager } from './services/audioService';
import { Button } from './components/Button';
import { LoadingOverlay } from './components/LoadingOverlay';

// Default prompts as per MVP instructions
const DEFAULT_IMAGE_PROMPT = "A simple 2D cartoon cat character, full body, side view, in a simple colorful disco room with a spinning disco ball, friendly style, easy to animate. No complex details.";
const DEFAULT_VIDEO_PROMPT = "The cartoon cat sways side to side and bobs its head, playful dance, looping animation.";

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.API_CHECK);
  const [config, setConfig] = useState<GenerationConfig>({
    imagePrompt: DEFAULT_IMAGE_PROMPT,
    videoPrompt: DEFAULT_VIDEO_PROMPT,
  });
  
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Audio State
  const audioManagerRef = useRef<AudioManager | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  // Initial API Check
  useEffect(() => {
    const initCheck = async () => {
      try {
        const hasKey = await checkApiKey();
        if (hasKey) {
          setStep(AppStep.CREATE_ASSET);
        }
      } catch (e) {
        console.error(e);
        // If check fails, stay on API_CHECK
      }
    };
    initCheck();
  }, []);

  // Initialize Audio Manager when reaching Result step
  useEffect(() => {
    if (step === AppStep.RESULT && !audioManagerRef.current) {
      audioManagerRef.current = new AudioManager();
      // We don't auto-play here, we wait for the video to play
    }
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.stop();
      }
    };
  }, [step]);

  const handleApiSelection = async () => {
    try {
      setError(null);
      await openApiKeySelector();
      // Assume success after selection dialog closes (or returns)
      // Real-world would might want a loop or listener, but per guide we proceed
      setStep(AppStep.CREATE_ASSET);
    } catch (e) {
      setError("Failed to select API Key. Please try again.");
    }
  };

  const handleGenerateImage = async () => {
    setIsLoading(true);
    setLoadingMessage("Creating your cat character...");
    setError(null);

    try {
      const base64Data = await generateCatImage(config.imagePrompt);
      setGeneratedImage({
        id: Date.now().toString(),
        base64: base64Data,
        mimeType: 'image/png'
      });
      // Auto-advance to animation step as requested
      setStep(AppStep.ANIMATE);
    } catch (e: any) {
      setError(e.message || "Failed to generate image. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimate = async () => {
    if (!generatedImage) return;

    setIsLoading(true);
    setLoadingMessage("Teaching the cat to dance...");
    // Add reassuring messages for video generation which can take time
    const tips = [
      "This might take a minute...",
      "Applying motion vectors...",
      "Syncing the beat...",
      "Almost there..."
    ];
    let tipIdx = 0;
    const tipInterval = setInterval(() => {
        setLoadingMessage(`Teaching the cat to dance... (${tips[tipIdx]})`);
        tipIdx = (tipIdx + 1) % tips.length;
    }, 8000);

    setError(null);

    try {
      const url = await generateDancingVideo(generatedImage.base64, config.videoPrompt);
      setVideoUrl(url);
      setStep(AppStep.RESULT);
    } catch (e: any) {
      setError(e.message || "Failed to generate video. Try again.");
    } finally {
      clearInterval(tipInterval);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (audioManagerRef.current) audioManagerRef.current.stop();
    setStep(AppStep.CREATE_ASSET);
    setGeneratedImage(null);
    setVideoUrl(null);
    setConfig({
      imagePrompt: DEFAULT_IMAGE_PROMPT,
      videoPrompt: DEFAULT_VIDEO_PROMPT,
    });
  };

  const handleRefineDance = () => {
    if (audioManagerRef.current) audioManagerRef.current.stop();
    setStep(AppStep.ANIMATE);
    setVideoUrl(null);
  };

  const toggleMusic = async () => {
    if (!audioManagerRef.current) return;
    
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    
    if (newState) {
      await audioManagerRef.current.init();
      audioManagerRef.current.play();
    } else {
      audioManagerRef.current.stop();
    }
  };

  // Video Event Handlers for Audio Sync
  const handleVideoPlay = async () => {
    if (isMusicEnabled && audioManagerRef.current) {
      await audioManagerRef.current.init();
      audioManagerRef.current.play();
    }
  };

  const handleVideoPause = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.stop();
    }
  };

  // Render Steps

  const renderApiCheck = () => (
    <div className="flex flex-col items-center justify-center h-screen p-6 text-center max-w-lg mx-auto">
      <div className="mb-8 p-6 bg-indigo-900/30 rounded-full">
        <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
        AI Cat Dancer Studio
      </h1>
      <p className="text-gray-300 mb-8 text-lg">
        To generate Veo videos, you need to select a paid Google Cloud Project API key.
        <br />
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline text-sm mt-2 inline-block">
          Learn more about billing
        </a>
      </p>
      <Button onClick={handleApiSelection} className="w-full sm:w-auto text-lg px-8 py-4">
        Select API Key to Start
      </Button>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );

  const renderCreateAsset = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Phase 1: The Visual</h2>
        <div className="text-sm text-gray-400">Step 1 of 2</div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <label className="block text-gray-300 mb-2 font-medium">Character Prompt</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-32 resize-none"
            value={config.imagePrompt}
            onChange={(e) => setConfig({ ...config, imagePrompt: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-2">
            Tip: Keep it simple. 2D characters on plain backgrounds work best for motion.
          </p>
          <div className="mt-6">
            <Button onClick={handleGenerateImage} disabled={isLoading} className="w-full">
              Generate Character
            </Button>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
          {generatedImage ? (
            <div className="relative group w-full h-full flex flex-col items-center">
              <img 
                src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`} 
                alt="Generated Cat" 
                className="max-h-[300px] rounded-lg shadow-lg object-contain bg-white" 
              />
              <div className="mt-6 flex gap-3 w-full">
                <Button variant="secondary" onClick={() => setGeneratedImage(null)} className="flex-1">
                  Discard
                </Button>
                <Button onClick={() => setStep(AppStep.ANIMATE)} className="flex-1">
                  Next: Animate
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="mb-4 inline-block p-4 bg-gray-900 rounded-full">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p>No character generated yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnimate = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <button onClick={() => setStep(AppStep.CREATE_ASSET)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-white">Phase 2: The Motion</h2>
         </div>
        <div className="text-sm text-gray-400">Step 2 of 2</div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Source Image Preview */}
        <div className="md:col-span-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Source Character</h3>
                {generatedImage && (
                    <img 
                    src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`} 
                    alt="Source" 
                    className="w-full rounded-lg bg-white"
                    />
                )}
            </div>
        </div>

        {/* Motion Controls */}
        <div className="md:col-span-8">
             <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full">
                <label className="block text-gray-300 mb-2 font-medium">Motion Prompt</label>
                <textarea
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-32 resize-none"
                    value={config.videoPrompt}
                    onChange={(e) => setConfig({ ...config, videoPrompt: e.target.value })}
                />
                 <p className="text-xs text-gray-500 mt-2 mb-6">
                    Tip: Use simple, repetitive actions like "sway", "bob", "wave". Complex dances may distort the character.
                </p>
                
                <div className="bg-indigo-900/20 border border-indigo-900/50 rounded-lg p-4 mb-6">
                    <h4 className="text-indigo-300 font-semibold mb-1 text-sm">Estimated Time</h4>
                    <p className="text-indigo-200/70 text-xs">Video generation typically takes 30-60 seconds. Please stay on this page.</p>
                </div>

                <Button onClick={handleAnimate} disabled={isLoading} className="w-full py-4 text-lg">
                    Make it Dance! (Generate Video)
                </Button>
                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
             </div>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">It's Showtime!</h2>
            <p className="text-gray-400">Here is your 5-second loopable dancing cat.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-2xl inline-block w-full max-w-lg relative">
            {videoUrl && (
                <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full rounded-xl bg-black aspect-square"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                />
            )}
        </div>
        
        <div className="mt-6 flex justify-center">
           <button 
             onClick={toggleMusic}
             className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${isMusicEnabled ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'}`}
           >
             {isMusicEnabled ? (
                <>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                 Music: On
                </>
             ) : (
               <>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                 Music: Off
               </>
             )}
           </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Button variant="secondary" onClick={handleRefineDance}>
                Try Different Moves
            </Button>
            <Button variant="primary" onClick={handleReset}>
                Start Over
            </Button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white">
      {isLoading && <LoadingOverlay message={loadingMessage} subMessage="Please wait while the AI works its magic" />}
      
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                  <span className="text-indigo-500">⚡</span> CatDancer<span className="text-gray-500 font-normal">Studio</span>
              </div>
              {step !== AppStep.API_CHECK && (
                  <div className="text-xs text-gray-500 font-mono">
                      Powered by Gemini & Veo
                  </div>
              )}
          </div>
      </header>

      <main className="container mx-auto pb-12">
        {step === AppStep.API_CHECK && renderApiCheck()}
        {step === AppStep.CREATE_ASSET && renderCreateAsset()}
        {step === AppStep.ANIMATE && renderAnimate()}
        {step === AppStep.RESULT && renderResult()}
      </main>
    </div>
  );
};

export default App;
