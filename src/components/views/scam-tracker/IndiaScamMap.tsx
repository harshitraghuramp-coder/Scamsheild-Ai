import React, { useState } from 'react';
import { RegionalThreatData } from '../../../types';
import { MapPin, Phone, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface IndiaScamMapProps {
  regions: RegionalThreatData[];
  selectedRegion: string;
  onSelectRegion: (regionCode: string) => void;
}

// Geometric coordinates and SVG shapes representing Indian states/zones
interface StateShapeConfig {
  code: string;
  name: string;
  d: string;
  labelX: number;
  labelY: number;
}

const STATE_SHAPES: StateShapeConfig[] = [
  // Jammu & Kashmir / Ladakh (Northern Zone)
  {
    code: 'NORTH',
    name: 'Northern Territory',
    d: 'M180,30 L220,15 L260,25 L270,70 L240,110 L190,100 L160,70 Z',
    labelX: 215,
    labelY: 60,
  },
  // Punjab / Haryana / Himachal
  {
    code: 'PUN_HAR',
    name: 'Punjab / Haryana',
    d: 'M160,70 L190,100 L220,105 L210,145 L160,135 L140,100 Z',
    labelX: 180,
    labelY: 115,
  },
  // Delhi NCR
  {
    code: 'DL',
    name: 'Delhi NCR',
    d: 'M205,142 L225,140 L230,160 L210,162 Z',
    labelX: 218,
    labelY: 152,
  },
  // Rajasthan
  {
    code: 'RJ',
    name: 'Rajasthan',
    d: 'M130,130 L180,135 L205,165 L180,225 L120,210 L100,160 Z',
    labelX: 145,
    labelY: 175,
  },
  // Uttar Pradesh
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    d: 'M215,140 L280,145 L320,175 L310,220 L240,215 L215,175 Z',
    labelX: 265,
    labelY: 180,
  },
  // Gujarat
  {
    code: 'GJ',
    name: 'Gujarat',
    d: 'M70,210 L120,210 L140,250 L110,290 L60,270 L50,230 Z',
    labelX: 95,
    labelY: 250,
  },
  // Madhya Pradesh (Central)
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    d: 'M160,215 L240,215 L275,255 L245,295 L165,280 L145,245 Z',
    labelX: 205,
    labelY: 255,
  },
  // Bihar & Jharkhand
  {
    code: 'BIH_JHK',
    name: 'Bihar & Jharkhand',
    d: 'M320,180 L370,185 L385,240 L340,265 L310,225 Z',
    labelX: 350,
    labelY: 220,
  },
  // West Bengal
  {
    code: 'WB',
    name: 'West Bengal',
    d: 'M370,200 L400,205 L395,290 L365,290 L375,245 Z',
    labelX: 382,
    labelY: 250,
  },
  // North-East States
  {
    code: 'NE',
    name: 'North East',
    d: 'M405,180 L460,170 L480,215 L435,240 L410,210 Z',
    labelX: 445,
    labelY: 205,
  },
  // Maharashtra
  {
    code: 'MH',
    name: 'Maharashtra',
    d: 'M120,285 L180,280 L235,305 L225,370 L145,375 L125,325 Z',
    labelX: 175,
    labelY: 330,
  },
  // Odisha & Chhattisgarh
  {
    code: 'ODI_CHH',
    name: 'Odisha / Chhattisgarh',
    d: 'M250,265 L335,260 L360,330 L300,355 L255,310 Z',
    labelX: 305,
    labelY: 305,
  },
  // Telangana
  {
    code: 'TS',
    name: 'Telangana',
    d: 'M200,360 L245,350 L260,395 L215,410 L195,380 Z',
    labelX: 228,
    labelY: 380,
  },
  // Andhra Pradesh
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    d: 'M245,355 L290,345 L280,440 L230,445 L255,395 Z',
    labelX: 265,
    labelY: 410,
  },
  // Karnataka
  {
    code: 'KA',
    name: 'Karnataka',
    d: 'M150,380 L200,375 L220,445 L180,490 L145,435 Z',
    labelX: 180,
    labelY: 435,
  },
  // Kerala
  {
    code: 'KL',
    name: 'Kerala',
    d: 'M165,490 L185,490 L195,555 L175,550 Z',
    labelX: 180,
    labelY: 520,
  },
  // Tamil Nadu
  {
    code: 'TN',
    name: 'Tamil Nadu',
    d: 'M195,455 L250,450 L235,555 L190,555 Z',
    labelX: 215,
    labelY: 505,
  },
];

export const IndiaScamMap: React.FC<IndiaScamMapProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const regionMap = new Map<string, RegionalThreatData>();
  for (const r of regions) {
    regionMap.set(r.regionCode, r);
  }

  const activeRegionData = regionMap.get(selectedRegion) || regionMap.get('ALL') || regions[0];

  const getFillColor = (code: string) => {
    const isSelected = selectedRegion === code;
    const isHovered = hoveredCode === code;
    const data = regionMap.get(code);

    if (isSelected) {
      return '#06B6D4'; // cyan-500
    }
    if (isHovered) {
      return '#38BDF8'; // sky-400
    }
    if (!data || data.reportCount === 0) {
      return '#1E293B'; // slate-800
    }
    if (data.riskLevel === 'CRITICAL') {
      return '#E11D48'; // rose-600
    }
    if (data.riskLevel === 'HIGH') {
      return '#EA580C'; // orange-600
    }
    return '#0284C7'; // sky-600
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0B132B]/60 backdrop-blur-md p-5 sm:p-7 space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Geographic Scam Intelligence — India State Threat Map
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified state cyber police and I4C advisory incidents. Select a jurisdiction to inspect regional threat vectors.
          </p>
        </div>

        {/* Pan-India View Toggle */}
        <button
          onClick={() => onSelectRegion('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
            selectedRegion === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
              : 'text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700'
          }`}
        >
          <span>Pan-India Overview</span>
        </button>
      </div>

      {/* Main Grid: SVG Map on Left, Detail Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Interactive Vector Map */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#070B14]/70 border border-slate-800/90 relative">
          <svg
            viewBox="0 0 520 580"
            className="w-full max-w-[440px] h-auto select-none transition-all drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          >
            {/* Soft background grid lines */}
            <defs>
              <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="520" height="580" fill="url(#mapGrid)" rx="16" opacity="0.4" />

            {/* State Path Renders */}
            {STATE_SHAPES.map((state) => {
              const data = regionMap.get(state.code);
              const isSelected = selectedRegion === state.code;
              const isHovered = hoveredCode === state.code;

              return (
                <g key={state.code}>
                  <path
                    d={state.d}
                    fill={getFillColor(state.code)}
                    stroke="#070B14"
                    strokeWidth={isSelected || isHovered ? 2.5 : 1.2}
                    className="transition-all duration-200 cursor-pointer hover:opacity-95"
                    onClick={() => {
                      if (data) {
                        onSelectRegion(state.code);
                      }
                    }}
                    onMouseEnter={() => setHoveredCode(state.code)}
                    onMouseLeave={() => setHoveredCode(null)}
                  />
                  {/* State Abbreviation Marker */}
                  <text
                    x={state.labelX}
                    y={state.labelY}
                    fill={isSelected ? '#FFFFFF' : '#E2E8F0'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                    className="drop-shadow-sm select-none"
                  >
                    {state.code.slice(0, 3)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Color Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-600 inline-block"></span>
              <span>Critical Threat (&gt;300 Reports)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-600 inline-block"></span>
              <span>High Risk (&gt;150 Reports)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-600 inline-block"></span>
              <span>Active Reports</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-400 inline-block ring-2 ring-cyan-300"></span>
              <span>Selected Region</span>
            </div>
          </div>
        </div>

        {/* Right: Regional Threat Inspector Dossier */}
        <div className="lg:col-span-5 space-y-4">
          {activeRegionData ? (
            <div className="p-5 rounded-2xl bg-[#090F1E] border border-cyan-500/30 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase font-bold text-cyan-400">
                      Region Threat Dossier
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {activeRegionData.regionCode}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white mt-1">
                    {activeRegionData.regionName}
                  </h4>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                      activeRegionData.riskLevel === 'CRITICAL'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : activeRegionData.riskLevel === 'HIGH'
                        ? 'bg-orange-950/80 text-orange-300 border-orange-800'
                        : 'bg-sky-950/80 text-sky-300 border-sky-800'
                    }`}
                  >
                    {activeRegionData.riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070B14] border border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Correlated Reports
                  </span>
                  <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                    {activeRegionData.reportCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070B14] border border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Active Campaigns
                  </span>
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {activeRegionData.activeCampaigns}
                  </span>
                </div>
              </div>

              {/* Top Attack Vector */}
              <div className="p-3.5 rounded-xl bg-[#070B14]/80 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dominant Scam Vector in Jurisdiction</span>
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  {activeRegionData.topCategory}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeRegionData.statusSummary}
                </p>
              </div>

              {/* Official Source & Helpline */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-400">Data Source:</span>
                  <span className="font-medium text-slate-200">{activeRegionData.officialAdvisorySource}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-slate-400">Regional Cyber Helpline:</span>
                  <a
                    href={`tel:${activeRegionData.cyberHelpline.split('/')[0].trim()}`}
                    className="font-mono font-bold text-rose-300 hover:underline"
                  >
                    {activeRegionData.cyberHelpline}
                  </a>
                </div>
              </div>

              {/* Filter Action Button */}
              <div className="pt-1">
                <button
                  onClick={() => onSelectRegion(activeRegionData.regionCode)}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Filter Live Feed to {activeRegionData.regionName}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#090F1E] border border-slate-800 text-center text-slate-400">
              Select a state on the map to inspect regional data.
            </div>
          )}

          {/* Quick State Pills Selector for Accessible Navigation */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
              Quick State Jump
            </span>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((reg) => (
                <button
                  key={reg.regionCode}
                  onClick={() => onSelectRegion(reg.regionCode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                    selectedRegion === reg.regionCode
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {reg.regionName} ({reg.reportCount})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance / Privacy Non-Inference Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Geographic Accuracy & Privacy Guarantee:</strong> Regional scam figures are aggregated strictly from verified state cybercrime division releases, official FIR filings, and I4C coordinating advisories. ScamShield AI <span className="text-cyan-300 font-semibold">never infers victim locations from IP addresses</span> or browser telemetry without substantiated proof.
        </p>
      </div>
    </div>
  );
};
