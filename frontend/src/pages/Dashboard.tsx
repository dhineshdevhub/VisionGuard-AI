import React, { useEffect, useState, useRef } from 'react';
import { 
  AlertCircle, 
  Activity, 
  Users, 
  ShieldAlert, 
  Truck, 
  Map as MapIcon, 
  List, 
  Camera as CameraIcon, 
  BellRing,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { incidentService } from '../services/apiService';
import { initSocket, disconnectSocket } from '../services/socketService';
import type { Incident, Stats } from '../types/index';
import StatCard from '../components/StatCard';
import IncidentCard from '../components/IncidentCard';
import MapView from '../components/MapView';

const Dashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');
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
        totalHumansDetected: prev.totalHumansDetected + newIncident.humanCount,
        totalVehiclesDetected: prev.totalVehiclesDetected + newIncident.vehicleCount,
      }) : null);

      // Trigger alarm and red screen for any incident that is not purely low severity
      if (newIncident.severity === 'Critical' || newIncident.severity === 'High' || newIncident.severity === 'Medium') {
        setShowAlarm(true);
        if (soundEnabled) playSiren();
        setTimeout(() => setShowAlarm(false), 8000);
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
       audioRef.current.currentTime = 0; // reset to beginning
       audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center space-x-3">
            <ShieldAlert className="text-blue-500" size={32} />
            <span>VisionGuard <span className="text-blue-500">AI</span> Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-1">Real-time Accident Detection & Smart Emergency Response</p>
        </div>
        <div className="flex items-center space-x-3 bg-card p-1.5 rounded-xl border border-border shadow-lg shadow-black/20">
          <button 
             onClick={() => {
               const willBeEnabled = !soundEnabled;
               setSoundEnabled(willBeEnabled);
               // Browser audio unlock mechanism
               if (willBeEnabled && audioRef.current) {
                 audioRef.current.volume = 0;
                 audioRef.current.play().then(() => {
                   audioRef.current!.pause();
                   audioRef.current!.currentTime = 0;
                   audioRef.current!.volume = 1; // restore volume
                 }).catch(() => {});
               }
             }}
             className={`p-2.5 rounded-lg transition-all ${soundEnabled ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
             title={soundEnabled ? "Siren Enabled" : "Siren Disabled"}
          >
             {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <div className="w-[1px] h-6 bg-border mx-1"></div>
          <button 
            onClick={() => setView('map')}
            className={`p-2.5 rounded-lg flex items-center space-x-2 transition-all ${view === 'map' ? 'bg-blue-600/20 text-blue-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MapIcon size={20} />
            <span className="text-sm font-semibold">MAP VIEW</span>
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-2.5 rounded-lg flex items-center space-x-2 transition-all ${view === 'list' ? 'bg-blue-600/20 text-blue-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <List size={20} />
            <span className="text-sm font-semibold">LIST VIEW</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total Incidents" value={stats?.totalIncidents ?? 0} icon={<Activity size={24} />} colorClass="bg-blue-500 text-blue-500" />
        <StatCard label="Critical Incidents" value={stats?.criticalIncidents ?? 0} icon={<AlertCircle size={24} />} colorClass="bg-red-500 text-red-500" />
        <StatCard label="Humans Detected" value={stats?.totalHumansDetected ?? 0} icon={<Users size={24} />} colorClass="bg-emerald-500 text-emerald-500" />
        <StatCard label="Vehicles Tracked" value={stats?.totalVehiclesDetected ?? 0} icon={<Truck size={24} />} colorClass="bg-orange-500 text-orange-500" />
        <StatCard label="System Status" value="ACTIVE" icon={<CameraIcon size={24} />} colorClass="bg-indigo-500 text-indigo-500" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Alerts List */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <BellRing className="text-red-500" size={20} />
              <span>Recent Incidents</span>
            </h2>
            <span className="text-xs font-mono text-slate-500 px-2 py-0.5 border border-border rounded">LIVE</span>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[700px] scrollbar-thin scrollbar-thumb-slate-800">
             {incidents.length === 0 ? (
               <div className="glass-card p-12 text-center text-slate-500 italic">No incidents detected. System monitoring active.</div>
             ) : (
               <AnimatePresence>
                 {incidents.map((incident) => (
                   <motion.div 
                     key={incident.id}
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ x: 20, opacity: 0 }}
                   >
                     <IncidentCard incident={incident} />
                   </motion.div>
                 ))}
               </AnimatePresence>
             )}
          </div>
        </div>

        {/* Dynamic View */}
        <div className="lg:col-span-2 h-[750px] sticky top-8">
           {view === 'map' ? (
             <MapView incidents={incidents} />
           ) : (
             <div className="glass-card h-full p-2 overflow-hidden overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max p-4">
                {incidents.map((incident) => (
                   <IncidentCard key={incident.id} incident={incident} />
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Critical Alarm Overlay */}
      <AnimatePresence>
        {showAlarm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/20 backdrop-blur-sm pointer-events-none"
          >
            <div className="bg-red-600 text-white p-8 rounded-3xl shadow-2xl shadow-red-500/50 flex flex-col items-center space-y-6 animate-pulse-red">
               <AlertCircle size={80} strokeWidth={2.5} />
               <div className="text-center space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic">Critical Incident Detected</h2>
                  <p className="text-red-100 font-bold text-lg">Emergency response personnel notified. Check latest feed.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Element */}
      <audio ref={audioRef} src="/Alarm.mp3" preload="auto" />
    </div>
  );
};

export default Dashboard;
