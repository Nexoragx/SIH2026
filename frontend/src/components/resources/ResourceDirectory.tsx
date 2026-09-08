import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldCheck, Heart, Ambulance, Scale, Building2, Search, ExternalLink } from 'lucide-react';
import { supportApi, SupportResource } from '../../api';

export const ResourceDirectory: React.FC = () => {
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    supportApi.getResources()
      .then((data) => {
        setResources(data);
      })
      .catch(() => {
        // Fallback baseline
        setResources([
          {
            id: 'res-1',
            category: 'mental_health',
            name: 'Tele-MANAS (Government of India)',
            number: '14416',
            alt_number: '1800-891-4416',
            availability: '24x7 • Toll-Free',
            languages: '20+ Regional Languages',
            description: 'Comprehensive psychological counselling and psychiatric crisis tele-support run by the Ministry of Health.',
            region: 'National',
            verified: true,
          },
          {
            id: 'res-2',
            category: 'victim_support',
            name: 'National Helpline Against Atrocities (NHAA)',
            number: '14566',
            alt_number: '1800-202-1989',
            availability: '24x7 • Toll-Free',
            languages: 'Hindi, English & Scheduled Languages',
            description: 'Statutory support under SC/ST (PoA) Act for atrocity victims, legal protection, FIR filing, and compensation tracking.',
            region: 'National • MoSJE',
            verified: true,
          },
          {
            id: 'res-3',
            category: 'mental_health',
            name: 'KIRAN Mental Health Helpline',
            number: '1800-599-0019',
            alt_number: null,
            availability: '24x7 • Toll-Free',
            languages: '13 Regional Languages',
            description: 'Early screening, first-aid, psychological support, distress management, and mental wellbeing referrals.',
            region: 'National • DEPwD',
            verified: true,
          },
          {
            id: 'res-4',
            category: 'emergency',
            name: 'National Emergency Ambulance Network',
            number: '108',
            alt_number: '112',
            availability: '24x7 • Immediate Response',
            languages: 'All States',
            description: 'Critical emergency medical transport and immediate crisis intervention dispatch.',
            region: 'All States & UTs',
            verified: true,
          },
          {
            id: 'res-5',
            category: 'victim_support',
            name: 'NALSA Free Legal Services Helpline',
            number: '15100',
            alt_number: null,
            availability: 'Working Hours & Callback',
            languages: 'English, Hindi & State Benches',
            description: 'Free legal aid, advocate appointment, and court representation for marginalized communities and atrocity victims.',
            region: 'National Legal Services Authority',
            verified: true,
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredResources = resources.filter((r) => {
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.number.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              ANVAYA Safeguards
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Government & Institutional Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Help & Support Resources
          </h1>
          <p className="text-sm font-medium text-slate-700 mt-1">
            Verified, toll-free crisis response networks and statutory legal aid across India.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources or numbers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'mental_health', label: 'Mental Health Support' },
          { id: 'victim_support', label: 'Victim & Legal Support' },
          { id: 'emergency', label: 'Emergency Services' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-black text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-black hover:border-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Resource Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-bold text-slate-500">
          Loading verified resources...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
          Nothing here yet matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredResources.map((res) => {
            const isEmergency = res.category === 'emergency';
            return (
              <div
                key={res.id}
                className={`anvaya-card p-6 bg-white border rounded-2xl shadow-xs flex flex-col justify-between space-y-4 ${
                  isEmergency ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isEmergency
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : res.category === 'mental_health'
                          ? 'bg-slate-100 text-black border-slate-300'
                          : 'bg-slate-100 text-black border-slate-300'
                      }`}
                    >
                      {res.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {res.availability}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-black leading-snug">
                    {res.name}
                  </h3>

                  <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="text-[11px] text-slate-500 font-semibold mt-3">
                    Languages: {res.languages} • Region: {res.region}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-base font-black text-black tracking-tight">
                    {res.number}
                    {res.alt_number && (
                      <span className="text-xs text-slate-500 font-medium ml-2">
                        / {res.alt_number}
                      </span>
                    )}
                  </div>

                  <a
                    href={`tel:${res.number}`}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isEmergency
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-black hover:bg-slate-800 text-white'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{isEmergency ? 'Get Help' : 'Call Now'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourceDirectory;
