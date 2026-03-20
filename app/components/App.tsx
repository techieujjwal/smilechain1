"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Smile, LogOut, Twitter, Wallet, ChevronRight, Flame, TrendingUp, Heart, Sparkles } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageGrid } from './ImageGrid';
import { initCamera, uploadImage, compressImage, loadExistingPhotos, handleSmileBack, deletePhoto } from '../utils/camera';
import GoFundSmiles from './GoFundSmiles';
import { SmileLeaderboard, SmileMap } from './SmileNetwork';
import { NOUNS_SVG } from '../constants/nouns';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CONTRACT_ADDRESS = "0xf5526Ff322FBE97c31160A94A380093151Aa442F";
const CONTRACT_ABI = [
  "function analyzeSmile(string memory photoUrl) external payable",
  "function getOracleFee() external view returns (uint256)",
  "event SmileAnalysisReceived(bytes32 indexed requestId, string photoUrl, uint8 smileScore)"
];

const BASE_CHAIN_ID = 8453;
const BASE_CONFIG = {
  chainId: BASE_CHAIN_ID, name: 'Base', network: 'base',
  rpcUrls: { default: 'https://mainnet.base.org', public: 'https://mainnet.base.org' },
  blockExplorers: { default: { name: 'BaseScan', url: 'https://basescan.org' } },
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
};

interface ImageType {
  url: string; timestamp: string; isLoading: boolean;
  smileCount: number; smileScore: number | undefined;
  hasWon: boolean | undefined; isNounish: boolean;
}

/* ── Navbar ── */
const Navbar = ({ authenticated, login, logout, activeTab, setActiveTab }: any) => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-warm">
    <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200/40">
          <Smile size={20} className="text-white" />
        </div>
        <span className="font-bold text-[17px] tracking-tight text-gray-800">Proof of Smile</span>
      </div>
      
      <div className="hidden md:flex items-center gap-0.5 bg-gray-100 rounded-full px-1 py-1">
        {['Smile', 'Gallery', 'Fund'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab.toLowerCase()
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'Fund' ? 'Fund 💛' : tab}
          </button>
        ))}
      </div>
      
      <div>
        {authenticated ? (
          <button onClick={logout}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition-all">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Connected
            <LogOut size={14} className="text-gray-400" />
          </button>
        ) : (
          <button onClick={login}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-gray-900/10">
            <Wallet size={14} /> Connect
          </button>
        )}
      </div>
    </div>
    
    {/* Mobile tabs */}
    <div className="md:hidden flex justify-center gap-1 pb-2 px-4">
      {['Smile', 'Gallery', 'Fund'].map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
          className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
            activeTab === tab.toLowerCase()
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400'
          }`}>
          {tab === 'Fund' ? '💛 Fund' : tab}
        </button>
      ))}
    </div>
  </nav>
);

/* ── Result Overlay ── */
const ResultOverlay = ({ result, onClose }: { result: { score: number, isWinner: boolean } | null, onClose: () => void }) => {
  const shareText = result?.isWinner
    ? encodeURIComponent(`Just earned 0.001 USDC with a ${result.score}/5 smile on Proof of Smile 😊✨ @openputer`)
    : '';

  return (
    <AnimatePresence>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-lg"
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl shadow-orange-100/50"
            onClick={e => e.stopPropagation()}>
            {result.isWinner ? (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 mx-auto mb-5 flex items-center justify-center animate-celebrate shadow-lg shadow-amber-200/50">
                  <Sparkles size={36} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-1">Beautiful smile! 😊</h2>
                <p className="text-gray-400 mb-5">Score: {result.score}/5</p>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100">
                  <div className="text-4xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    +0.001 USDC
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Earned on Base Network</div>
                </div>
                
                <div className="flex gap-3">
                  <a href={`https://twitter.com/intent/tweet?text=${shareText}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-medium transition-all text-gray-700">
                    <Twitter size={16} /> Share
                  </a>
                  <button onClick={onClose}
                    className="flex-1 bg-gray-900 text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-gray-800 transition-all">
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">😊</div>
                <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
                <p className="text-gray-400 mb-1">Score: {result.score}/5</p>
                <p className="text-gray-400 text-sm mb-6">Give us a bigger, genuine smile and try again!</p>
                <button onClick={onClose}
                  className="w-full bg-gray-900 text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-gray-800 transition-all">
                  Try Again 😊
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Main App ── */
const App = () => {
  const { login, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [processedImages] = useState(new Set<string>());
  const [nounsFilterEnabled, setNounsFilterEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [payoutResult, setPayoutResult] = useState<{ score: number, isWinner: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState('smile');

  useGSAP(() => {
    gsap.fromTo('.animate-fade-up', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
  }, [activeTab]);

  useEffect(() => {
    let stream: MediaStream | undefined;
    if (activeTab === 'smile') {
      initCamera(videoRef).then(s => { stream = s; });
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [activeTab]);

  useEffect(() => {
    loadExistingPhotos().then(setImages);

    const initContract = async () => {
      if (!authenticated || wallets.length === 0) return;
      try {
        const wallet = wallets[0];
        const provider = await wallet.getEthersProvider();
        if (!provider) throw new Error('No provider');

        const network = await provider.getNetwork();
        if (network.chainId !== BASE_CHAIN_ID) {
          try {
            await wallet.switchChain(BASE_CHAIN_ID);
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await provider.send('wallet_addEthereumChain', [{
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`, chainName: BASE_CONFIG.name,
                nativeCurrency: BASE_CONFIG.nativeCurrency,
                rpcUrls: [BASE_CONFIG.rpcUrls.default, BASE_CONFIG.rpcUrls.public],
                blockExplorerUrls: [BASE_CONFIG.blockExplorers.default.url],
              }]);
              await wallet.switchChain(BASE_CHAIN_ID);
            } else throw switchError;
          }
        }

        const updatedProvider = await wallet.getEthersProvider();
        if ((await updatedProvider.getNetwork()).chainId !== BASE_CHAIN_ID) throw new Error('Wrong network');

        const signer = updatedProvider.getSigner();
        const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        await c.getOracleFee();
        setContract(c);

        c.on("SmileAnalysisReceived", async (_reqId: string, photoUrl: string, smileScore: number) => {
          if (processedImages.has(photoUrl)) return;
          processedImages.add(photoUrl);
          const hasWon = smileScore > 3;

          const { data: existing } = await supabase.from('photos').select('id').eq('image_url', photoUrl).maybeSingle();
          if (!existing) {
            await supabase.from('photos').insert({
              user_id: user!.id,
              image_url: photoUrl,
              smile_score: smileScore,
              is_nounish: localStorage.getItem('nounsFilterEnabled') === 'true',
              smile_count: 0
            });
          }

          setImages(prev => prev.map(img =>
            img.url === photoUrl ? { ...img, isLoading: false, smileScore, hasWon, isNounish: nounsFilterEnabled } : img
          ));
          
          setIsScanning(false);
          setLoading(false);
          setPayoutResult({ score: smileScore, isWinner: hasWon });
        });
      } catch (error) {
        console.error('Contract init error:', error);
      }
    };

    initContract();
    return () => { if (contract) contract.removeAllListeners("SmileAnalysisReceived"); };
  }, [authenticated, wallets]);

  useEffect(() => {
    if (nounsFilterEnabled && videoRef.current) {
      const video = videoRef.current;
      const overlay = document.createElement('div');
      overlay.id = 'nouns-overlay';
      overlay.innerHTML = NOUNS_SVG;
      overlay.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:10;width:75%;height:75%;`;
      const svg = overlay.querySelector('svg');
      if (svg) svg.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:auto;`;
      video.parentElement?.appendChild(overlay);
      return () => { document.getElementById('nouns-overlay')?.remove(); };
    }
  }, [nounsFilterEnabled]);

  const capturePhoto = async () => {
    if (isScanning || loading) return;
    setLoading(true);
    setIsScanning(true);

    const step = async (msg: string, ms: number) => { setUploadStatus(msg); await new Promise(r => setTimeout(r, ms)); };
    await step('Looking good! 😊', 600);
    await step('Analyzing your smile...', 700);
    await step('That\'s a great smile! ✨', 400);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) { setIsScanning(false); setLoading(false); return; }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      await step('Uploading...', 300);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed')), 'image/jpeg', 0.8);
      });
      const compressed = await compressImage(blob);
      const result = await uploadImage(compressed, user!.id, nounsFilterEnabled);

      if (!contract) throw new Error('Not connected');
      const provider = await wallets[0].getEthersProvider();
      if ((await provider.getNetwork()).chainId !== BASE_CHAIN_ID) throw new Error('Wrong network');

      const oracleFee = await contract.getOracleFee();
      setImages(prev => [{
        url: result.url, timestamp: new Date().toISOString(),
        isLoading: true, smileCount: 0, smileScore: undefined, hasWon: false, isNounish: nounsFilterEnabled
      }, ...prev]);

      await step('Signing transaction...', 300);
      const tx = await contract.analyzeSmile(result.url, { value: oracleFee, gasLimit: 500000 });
      setUploadStatus('Confirming on-chain...');
      await tx.wait(1);
      setUploadStatus('Awaiting AI verdict... 🤖');
    } catch (error: any) {
      console.error('Error:', error);
      setIsScanning(false);
      setLoading(false);
      setUploadStatus('');
    }
  };

  const handleSmileBackLocal = async (url: string) => {
    try {
      await handleSmileBack(url);
      setImages(prev => prev.map(img => img.url === url ? { ...img, smileCount: img.smileCount + 1 } : img));
    } catch (e) { console.error(e); }
  };

  const handleDeleteLocal = async (url: string, uid: string) => {
    try {
      await deletePhoto(url, uid);
      setImages(prev => prev.filter(img => img.url !== url));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      <ResultOverlay result={payoutResult} onClose={() => { setPayoutResult(null); setUploadStatus(''); }} />
      <Navbar authenticated={authenticated} login={login} logout={logout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-24 md:pt-28 pb-20 px-4">

        {/* ── SMILE TAB ── */}
        {activeTab === 'smile' && (
          <>
            <div className="max-w-5xl mx-auto px-4">
              {/* Hero */}
            <div className="text-center mb-10 animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-amber-100">
                <Sparkles size={12} /> Powered by AI on Base
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1] mb-4">
                Get paid for<br />your smile 😊
              </h1>
              <p className="text-lg text-gray-400 max-w-sm mx-auto leading-relaxed">
                Turn real human joy into on-chain value. Smile, earn USDC.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {[
                { label: 'Joy Pool', value: '$42K', icon: Heart, bg: 'bg-rose-50', color: 'text-rose-400' },
                { label: 'Per Smile', value: '$0.001', icon: TrendingUp, bg: 'bg-amber-50', color: 'text-amber-500' },
                { label: 'Streak', value: '4 🔥', icon: Flame, bg: 'bg-orange-50', color: 'text-orange-400' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl p-4 text-center border border-white`}>
                  <div className="text-xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Scanner and Leaderboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              
              {/* Scanner */}
              <div className="w-full flex flex-col gap-4 h-full">
                <div className={`rounded-[40px] overflow-hidden p-1.5 transition-all duration-700 flex-1 flex flex-col bg-white shadow-2xl w-full ${
                  isScanning
                    ? 'shadow-amber-200/50 border border-amber-200 bg-gradient-to-br from-amber-200 via-orange-300 to-rose-300'
                    : 'shadow-gray-200/50 border border-gray-100'
                }`}>
                  <div className="relative rounded-[32px] overflow-hidden bg-gray-900 flex-1 w-full min-h-[360px]">
                    <video
                      ref={videoRef}
                      autoPlay playsInline
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                        isScanning ? 'brightness-90 scale-[1.01]' : ''
                      }`}
                    />

                    <AnimatePresence>
                      {isScanning && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-end pb-6 z-10">
                          
                          {/* Gentle scan line */}
                          <motion.div
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                            className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent"
                            style={{ boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}
                          />
                          
                          {/* Corner frames */}
                          <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-amber-300/60 rounded-tl-lg" />
                          <div className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-amber-300/60 rounded-tr-lg" />
                          <div className="absolute bottom-14 left-5 w-10 h-10 border-b-2 border-l-2 border-amber-300/60 rounded-bl-lg" />
                          <div className="absolute bottom-14 right-5 w-10 h-10 border-b-2 border-r-2 border-amber-300/60 rounded-br-lg" />

                          {/* Status pill */}
                          <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-2 shadow-lg z-10">
                            <p className="text-gray-800 text-sm font-medium flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              {uploadStatus || 'Analyzing...'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Nouns toggle */}
                    <button
                      onClick={() => {
                        const val = !nounsFilterEnabled;
                        setNounsFilterEnabled(val);
                        localStorage.setItem('nounsFilterEnabled', String(val));
                      }}
                      className={`absolute top-4 right-4 text-xs font-semibold rounded-full px-4 py-2 transition-all z-20 ${
                        nounsFilterEnabled
                          ? 'bg-amber-400 text-white shadow-md'
                          : 'bg-black/40 backdrop-blur-sm text-white/80 hover:bg-black/60'
                      }`}>
                      ⌐◨-◨ {nounsFilterEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />

                {/* CTA */}
                <div className="shrink-0 w-full">
                  {authenticated ? (
                    <button
                      onClick={capturePhoto}
                      disabled={isScanning || loading}
                      className="w-full py-5 rounded-[24px] font-semibold text-[17px] transition-all disabled:opacity-40
                        bg-gradient-to-r from-amber-400 to-orange-400 text-white
                        hover:shadow-xl hover:shadow-amber-200/40 hover:scale-[1.01]
                        active:scale-[0.99] shadow-lg shadow-amber-200/30"
                    >
                      {isScanning ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analyzing...
                        </span>
                      ) : (
                        '😊 Smile & Earn'
                      )}
                    </button>
                  ) : (
                    <button onClick={login}
                      className="w-full py-5 rounded-[24px] font-semibold text-[17px] bg-gray-900 text-white
                        hover:bg-gray-800 hover:shadow-xl transition-all active:scale-[0.99]">
                      Connect Wallet to Start
                    </button>
                  )}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="w-full h-full">
                <SmileLeaderboard />
              </div>

            </div>
          </div>

          <SmileMap />

            {/* Recent Smiles Preview */}
            {images.length > 0 && (
              <div className="max-w-4xl mx-auto mt-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Smiles</h2>
                  <button onClick={() => setActiveTab('gallery')}
                    className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
                <ImageGrid
                  images={images.slice(0, 6)}
                  authenticated={authenticated}
                  userId={user?.id}
                  onSmileBack={handleSmileBackLocal}
                  onDelete={handleDeleteLocal}
                  shimmerStyle="animate-shimmer rounded-2xl"
                />
              </div>
            )}
          </>
        )}

        {/* ── FUND TAB ── */}
        {activeTab === 'fund' && (
          <div className="max-w-lg mx-auto animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Joy Pool 💛</h1>
              <p className="text-gray-400">Help fund more smiles around the world</p>
            </div>
            <GoFundSmiles wallet={authenticated ? wallets[0] : null} />
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {activeTab === 'gallery' && (
          <div className="max-w-4xl mx-auto animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Smile Gallery 😊</h1>
              <p className="text-gray-400">All the joy captured on-chain</p>
            </div>
            <ImageGrid
              images={images}
              authenticated={authenticated}
              userId={user?.id}
              onSmileBack={handleSmileBackLocal}
              onDelete={handleDeleteLocal}
              shimmerStyle="animate-shimmer rounded-2xl"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
