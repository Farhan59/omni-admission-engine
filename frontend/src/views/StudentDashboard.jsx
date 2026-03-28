import React, { useState } from 'react';
import { Search, MapPin, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const [regId, setRegId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async (e) => {
    e.preventDefault();
    if (!regId) return;
    
    setLoading(true);
    // Simulated fetch
    setTimeout(() => {
      if(regId.length > 5) {
        setStatus({
           name: "Jane Doe",
           qualified: true,
           path: "Diverse",
           eng_rank: 24,
           agri_rank: 8,
           allocatedProgram: "Computer Science (CSE) 1"
        });
      } else {
        setStatus({ error: "Registration ID not found in database." });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto mt-16 flex flex-col w-full px-4">
      <div className="mb-10">
         <h1 className="text-3xl font-semibold tracking-tight text-white mb-3">Candidate Status</h1>
         <p className="text-zinc-400 text-sm">Enter your 8-digit identification number to retrieve your admission results and allocated institution.</p>
      </div>

      <div className="glass p-8 mb-8 backdrop-blur-3xl">
         <form onSubmit={checkStatus} className="relative flex items-center">
           <Search className="w-5 h-5 text-zinc-500 absolute left-4" />
           <input 
             type="text" 
             placeholder="REG-2489001"
             className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-3 pl-12 pr-28 text-sm outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono placeholder:font-sans placeholder:text-zinc-600 text-white"
             value={regId}
             onChange={(e) => setRegId(e.target.value)}
             autoFocus
           />
           <button 
             type="submit"
             disabled={loading}
             className="absolute right-1.5 top-1.5 bottom-1.5 bg-white hover:bg-zinc-200 text-zinc-950 px-4 rounded-md text-xs font-semibold transition flex items-center gap-2 group"
           >
             {loading ? <span className="animate-pulse">Searching</span> : 
               <>Lookup <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></>
             }
           </button>
         </form>
      </div>

      {status && !status.error && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
          <div className="glass p-8 flex flex-col space-y-8 border-indigo-500/20">
            
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Applicant Profile</p>
                <h3 className="text-xl font-medium tracking-tight text-white">{status.name}</h3>
              </div>
              <div className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1.5 ${status.qualified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {status.qualified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3"/>}
                {status.qualified ? 'Qualified' : 'Disqualified'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0c0c0e] border border-white/5 rounded-lg p-4 flex flex-col justify-between h-24">
                <span className="text-xs text-zinc-500 tracking-wide">Merit Rank (ENG)</span>
                <span className="text-2xl font-mono text-zinc-100">{status.eng_rank || '--'}</span>
              </div>
              <div className="bg-[#0c0c0e] border border-white/5 rounded-lg p-4 flex flex-col justify-between h-24">
                <span className="text-xs text-zinc-500 tracking-wide">Merit Rank (AGRI)</span>
                <span className="text-2xl font-mono text-zinc-100">{status.agri_rank || '--'}</span>
              </div>
            </div>

            {status.allocatedProgram && (
              <div className="pt-6 border-t border-white/10 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <p className="text-xs text-indigo-400 tracking-wider uppercase mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Allocation Finalized
                 </p>
                 <h4 className="text-xl font-semibold text-white tracking-tight">{status.allocatedProgram}</h4>
              </div>
            )}
            
          </div>
        </div>
      )}

      {status?.error && (
        <div className="animate-in fade-in bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 text-sm text-red-400">
           <XCircle className="w-5 h-5 shrink-0" />
           <p className="mt-0.5">{status.error}</p>
        </div>
      )}
      
    </div>
  );
};

export default StudentDashboard;
