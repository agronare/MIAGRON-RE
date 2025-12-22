import React, { useState, useMemo } from 'react';
import { BOTS_DATA } from '../constants';
import { Bot } from '../types';
import { Search, Plus, CheckCircle, XCircle, AlertCircle, Bot as BotIcon } from 'lucide-react';
import { NewBotModal } from './rpa/NewBotModal';
import { BotCard } from './rpa/BotCard';

export const RPAView: React.FC<{ bots?: any[]; botLogs?: any[] }> = ({ bots: botsFromBackend = [], botLogs = [] }) => {
  const [bots, setBots] = useState<Bot[]>(botsFromBackend.length ? botsFromBackend as Bot[] : BOTS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);

  const filteredBots = useMemo(() => 
    bots.filter(bot => 
      bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchTerm.toLowerCase())
    ), [bots, searchTerm]);

  const { activeCount, inactiveCount, errorCount } = useMemo(() => ({
    activeCount: bots.filter(b => b.status === 'Activo').length,
    inactiveCount: bots.filter(b => b.status === 'Inactivo').length,
    errorCount: bots.filter(b => b.status === 'Error').length,
  }), [bots]);

  const handleOpenModal = (bot: Bot | null) => {
    setEditingBot(bot);
    setIsModalOpen(true);
  };

  const handleSaveBot = (botData: Bot) => {
    if (editingBot) {
      setBots(bots.map(b => b.id === editingBot.id ? { ...b, ...botData } : b));
    } else {
      setBots([...bots, { ...botData, id: `bot-${Date.now()}` }]);
    }
    setIsModalOpen(false);
    setEditingBot(null);
  };

  const handleDeleteBot = (botId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este bot?')) {
      setBots(bots.filter(b => b.id !== botId));
    }
  };

  const handleToggleStatus = (botId: string) => {
    setBots(bots.map(b => 
      b.id === botId 
        ? { ...b, status: b.status === 'Activo' ? 'Inactivo' : 'Activo' }
        : b
    ));
  };
  
  const handleRunBot = (botName: string) => {
      alert(`Ejecutando "${botName}" ahora... (Simulación)`);
  };

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-8 max-w-[1400px] mx-auto w-full">
         {/* Header */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <BotIcon className="w-8 h-8" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Centro de Automatización RPA</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona, programa y supervisa tus bots automáticos.</p>
               </div>
            </div>

            {/* Backend Bots Summary */}
            <div className="card p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Bots sincronizados (Backend)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(botsFromBackend.length ? botsFromBackend : bots).slice(0, 6).map((b:any, i:number) => (
                  <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" key={b.id ?? i}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{b.nombre || b.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${ (b.activo || b.status === 'Activo') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' }`}>{ (b.activo || b.status === 'Activo') ? 'Activo' : 'Inactivo' }</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.descripcion || b.description || 'Bot'}</div>
                  </div>
                ))}
              </div>
              {botLogs && botLogs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Eventos recientes ({botLogs.length})</h4>
                  <div className="overflow-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead><tr><th className="text-left p-2">Bot</th><th className="text-left p-2">Mensaje</th><th className="text-left p-2">Éxito</th><th className="text-left p-2">Fecha</th></tr></thead>
                      <tbody>
                        {botLogs.slice(0, 10).map((l:any, i:number) => (
                          <tr key={l.id ?? i}><td className="p-2">{String(l.botId || '')}</td><td className="p-2">{l.mensaje || l.message || '-'}</td><td className="p-2">{String(l.exito ?? l.success ?? '')}</td><td className="p-2">{String(l.ejecutado || l.date || '')}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
               <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {activeCount} Activos
               </div>
               <div className="flex items-center text-slate-500 dark:text-slate-400">
                  <XCircle className="w-4 h-4 mr-2" />
                  {inactiveCount} Inactivos
               </div>
               <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errorCount} con Error
               </div>
            </div>
         </div>

         {/* Filter Bar */}
         <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
             <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                      type="text"
                      placeholder="Buscar por nombre o descripción..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white dark:bg-slate-800 dark:text-white shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <button onClick={() => handleOpenModal(null)} className="flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Bot
              </button>
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBots.map((bot) => (
                  <BotCard 
                    key={bot.id}
                    bot={bot}
                    onRun={() => handleRunBot(bot.name)}
                    onToggle={() => handleToggleStatus(bot.id)}
                    onEdit={() => handleOpenModal(bot)}
                    onDelete={() => handleDeleteBot(bot.id)}
                  />
              ))}
         </div>
      </div>
      <NewBotModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBot}
        initialData={editingBot}
      />
    </>
  );
};
