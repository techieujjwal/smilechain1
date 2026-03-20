"use client";

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Trophy, Sparkles, Navigation } from 'lucide-react';

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
  useGSAP(() => {
    gsap.to('.map-dot', {
      scale: 1.5,
      opacity: 0.1,
      duration: 2,
      repeat: -1,
      yoyo: true,
      stagger: 0.3,
      ease: "power1.inOut"
    });
    
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

  return (
    <div className="w-full my-16 bg-[#FFFAF5] border-y border-amber-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold tracking-widest text-amber-500 uppercase flex items-center gap-2 justify-center bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-amber-100 inline-flex">
            <Sparkles size={16} /> Live Smile Network
          </h2>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-4">Greater Noida Activity</h3>
        </div>

        <div className="w-full h-[500px] relative bg-white rounded-[40px] p-6 shadow-2xl shadow-orange-100/40 border border-orange-50 overflow-hidden">
          <div className="absolute inset-5 rounded-[28px] bg-gradient-to-br from-indigo-50/80 via-sky-50/50 to-blue-50/80 border border-blue-100/50 overflow-hidden shadow-inner">
             
             {/* Fake Map Grid styling */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(200,220,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(200,220,255,0.4)_1px,transparent_1px)] bg-[size:40px_40px] opacity-70" />
             
             {/* Watermark for Greater Noida */}
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none px-4 text-center">
               <h1 className="text-7xl md:text-9xl font-black tracking-tighter rotate-[10deg] text-blue-900 leading-none">GREATER NOIDA</h1>
             </div>

             {/* KCC Institute Location */}
             <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 map-float">
                <div className="relative flex flex-col items-center">
                  <div className="bg-white px-5 py-3 rounded-[24px] shadow-xl shadow-rose-200 border-2 border-rose-100 mb-3 relative max-w-[200px] md:max-w-xs text-center">
                    <p className="text-[10px] font-black text-rose-500 tracking-wider uppercase mb-1 flex items-center justify-center gap-1"><Navigation size={12} /> You are here</p>
                    <p className="text-[15px] font-bold text-gray-800 leading-tight">KCC Institute of Engineering & Technology</p>
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rotate-45 border-r-2 border-b-2 border-rose-100" />
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 my-location-pulse" />
                    <div className="w-6 h-6 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 relative z-10 flex items-center justify-center border-2 border-white">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
             </div>

             {/* Network Nodes (Other Users) */}
             <div className="absolute top-[20%] left-[25%]">
                <div className="w-6 h-6 rounded-full bg-amber-400 absolute map-dot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="w-3 h-3 rounded-full bg-amber-500 relative z-10 border-2 border-white shadow-sm" />
             </div>

             <div className="absolute top-[70%] left-[30%]">
                <div className="w-6 h-6 rounded-full bg-blue-400 absolute map-dot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="w-3 h-3 rounded-full bg-blue-500 relative z-10 border-2 border-white shadow-sm" />
             </div>

             <div className="absolute top-[30%] left-[75%]">
                <div className="w-6 h-6 rounded-full bg-emerald-400 absolute map-dot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="w-3 h-3 rounded-full bg-emerald-500 relative z-10 border-2 border-white shadow-sm" />
             </div>

             <div className="absolute top-[65%] left-[65%]">
                <div className="w-6 h-6 rounded-full bg-purple-400 absolute map-dot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="w-3 h-3 rounded-full bg-purple-500 relative z-10 border-2 border-white shadow-sm" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
