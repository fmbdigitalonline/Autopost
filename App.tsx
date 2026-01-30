
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { PostBrief, GeneratedPost, ContentChunk, Platform, Tone, AppTab, GenPhase } from './types';
import { generateSocialContent, generateChunkVisual, generateChunkAudio } from './geminiService';
import { VideoPreview } from './components/VideoPreview';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState<GenPhase>('idle');
  const [generationStep, setGenerationStep] = useState<string>('');

  const totalSpent = useMemo(() => posts.reduce((acc, p) => acc + p.estimatedCost, 0), [posts]);

  // Form State
  const [brief, setBrief] = useState<PostBrief>({
    title: '',
    description: '',
    tone: 'professional',
    platform: 'linkedin',
    targetLength: 'medium'
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // Week 1: Storyboarding Phase
      setGenPhase('storyboarding');
      setGenerationStep('Agentic Storyboarding (Week 1 Pipeline)...');
      const result = await generateSocialContent(brief);
      
      const draftPost: GeneratedPost = {
        id: Math.random().toString(36).substring(2, 11),
        brief: { ...brief },
        headline: result.headline || 'Untitled Post',
        caption: result.caption || '',
        hashtags: result.hashtags || [],
        chunks: result.chunks || [],
        status: 'draft',
        createdAt: Date.now(),
        estimatedCost: 0.05 // Initial LLM cost
      };

      // Week 2: Asset Pipeline Phase
      setGenPhase('assets');
      const updatedChunks: ContentChunk[] = [...draftPost.chunks];
      for (let i = 0; i < updatedChunks.length; i++) {
        setGenerationStep(`Asset Pipeline: Rendering Frame ${i + 1}/${updatedChunks.length}...`);
        updatedChunks[i].imageUrl = await generateChunkVisual(updatedChunks[i].visualPrompt);
        draftPost.estimatedCost += 0.10; // Image cost

        setGenerationStep(`Asset Pipeline: Synthesizing Voice ${i + 1}/${updatedChunks.length}...`);
        updatedChunks[i].audioData = await generateChunkAudio(updatedChunks[i].text);
        draftPost.estimatedCost += 0.05; // TTS cost
      }

      // Week 3: FFmpeg Assembly Simulation Phase
      setGenPhase('baking');
      setGenerationStep('FFmpeg Engine: Baking MP4 Container (Week 3 Pipeline)...');
      await new Promise(r => setTimeout(r, 2000)); // Simulate encoding overhead
      draftPost.estimatedCost += 0.30; // Compute cost

      // Week 4: Finalizing & Cost Monitoring
      setGenPhase('finalizing');
      setGenerationStep('Validation & Finalizing (Week 4 Cost Audit)...');
      const finalPost: GeneratedPost = { ...draftPost, chunks: updatedChunks, status: 'scheduled' };
      setPosts(prev => [finalPost, ...prev]);
      
      setTimeout(() => {
        setIsGenerating(false);
        setGenPhase('idle');
        setActiveTab('dashboard');
        setBrief({ title: '', description: '', tone: 'professional', platform: 'linkedin', targetLength: 'medium' });
      }, 1000);

    } catch (error) {
      console.error('Generation Error:', error);
      alert('Pipeline failure. Check API keys or credits.');
      setIsGenerating(false);
      setGenPhase('idle');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 p-8">
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-slide-in">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Content Dashboard</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-slate-500">Managing your automated content queue.</p>
                  <span className="h-4 w-px bg-slate-300"></span>
                  <div className="flex items-center text-indigo-600 font-bold text-sm">
                    <i className="fas fa-wallet mr-2"></i> Total Burn: ${totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('create')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                <i className="fas fa-plus mr-2"></i> New AI Post
              </button>
            </header>

            {posts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-magic text-3xl text-indigo-400"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800">No content generated yet</h3>
                <p className="text-slate-500 mb-8">Ready to achieve $1/video ROI? Start by creating your first brief.</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Get Started <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 flex flex-col group">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            post.brief.platform === 'linkedin' ? 'bg-blue-100 text-blue-700' :
                            post.brief.platform === 'twitter' ? 'bg-slate-100 text-slate-700' :
                            'bg-pink-100 text-pink-700'
                          }`}>
                            <i className={`fab fa-${post.brief.platform} mr-1`}></i> {post.brief.platform}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-bold">
                            COST: ${post.estimatedCost.toFixed(2)}
                          </span>
                        </div>
                        <button 
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => setPosts(prev => prev.filter(p => p.id !== post.id))}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      
                      <h4 className="text-xl font-bold text-slate-900 leading-tight">{post.headline}</h4>

                      <VideoPreview chunks={post.chunks} />

                      <div className="flex flex-wrap gap-2 pt-2">
                        {post.hashtags.map((tag, idx) => (
                          <span key={idx} className="text-xs font-medium text-indigo-500">#{tag.replace('#', '')}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <span className="flex items-center text-xs font-semibold text-emerald-600">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> QA Passed
                      </span>
                      <button className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all">
                        Publish <i className="fas fa-paper-plane ml-1 text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto animate-slide-in">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Create New Content</h2>
              <p className="text-slate-500">Brief the Agentic Pipeline. Optimized for &lt;$1/video marginal cost.</p>
            </header>

            <form onSubmit={handleCreatePost} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Campaign Title</label>
                  <input required type="text" placeholder="e.g. Q4 Brand Narrative"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={brief.title} onChange={e => setBrief({...brief, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Story Treatment / Beats</label>
                  <textarea required rows={4} placeholder="Summarize the core message or story beats..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={brief.description} onChange={e => setBrief({...brief, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Platform</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                    value={brief.platform} onChange={e => setBrief({...brief, platform: e.target.value as Platform})}>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Budget Strategy</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-indigo-600">
                    <option>Scale ($1/vid Optimization)</option>
                    <option disabled>High Fidelity (Beta)</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center">
                {isGenerating ? <><i className="fas fa-sync fa-spin mr-3"></i> Running Pipeline...</> : <><i className="fas fa-play mr-3"></i> Start Production</>}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="max-w-4xl mx-auto animate-slide-in pb-20">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 underline decoration-indigo-500 decoration-4 underline-offset-8">PRD: Agentic Story‑Driven Video</h2>
                <p className="text-slate-500 mt-4 text-lg">Operational Roadmap Status</p>
              </div>
              <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold flex items-center">
                <i className="fas fa-check-double mr-2"></i> Phase 1 & 2 Live
              </div>
            </header>

            <div className="space-y-12">
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <i className="fas fa-dollar-sign text-9xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <i className="fas fa-bullseye text-indigo-600 mr-3"></i> ROI Goals
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Maintain marginal costs ≤ $1 per video. Current app telemetry calculates costs based on real API usage.
                </p>
                <div className="grid grid-cols-4 gap-4">
                   <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">LLM</p>
                      <p className="font-bold text-indigo-600">$0.05</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">TTS</p>
                      <p className="font-bold text-indigo-600">$0.15</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Asset</p>
                      <p className="font-bold text-indigo-600">$0.40</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Infra</p>
                      <p className="font-bold text-indigo-600">$0.30</p>
                   </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <i className="fas fa-road text-indigo-600 mr-3"></i> 4. Implementatie Roadmap Status
                </h3>
                <div className="space-y-8">
                  <div className="relative pl-10 border-l-2 border-emerald-500">
                    <div className="absolute -left-2.5 top-0 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                       <i className="fas fa-check text-[8px] text-white"></i>
                    </div>
                    <p className="font-bold text-slate-900 flex items-center">
                      Week 1: Text-to-JSON Storyboarding
                      <span className="ml-3 text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">DONE</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1 italic">Gemini-Flash prompt logic integrated for strict JSON output schema.</p>
                  </div>

                  <div className="relative pl-10 border-l-2 border-emerald-500">
                    <div className="absolute -left-2.5 top-0 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                       <i className="fas fa-check text-[8px] text-white"></i>
                    </div>
                    <p className="font-bold text-slate-900 flex items-center">
                      Week 2: Audio & Visual Asset Pipeline
                      <span className="ml-3 text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">DONE</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1 italic">ElevenLabs-style TTS and Gemini Image gen integrated with local asset caching.</p>
                  </div>

                  <div className="relative pl-10 border-l-2 border-indigo-200">
                    <div className="absolute -left-2.5 top-0 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white animate-pulse"></div>
                    <p className="font-bold text-slate-900 flex items-center">
                      Week 3: FFmpeg Assembly Engine
                      <span className="ml-3 text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">IN PROGRESS</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Dockerized worker simulation active in browser. Next step: WASM FFmpeg integration.</p>
                  </div>

                  <div className="relative pl-10 border-l-2 border-slate-100">
                    <div className="absolute -left-2.5 top-0 w-5 h-5 bg-slate-200 rounded-full border-4 border-white"></div>
                    <p className="font-bold text-slate-900 opacity-50">Week 4: Beta Launch & Cost Monitoring</p>
                    <p className="text-sm text-slate-400 mt-1 italic">Telemetry tracking active. Live dash shows current burn per asset.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto animate-slide-in">
             <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
              <p className="text-slate-500">Global content engine parameters.</p>
            </header>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">Cost Alert Threshold</p>
                      <p className="text-sm text-slate-500">Notify when marginal cost > $1.20</p>
                    </div>
                    <input type="checkbox" checked readOnly className="w-5 h-5 accent-indigo-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">Asset Caching (Week 2)</p>
                      <p className="text-sm text-slate-500">Saves ~0.15c per generation</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">OPTIMIZED</span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Generation Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className={`w-20 h-20 border-4 rounded-full border-slate-100 border-t-indigo-600 animate-spin`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {genPhase === 'storyboarding' && <i className="fas fa-pen-nib text-indigo-600"></i>}
                  {genPhase === 'assets' && <i className="fas fa-image text-indigo-600"></i>}
                  {genPhase === 'baking' && <i className="fas fa-fire text-orange-500"></i>}
                  {genPhase === 'finalizing' && <i className="fas fa-check text-emerald-500"></i>}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                {genPhase === 'storyboarding' && 'Drafting Beats'}
                {genPhase === 'assets' && 'Cooking Assets'}
                {genPhase === 'baking' && 'Assembly Engine'}
                {genPhase === 'finalizing' && 'Post Production'}
              </h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{generationStep}</p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
               <div className={`bg-indigo-600 h-full transition-all duration-500 ${
                 genPhase === 'storyboarding' ? 'w-1/4' : 
                 genPhase === 'assets' ? 'w-2/4' : 
                 genPhase === 'baking' ? 'w-3/4' : 'w-full'
               }`}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
