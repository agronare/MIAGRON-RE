
import React, { useState, useEffect } from 'react';
import { 
  Network, Box, ShieldCheck, FileCode, Search, Link, 
  Cpu, Activity, CheckCircle2, ArrowRight, Globe, Lock,
  FileKey, RefreshCw, ExternalLink, ChevronRight, Cuboid, Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- Types ---
interface Block {
    index: number;
    timestamp: string;
    data: string;
    hash: string;
    prevHash: string;
    validator: string;
}

// --- Utils ---
const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0'); // Simulate SHA-256 look
};

// --- Clean Data ---
const INITIAL_CHAIN: Block[] = [
    { index: 0, timestamp: new Date().toISOString(), data: "Genesis Block", hash: "0000000000000000000000000000000000000000000000000000000000000000", prevHash: "0", validator: "System" }
];

const TX_VOLUME_DATA: any[] = [];

const LedgerTab = ({ chain, onAddBlock }: { chain: Block[], onAddBlock: (data: string) => void }) => {
    const [newData, setNewData] = useState('');

    const handleAdd = () => {
        if (!newData) return;
        onAddBlock(newData);
        setNewData('');
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Registrar Nuevo Evento en Trazabilidad</h3>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                        placeholder="Ej. Cosecha Lote A-25, 500kg Maíz..."
                        value={newData}
                        onChange={(e) => setNewData(e.target.value)}
                    />
                    <button onClick={handleAdd} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg flex items-center">
                        <Plus className="w-5 h-5 mr-2" /> Minar Bloque
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {chain.slice().reverse().map((block) => (
                    <div key={block.index} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Cuboid className="w-32 h-32" /></div>
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xl text-slate-500 shrink-0">
                            #{block.index}
                        </div>
                        <div className="flex-1 z-10 space-y-2">
                             <div className="flex flex-col md:flex-row justify-between">
                                 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded w-fit">HASH: {block.hash.substring(0, 20)}...</span>
                                 <span className="text-xs text-slate-400 font-mono mt-1 md:mt-0">{block.timestamp}</span>
                             </div>
                             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                 <p className="text-sm font-medium text-slate-800 dark:text-slate-200"><span className="text-slate-400 text-xs uppercase font-bold mr-2">Data:</span>{block.data}</p>
                             </div>
                             <p className="text-xs text-slate-400 font-mono">Prev Hash: {block.prevHash.substring(0, 20)}...</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DashboardTab = ({ chain }: { chain: Block[] }) => (
  <div className="animate-fadeIn space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10"><Network className="w-24 h-24" /></div>
              <p className="text-slate-400 text-xs font-medium uppercase">Altura del Bloque</p>
              <h3 className="text-3xl font-mono font-bold mt-1">#{chain.length - 1}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Nodos Activos</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">1</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">TPS Promedio</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">0</h3>
          </div>
           <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Estado Red</p>
              <div className="flex items-center mt-1"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div><span className="font-bold text-slate-900 dark:text-white">Saludable</span></div>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Volumen de Transacciones</h3>
          <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TX_VOLUME_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip contentStyle={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid rgba(99,102,241,0.25)' }} cursor={{ stroke: 'var(--muted)', opacity: 0.2 }} />
                      <Area type="monotone" dataKey="txs" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.2} />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>
  </div>
);

export const BlockchainView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger'>('dashboard');
  const [chain, setChain] = useState<Block[]>(INITIAL_CHAIN);

  const addBlock = (data: string) => {
      const prevBlock = chain[chain.length - 1];
      const newBlock: Block = {
          index: prevBlock.index + 1,
          timestamp: new Date().toISOString(),
          data: data,
          prevHash: prevBlock.hash,
          hash: simpleHash(data + prevBlock.hash + Date.now()),
          validator: "Node-01"
      };
      setChain([...chain, newBlock]);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
        <div className="max-w-[1400px] mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none text-white">
                        <Box className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blockchain & Trazabilidad</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ledger inmutable para certificación de origen.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Dashboard</button>
                <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ledger' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Ledger Interactivo</button>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'dashboard' && <DashboardTab chain={chain} />}
                {activeTab === 'ledger' && <LedgerTab chain={chain} onAddBlock={addBlock} />}
            </div>
        </div>
    </div>
  );
};
