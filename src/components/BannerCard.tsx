import React from 'react';
import { EventProfile } from '../types';

interface BannerCardProps {
  onActionClick?: () => void;
  eventProfile?: EventProfile;
}

export const BannerCard: React.FC<BannerCardProps> = ({ eventProfile }) => {
  const district = eventProfile?.districtName || 'Pekutatan';

  return (
    <div 
      id="welcome-hero-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#133E2B] via-[#1a533a] to-[#154632] text-white px-5 py-3.5 sm:py-4 shadow-2xs border border-emerald-900/30"
    >
      {/* Decorative Balinese / Modern Geometric Waves */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-300 blur-3xl" />
        <div className="absolute right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-200 blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-amber-300 blur-xl opacity-30" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="max-w-3xl">
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-white leading-tight">
            Selamat Datang di Sistem FTBI Jenjang Sekolah Dasar {district.toLowerCase().startsWith('gugus') || district.toLowerCase().startsWith('kecamatan') || district.toLowerCase().startsWith('kec.') ? district : `Wilayah ${district}`}
          </h2>
        </div>
      </div>
    </div>
  );
};
