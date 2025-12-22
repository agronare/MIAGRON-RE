
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MessageSquare, Video, Phone, Users, Search, Plus, 
  Settings, Hash, MoreVertical, Paperclip, Smile, Send, 
  Mic, Camera, Monitor, PhoneOff, Calendar, Clock, 
  FileText, Image as ImageIcon, ChevronDown, Pin, Bell,
  MapPin, ShieldAlert
} from 'lucide-react';
import { Employee, Branch, ChatMessage, ChatChannel } from '../types';

// Fixed System Channels
const SYSTEM_CHANNELS: ChatChannel[] = [
  { id: 'general', name: 'General', type: 'public' },
  { id: 'operaciones', name: 'Operaciones-Campo', type: 'public' },
  { id: 'ventas', name: 'Equipo-Ventas', type: 'public' },
  { id: 'alertas', name: 'Alertas-Urgentes', type: 'alert' },
];

type ViewMode = 'chat' | 'video' | 'directory';

interface CommunicationViewProps {
    currentUser: any;
    employees: Employee[];
    branches: Branch[];
    messages: ChatMessage[];
    onSendMessage: (msg: ChatMessage) => void;
}

// --- Sub-Components ---

const Sidebar = ({ activeView, setActiveView, selectedChannel, setSelectedChannel, employees, branches }: any) => (
  <div className="w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-white tracking-wide">AGRONARE TEAM</h2>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 custom-scrollbar">
          {/* Navigation */}
          <div className="space-y-1">
              <button 
                  onClick={() => setActiveView('chat')}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'chat' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                  <MessageSquare className="w-4 h-4 mr-3" /> Chats
              </button>
              <button 
                  onClick={() => setActiveView('video')}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'video' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                  <Video className="w-4 h-4 mr-3" /> Videollamadas
              </button>
              <button 
                  onClick={() => setActiveView('directory')}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'directory' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                  <Users className="w-4 h-4 mr-3" /> Directorio
              </button>
          </div>

          {/* Channels */}
          <div>
              <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Canales</span>
                  <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
              </div>
              <div className="space-y-0.5">
                  {SYSTEM_CHANNELS.map(channel => (
                      <button 
                          key={channel.id}
                          onClick={() => { setActiveView('chat'); setSelectedChannel(channel.id); }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-sm transition-colors ${selectedChannel === channel.id && activeView === 'chat' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
                      >
                          <div className="flex items-center">
                              {channel.type === 'alert' ? <ShieldAlert className="w-3 h-3 mr-2 text-red-500" /> : <Hash className="w-3 h-3 mr-2 text-slate-500" />}
                              <span className={channel.type === 'alert' ? 'text-red-400' : ''}>{channel.name}</span>
                          </div>
                      </button>
                  ))}
              </div>
          </div>

          {/* Branches */}
          <div>
              <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Sucursales</span>
              </div>
              <div className="space-y-0.5">
                  {(branches || []).map((branch: Branch) => (
                      <button 
                          key={branch.id}
                          onClick={() => { setActiveView('chat'); setSelectedChannel(branch.id); }}
                          className={`w-full flex items-center px-3 py-1.5 rounded text-sm transition-colors ${selectedChannel === branch.id && activeView === 'chat' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
                      >
                          <div className={`w-2 h-2 rounded-full mr-2 ${branch.status === 'Activa' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                          <span className="truncate">{branch.name}</span>
                      </button>
                  ))}
                  {(branches || []).length === 0 && <p className="px-3 text-xs text-slate-600">Sin sucursales.</p>}
              </div>
          </div>

          {/* DMs */}
          <div>
              <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mensajes Directos</span>
                  <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
              </div>
              <div className="space-y-0.5">
                  {(employees || []).map((user: Employee) => (
                      <button 
                          key={user.id} 
                          onClick={() => { setActiveView('chat'); setSelectedChannel(user.id); }}
                          className={`w-full flex items-center px-3 py-1.5 rounded text-sm transition-colors ${selectedChannel === user.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
                      >
                           <div className="relative mr-2">
                               <div className="w-5 h-5 rounded bg-indigo-900 text-indigo-200 flex items-center justify-center text-[10px] font-bold">
                                   {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                               </div>
                               <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-slate-900 ${user.status === 'Activo' ? 'bg-emerald-500' : user.status === 'Vacaciones' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                           </div>
                           <span className="truncate">{user.firstName} {user.lastName}</span>
                      </button>
                  ))}
                  {(employees || []).length === 0 && <p className="px-3 text-xs text-slate-600">Sin empleados.</p>}
              </div>
          </div>
      </div>
  </div>
);

const ChatArea = ({ selectedChannel, messageInput, setMessageInput, channelName, channelMessages, onSend }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [channelMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if(e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSend();
      }
  };

  return (
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 h-full">
          {/* Chat Header */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-6">
              <div className="flex items-center">
                  <Hash className="w-5 h-5 text-slate-400 mr-2" />
                  <h3 className="font-bold text-slate-900 dark:text-white mr-4">
                      {channelName || 'Selecciona un chat'}
                  </h3>
                  {channelName && <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mr-4"></div>}
              </div>
              <div className="flex items-center space-x-4">
                  <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
                      <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
                      <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
                      <MoreVertical className="w-5 h-5" />
                  </button>
              </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar" ref={scrollRef}>
              {channelMessages.length > 0 ? channelMessages.map((msg: ChatMessage) => (
                  <div key={msg.id} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1 uppercase">
                          {msg.avatar || msg.senderName.substring(0,2)}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{msg.senderName}</span>
                              <span className="text-xs text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          {msg.type === 'text' ? (
                              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{msg.text}</p>
                          ) : (
                              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg w-fit">
                                  <FileText className="w-8 h-8 text-red-500" />
                                  <div>
                                      <p className="text-sm font-bold text-slate-800 dark:text-white">{msg.fileName}</p>
                                      <p className="text-xs text-slate-500">{msg.fileSize}</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              )) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm">No hay mensajes en este canal. ¡Sé el primero en escribir!</p>
                  </div>
              )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><ImageIcon className="w-5 h-5" /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><Paperclip className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1">
                      <textarea 
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Enviar mensaje a ${channelName}...`}
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-400 resize-none py-2 max-h-32 min-h-[40px]"
                          rows={1}
                      />
                  </div>
                  <div className="flex gap-1">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><Smile className="w-5 h-5" /></button>
                      {messageInput.trim() ? (
                          <button onClick={onSend} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"><Send className="w-5 h-5" /></button>
                      ) : (
                          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><Mic className="w-5 h-5" /></button>
                      )}
                  </div>
              </div>
              <div className="text-center mt-2">
                  <p className="text-[10px] text-slate-400"><strong>Enter</strong> para enviar</p>
              </div>
          </div>
      </div>
  );
};

export const CommunicationView: React.FC<CommunicationViewProps> = ({ currentUser, employees = [], branches = [], messages = [], onSendMessage }) => {
    const [activeView, setActiveView] = useState<ViewMode>('chat');
    const [selectedChannelId, setSelectedChannelId] = useState('general');
    const [messageInput, setMessageInput] = useState('');

    const currentChannelName = useMemo(() => {
        const sysChannel = SYSTEM_CHANNELS.find(c => c.id === selectedChannelId);
        if (sysChannel) return sysChannel.name;
        
        const branchChannel = (branches || []).find(b => b.id === selectedChannelId);
        if (branchChannel) return branchChannel.name;

        const userChannel = (employees || []).find(e => e.id === selectedChannelId);
        if (userChannel) return `${userChannel.firstName} ${userChannel.lastName}`;

        return 'Desconocido';
    }, [selectedChannelId, branches, employees]);

    const channelMessages = useMemo(() => {
        return (messages || []).filter(m => m.channelId === selectedChannelId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, selectedChannelId]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id || 'user-0',
            senderName: currentUser.firstName || 'Usuario',
            avatar: (currentUser.firstName && currentUser.lastName) ? `${currentUser.firstName[0]}${currentUser.lastName[0]}` : 'YO',
            text: messageInput,
            timestamp: new Date().toISOString(),
            channelId: selectedChannelId,
            type: 'text'
        };

        onSendMessage(newMsg);
        setMessageInput('');
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                selectedChannel={selectedChannelId} 
                setSelectedChannel={setSelectedChannelId} 
                employees={employees}
                branches={branches}
            />
            {activeView === 'chat' && (
                <ChatArea 
                    selectedChannel={selectedChannelId} 
                    channelName={currentChannelName}
                    channelMessages={channelMessages}
                    messageInput={messageInput} 
                    setMessageInput={setMessageInput} 
                    onSend={handleSendMessage}
                />
            )}
            {activeView === 'video' && (
                <div className="flex-1 flex items-center justify-center bg-slate-900 text-white">
                    <div className="text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <h2 className="text-xl font-bold">Módulo de Videollamadas</h2>
                        <p className="text-slate-400 mt-2">Selecciona un contacto o canal para iniciar.</p>
                    </div>
                </div>
            )}
            {activeView === 'directory' && (
                <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                    <div className="text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Directorio Corporativo</h2>
                        <p className="text-slate-500 mt-2">Busca y conecta con tus compañeros.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
