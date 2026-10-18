import React from 'react';

export const Logo = ({ className = 'h-8', textClassName = 'text-xl', isDark = true }) => {
  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-baseline tracking-tight">
        <span className={`font-black text-sky-500 uppercase tracking-tight ${textClassName}`}>
          INTERN
        </span>
        <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-tight ${textClassName}`}>
          INFOTECH
        </span>
      </div>
      {/* Brand Horizontal Underline Bar from logo */}
      <div className="w-full h-[3.5px] bg-[#004d61] rounded-full mt-[-1px]" />
    </div>
  );
};
