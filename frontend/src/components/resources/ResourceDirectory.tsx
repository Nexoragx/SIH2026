import React, { useState } from 'react';
import { Users, PhoneCall, Heart, MapPin, ShieldCheck, Search, Filter, Hospital, Building2 } from 'lucide-react';
import { MOCK_NGOS, MOCK_PSYCHIATRISTS } from '../../data/mockData';

export const ResourceDirectory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ngos' | 'psychiatrists' | 'helplines'>('ngos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredNgos = MOCK_NGOS.filter(
    (n) =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPsychiatrists = MOCK_PSYCHIATRISTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-fadeInScale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              ANVAYA Care Network & District Directory
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Empanelled Grassroots NGOs, Tele-MANAS Psychiatrists, Legal Desks & 108 Ambulance Units
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search district, provider or service..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/90 text-xs font-semibold bg-white/80 outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Glass Pills Tabs */}
      <div className="flex border-b border-white/80 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('ngos')}
          className={`pb-3 px-5 text-xs font-extrabold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'ngos'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Empanelled NGOs ({filteredNgos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('psychiatrists')}
          className={`pb-3 px-5 text-xs font-extrabold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'psychiatrists'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hospital className="w-4 h-4" />
          <span>Clinical Psychiatrists ({filteredPsychiatrists.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('helplines')}
          className={`pb-3 px-5 text-xs font-extrabold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'helplines'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>National Emergency Helplines</span>
        </button>
      </div>

      {/* TAB 1: NGOs */}
      {activeTab === 'ngos' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNgos.map((ngo) => (
            <div
              key={ngo.id}
              className="glass-tile p-6 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
                    {ngo.type}
                  </span>
                  {ngo.verified && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> MoSJE Verified
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  {ngo.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  {ngo.district}, {ngo.state}
                </p>

                <div className="bg-white/70 p-3 rounded-2xl border border-white/90 text-xs text-slate-600 space-y-1 font-medium">
                  <div>Coordinator: <span className="font-bold text-slate-900">{ngo.contactPerson}</span></div>
                  <div>Active Caseload: <span className="font-mono font-bold text-indigo-700">{ngo.activeCasesCount} active cases</span></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/70 mt-5">
                <a
                  href={`tel:${ngo.phone}`}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {ngo.phone}
                </a>
                <button
                  type="button"
                  onClick={() => alert(`Case referral request dispatched to ${ngo.name}`)}
                  className="px-4 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white rounded-xl text-xs font-extrabold transition shadow-xs"
                >
                  Refer Case
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Psychiatrists */}
      {activeTab === 'psychiatrists' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPsychiatrists.map((psy) => (
            <div
              key={psy.id}
              className="glass-tile p-6 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/60">
                    MCI: {psy.mciNumber}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ● Telehealth Ready
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-0.5">
                  {psy.name}
                </h3>
                <p className="text-xs text-indigo-600 font-bold mb-1">
                  {psy.qualification}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3 font-medium">
                  <Hospital className="w-3.5 h-3.5 text-slate-400" />
                  {psy.hospital} ({psy.district})
                </p>

                <div className="bg-emerald-50/90 p-3 rounded-2xl border border-emerald-200/60 text-xs text-emerald-950 font-bold">
                  {psy.availableSlot}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/70 mt-5">
                <a
                  href={`tel:${psy.phone}`}
                  className="text-xs font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {psy.phone}
                </a>
                <button
                  type="button"
                  onClick={() => alert(`Telepsychiatry consultation reserved with ${psy.name}`)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs"
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Helplines */}
      {activeTab === 'helplines' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              name: 'National SC/ST Atrocity Helpline (NHAA)',
              number: '14566',
              desc: 'Toll-free 24x7 helpline under Ministry of Social Justice & Empowerment for legal assistance and grievance redressal.',
              type: 'MoSJE Official',
              callAction: '14566',
            },
            {
              name: 'iCall Psychosocial Support',
              number: '9152987821',
              desc: 'Tata Institute of Social Sciences (TISS) trauma counselling, depression support, and psychological crisis aid.',
              type: 'Psychological Trauma',
              callAction: '9152987821',
            },
            {
              name: 'Tele-MANAS National Mental Health',
              number: '14416',
              desc: 'Government of India comprehensive mental healthcare and 24x7 multi-language psychiatric counselling.',
              type: 'Ministry of Health',
              callAction: '14416',
            },
            {
              name: 'National Emergency Ambulance Service',
              number: '108',
              desc: 'Immediate emergency medical response and paramedic evacuation.',
              type: 'Emergency Medical',
              callAction: '108',
            },
            {
              name: 'Women in Distress Helpline',
              number: '181',
              desc: 'Dedicated 24x7 helpline for women facing harassment, violence, or seeking safe shelter.',
              type: 'Women Safety',
              callAction: '181',
            },
            {
              name: 'Police Emergency Response Support',
              number: '112 / 100',
              desc: 'Unified emergency response system for immediate physical threat or danger.',
              type: 'Law Enforcement',
              callAction: '112',
            },
          ].map((h, i) => (
            <div
              key={i}
              className="glass-tile p-6 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                  {h.type}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-2 mb-1">
                  {h.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                  {h.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/70 flex items-center justify-between">
                <span className="text-lg font-mono font-black text-indigo-700">
                  {h.number}
                </span>
                <a
                  href={`tel:${h.callAction}`}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
