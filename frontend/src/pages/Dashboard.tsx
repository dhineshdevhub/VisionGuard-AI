import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Activity, 
  Users, 
  ShieldAlert, 
  Truck, 
  BellRing,
  Volume2,
  VolumeX,
  AlertCircle,
  Zap,
  LayoutDashboard,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { incidentService } from '../services/apiService';
import { initSocket, disconnectSocket } from '../services/socketService';
import type { Incident, Stats } from '../types/index';
import StatCard from '../components/StatCard';
import IncidentCard from '../components/IncidentCard';
import MapView from '../components/MapView';
import ViewToggle from '../components/ViewToggle';

const Dashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchInitialData();
    const socket = initSocket();

    socket.on('incident:new', (newIncident: Incident) => {
      setIncidents((prev) => [newIncident, ...prev]);
      setStats((prev) => prev ? ({
        ...prev,
        totalIncidents: prev.totalIncidents + 1,
        activeIncidents: prev.activeIncidents + 1,
        criticalIncidents: (newIncident.severity === 'Critical' || newIncident.severity === 'High') 
          ? prev.criticalIncidents + 1 : prev.criticalIncidents,
        totalHumansDetected: prev.totalHumansDetected + (newIncident.humanCount || 0),
        totalVehiclesDetected: prev.totalVehiclesDetected + (newIncident.vehicleCount || 0),
      }) : null);

      if (newIncident.severity === 'Critical' || newIncident.severity === 'High') {
        setShowAlarm(true);
        if (soundEnabled) playSiren();
        setTimeout(() => setShowAlarm(false), 6000);
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [soundEnabled]);

  const fetchInitialData = async () => {
    try {
      const [incidentsRes, statsRes] = await Promise.all([
        incidentService.getIncidents(),
        incidentService.getStats(),
      ]);
      setIncidents(incidentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSiren = () => {
    if (audioRef.current) {
       audioRef.current.currentTime = 0;
       audioRef.current.play().catch(() => {});
    }
  };

  const activeIncidentsCount = useMemo(() => incidents.filter(i => i.status === 'active').length, [incidents]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative w-16 h-16">
          <Activity className="animate-spin text-accent" size={64} />
          <div className="absolute inset-0 bg-accent/20 blur-xl animate-pulse rounded-full" />
        </div>
        <div className="text-center">
          <p className="text-accent font-black uppercase tracking-[0.3em] text-xs">VisionGuard AI</p>
          <p className="text-slate-500 font-medium text-[10px] mt-1 uppercase tracking-tighter italic">Initializing Secure Operational Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-300 font-sans p-4 md:p-6 lg:p-8 flex flex-col gap-6 selection:bg-accent/30">
      {/* Header Container */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-6 pb-6 border-b border-white/[0.04]">
        {/* Branding & Status HUD */}
        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4">
          <div className="relative">
             <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20 shadow-glow">
                <ShieldAlert className="text-accent" size={32} />
             </div>
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
               <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic py-1 leading-none">VisionGuard <span className="text-accent not-italic">AI</span></h1>
               <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-500 tracking-widest uppercase">Global_OS v2.4</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-500 mt-1">
               <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Zap size={10} className="text-accent" /> Monitoring active
               </span>
               <div className="w-1 h-1 rounded-full bg-slate-800" />
               <span className="text-[10px] font-medium tracking-tight">Active Nodes: {incidents.length}</span>
            </div>
          </div>
        </div>

        {/* Tactical Controls HUD */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-3 bg-surface p-1.5 px-4 rounded-xl border border-white/5 shadow-inner">
               <div className="flex items-center gap-2.5 pr-4 border-r border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-400">Stable</span>
               </div>
               <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 transition-all rounded-lg transition-transform active:scale-95 ${soundEnabled ? 'text-accent bg-accent/10 shadow-glow/10' : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}
                  title={soundEnabled ? "Siren Enabled" : "Siren Disabled"}
               >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
               </button>
            </div>
            
            <ViewToggle view={view} onViewChange={setView} />
        </div>
      </header>

      {/* Top Stats HUD */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          label="Total Events" 
          value={stats?.totalIncidents ?? 0} 
          icon={<LayoutDashboard />} 
          colorClass="bg-accent text-accent" 
        />
        <StatCard 
          label="Active Alerts" 
          value={activeIncidentsCount} 
          icon={<Zap />} 
          colorClass="bg-emergency text-emergency" 
          trend="Live"
        />
        <StatCard 
          label="Injured Potential" 
          value={stats?.totalHumansDetected ?? 0} 
          icon={<Users />} 
          colorClass="bg-indigo-500 text-indigo-400" 
        />
        <StatCard 
          label="Assets Tracked" 
          value={stats?.totalVehiclesDetected ?? 0} 
          icon={<Truck />} 
          colorClass="bg-slate-400 text-slate-300" 
        />
        <StatCard 
          label="Core Nodes" 
          value="04" 
          icon={<Box />} 
          colorClass="bg-emerald-500 text-emerald-400" 
        />
      </div>

      {/* Main Command View */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left: Feed Panel */}
        <section className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 overflow-hidden min-h-[500px]">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center space-x-2">
                 <BellRing className="text-emergency" size={14} />
                 <span>Incident Feed</span>
              </h2>
              <div className="flex items-center space-x-2 font-mono text-[9px] font-bold text-slate-500">
                 <span className="w-1.5 h-1.5 rounded-full bg-emergency animate-pulse" />
                 <span>REAL-TIME_STREAM</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              <AnimatePresence initial={false}>
                 {incidents.length === 0 ? (
                    <div className="panel-container p-12 text-center flex flex-col items-center space-y-4">
                       <Activity className="text-slate-800 animate-pulse" size={48} />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Passive Monitoring: Clear</p>
                    </div>
                 ) : (
                    incidents.map((incident) => (
                       <motion.div
                          key={incident.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                       >
                          <IncidentCard 
                             incident={incident} 
                             isSelected={selectedIncidentId === incident.id}
                             onClick={() => setSelectedIncidentId(incident.id)}
                          />
                       </motion.div>
                    ))
                 )}
              </AnimatePresence>
           </div>
        </section>

        {/* Right: Main Display Panel */}
        <section className="lg:col-span-8 xl:col-span-9 rounded-2xl overflow-hidden min-h-[600px] flex flex-col shadow-glow/5 relative">
           <AnimatePresence mode="wait">
              {view === 'map' ? (
                 <motion.div 
                    key="map-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                 >
                    <MapView incidents={incidents} activeIncidentId={selectedIncidentId} />
                 </motion.div>
              ) : (
                 <motion.div 
                    key="grid-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="panel-container p-6 overflow-y-auto h-full"
                 >
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 auto-rows-max">
                       {incidents.map((incident) => (
                          <IncidentCard 
                             key={incident.id} 
                             incident={incident} 
                             isSelected={selectedIncidentId === incident.id}
                             onClick={() => setSelectedIncidentId(incident.id)}
                          />
                       ))}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </section>
      </main>

      {/* Emergency Global Alert Overlay */}
      <AnimatePresence>
        {showAlarm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-emergency/10 backdrop-blur-md pointer-events-none"
          >
             <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-emergency p-1.5 rounded-[2.5rem] shadow-glow-red"
             >
                <div className="bg-background/90 backdrop-blur-xl border-4 border-emergency p-12 rounded-[2.25rem] flex flex-col items-center space-y-6">
                   <div className="relative">
                      <AlertCircle className="text-emergency animate-pulse" size={100} />
                      <div className="absolute inset-0 bg-emergency/20 blur-2xl animate-pulse rounded-full" />
                   </div>
                   <div className="text-center space-y-3">
                      <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">Critical Incident</h2>
                      <p className="text-emergency font-bold text-lg tracking-widest uppercase opacity-80">Immediate Personnel Deployment Required</p>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} src="/Alarm.mp3" preload="auto" />
    </div>
  );
};

export default Dashboard;
