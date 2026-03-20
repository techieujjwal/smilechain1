"use client";

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Trophy, Sparkles, Navigation, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export const SmileLeaderboard = () => {
  const leaderboard = [
    { wallet: "0xA12...9F", score: 98, highlight: true },
    { wallet: "0xB45...2K", score: 92, highlight: true },
    { wallet: "0x7F2...8E", score: 85, highlight: true },
    { wallet: "0xC99...1A", score: 74 },
    { wallet: "0x1D4...3C", score: 68 },
    { wallet: "0x5E6...7B", score: 61 },
  ];

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-amber-100/40 border border-amber-50 h-full flex flex-col justify-between min-h-[500px]">
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-amber-100 to-orange-100 text-amber-500 flex items-center justify-center shadow-inner shrink-0">
          <Trophy size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Top Smilers</h3>
          <p className="text-sm text-gray-400 font-medium mt-0.5">All-time joy generated</p>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
        {leaderboard.map((user, idx) => (
          <div key={idx} className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] cursor-default ${
            user.highlight 
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100/50 shadow-sm' 
              : 'bg-gray-50/50 border-transparent hover:bg-white hover:shadow-md hover:border-gray-100'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black tracking-tighter ${
                user.highlight ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-gray-200 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <span className={`font-bold tracking-tight ${user.highlight ? 'text-gray-900 text-[15px]' : 'text-gray-600 text-sm'}`}>
                {user.wallet}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Heart size={14} className={user.highlight ? "fill-rose-400 text-rose-400" : "fill-gray-300 text-gray-300"} />
              <span className="text-sm font-black text-gray-700">{user.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SmileMap = () => {
  const [location, setLocation] = React.useState<{lat: number, lng: number} | null>(null);
  const [errorStatus, setErrorStatus] = React.useState('');
  const [isLocating, setIsLocating] = React.useState(false);

  useGSAP(() => {
    gsap.to('.my-location-pulse', {
      scale: 2.2,
      opacity: 0,
      duration: 1.5,
      repeat: -1,
      ease: "power2.out"
    });

    gsap.to('.map-float', {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  const requestLocation = () => {
    setIsLocating(true);
    setErrorStatus('');
    
    // Fallback coordinates for KCC Institute / Greater Noida if live location fails or hangs
    const fallbackLocation = { lat: 28.4682, lng: 77.4933 };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          setErrorStatus('');
        },
        (error) => {
          console.warn("Location error:", error.message);
          // If denied or failed, use the fallback KCC Institute location so the map STILL loads
          setLocation(fallbackLocation);
          setIsLocating(false);
          setErrorStatus('Using default Greater Noida location (Live tracking unavailable).');
        },
        // Maximum 5-second wait. Important for Windows desktops which often hang silently on GPS requests.
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
      );
    } else {
      setLocation(fallbackLocation);
      setIsLocating(false);
      setErrorStatus('Geolocation not supported. Showing default location.');
    }
  };

  return (
    <div className="w-full my-16 bg-[#FFFAF5] border-y border-amber-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold tracking-widest text-amber-500 uppercase flex items-center gap-2 justify-center bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-amber-100 inline-flex">
            <Sparkles size={16} /> Live Smile Network
          </h2>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-4">Global Activity</h3>
          <p className="text-gray-500 mt-2">See smiles currently happening around you</p>
        </div>

        <div className="w-full h-[500px] relative bg-white rounded-[40px] p-6 shadow-2xl shadow-orange-100/40 border border-orange-50 overflow-hidden group">
          <div className="absolute inset-5 rounded-[28px] overflow-hidden shadow-inner flex flex-col items-center justify-center bg-gray-50 border border-gray-100 relative">
             
            {location ? (
              <>
                {/* OpenStreetMap implementation */}
                <div className="absolute inset-0 z-0 flex rounded-[28px] overflow-hidden" style={{ filter: 'grayscale(0.3) contrast(1.1) opacity(0.8)' }}>
                  <MapView location={location} />
                </div>

                {/* Subtile Watermark overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none px-4 text-center mix-blend-multiply">
                  <h1 className="text-7xl md:text-9xl font-black tracking-tighter rotate-[10deg] text-blue-900 leading-none">LIVE NETWORK</h1>
                </div>

                {/* Simulated GSAP Marker placed at exact dead-center of the iframe */}
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-[120%] z-20 map-float pointer-events-none">
                   <div className="relative flex flex-col items-center">
                     <div className="bg-white px-5 py-3 rounded-[24px] shadow-xl shadow-rose-200 border-2 border-rose-100 mb-3 relative max-w-[200px] md:max-w-xs text-center pointer-events-auto cursor-pointer">
                       <p className="text-[10px] font-black text-rose-500 tracking-wider uppercase mb-1 flex items-center justify-center gap-1"><Navigation size={12} /> You are here</p>
                       <p className="text-[15px] font-bold text-gray-800 leading-tight">Live Location Active</p>
                       <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rotate-45 border-r-2 border-b-2 border-rose-100" />
                     </div>
                     <div className="relative pointer-events-auto">
                       <div className="w-10 h-10 rounded-full bg-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 my-location-pulse" />
                       <div className="w-6 h-6 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 relative z-10 flex items-center justify-center border-2 border-white">
                         <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                       </div>
                     </div>
                   </div>
                </div>
                
                {/* Floating error toast if location fallback triggered */}
                {errorStatus && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100/90 text-amber-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-md z-30">
                    {errorStatus}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 z-10 max-w-md mx-auto relative animate-fade-up">
                 <div className="absolute inset-0 bg-blue-50/50 blur-3xl -z-10 rounded-full w-full h-full" />
                 
                 <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-amber-200/40 border-2 border-white">
                   <MapPin size={36} className="drop-shadow-sm" />
                 </div>
                 
                 <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Connect Live Map</h3>
                 <p className="text-gray-500 text-[15px] mb-8 leading-relaxed px-4">
                   Allow location access to sync your smiles to the global map in real-time.
                 </p>
                 
                 <button 
                   onClick={requestLocation}
                   disabled={isLocating}
                   className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-semibold py-4 px-8 rounded-full shadow-xl shadow-gray-300 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-3 text-lg"
                 >
                   {isLocating ? (
                     <>
                       <span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></span>
                       Locating Satellite...
                     </>
                   ) : "Allow Location Access"}
                 </button>
                 
                 {errorStatus && (
                   <div className="mt-5 w-full bg-rose-50 border border-rose-100 px-5 py-3 rounded-2xl animate-fade-up">
                     <p className="text-rose-600 text-[13px] font-semibold">{errorStatus}</p>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
