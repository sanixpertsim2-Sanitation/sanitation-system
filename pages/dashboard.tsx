import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, CheckCircle2, Activity, X, AlertCircle, TrendingUp, Clock, Users } from 'lucide-react';

// Scanning Beam Component for Active Lines
const ScanningBeam = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {/* The moving laser line */}
      <motion.div
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
      />
      
      {/* The trailing light glow */}
      <motion.div
        initial={{ top: "-30%" }}
        animate={{ top: "90%" }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 right-0 h-[40%] bg-gradient-to-b from-cyan-500/10 to-transparent opacity-30 z-0"
      />
    </div>
  );
};

// Premium Mobile Drawer Component
const SanitationDrawer = ({ isOpen, onClose, children, title, lineData }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-white/10 rounded-t-[32px] p-6 pb-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Grabber Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Production Line Card Component
const ProductionLineCard = ({ line, isActive, onClick, isHero = false }) => {
  const cardVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => onClick(line)}
      className={`
        relative bg-white/[0.03] backdrop-blur-xl border border-white/10 
        rounded-3xl p-6 cursor-pointer transition-all duration-300
        hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl
        hover:shadow-cyan-500/10 overflow-hidden
        ${isHero ? 'md:col-span-2' : ''}
        ${isActive ? 'ring-2 ring-cyan-500/50' : ''}
      `}
    >
      {/* Scanning Beam for Active Lines */}
      {isActive && <ScanningBeam />}
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              p-3 rounded-2xl bg-gradient-to-br 
              ${isActive ? 'from-cyan-500 to-blue-600' : 'from-slate-600 to-slate-700'}
            `}>
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{line.name}</h3>
              <p className="text-slate-400 text-sm">{line.product}</p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${isActive 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
              : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
            }
          `}>
            {isActive ? 'ACTIVE' : 'STANDBY'}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-sm">Status</span>
            </div>
            <p className="text-white font-semibold">{line.status}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">Last Check</span>
            </div>
            <p className="text-white font-semibold">{line.lastCheck}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Sanitation Progress</span>
            <span className="text-cyan-400 text-sm font-semibold">{line.progress}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${line.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`
                h-full rounded-full bg-gradient-to-r
                ${isActive ? 'from-cyan-500 to-blue-500' : 'from-slate-500 to-slate-600'}
              `}
            />
          </div>
        </div>

        {/* Alert for Active Lines */}
        {isActive && line.alert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <p className="text-amber-400 text-sm">{line.alert}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
export default function DashboardPage() {
  const [selectedLine, setSelectedLine] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Production Lines Data
  const productionLines = [
    {
      id: 1,
      name: 'MACY',
      product: 'Cupcake Line',
      status: 'Sanitizing',
      lastCheck: '2 min ago',
      progress: 78,
      isActive: true,
      alert: 'Sanitation in progress - 78% complete',
      metrics: {
        temperature: '72°F',
        humidity: '45%',
        pressure: '14.7 psi'
      },
      checklist: [
        { task: 'Pre-rinse equipment', completed: true },
        { task: 'Apply sanitizer', completed: true },
        { task: 'Wait 10 minutes', completed: false },
        { task: 'Final rinse', completed: false },
        { task: 'Dry inspection', completed: false }
      ]
    },
    {
      id: 2,
      name: 'JFK',
      product: 'Doughnut Line',
      status: 'Ready',
      lastCheck: '1 hour ago',
      progress: 100,
      isActive: false,
      metrics: {
        temperature: '68°F',
        humidity: '42%',
        pressure: '14.6 psi'
      },
      checklist: [
        { task: 'Pre-rinse equipment', completed: true },
        { task: 'Apply sanitizer', completed: true },
        { task: 'Wait 10 minutes', completed: true },
        { task: 'Final rinse', completed: true },
        { task: 'Dry inspection', completed: true }
      ]
    },
    {
      id: 3,
      name: 'CECE',
      product: 'Cookie Line',
      status: 'Scheduled',
      lastCheck: '3 hours ago',
      progress: 0,
      isActive: false,
      alert: 'Scheduled for 2:00 PM',
      metrics: {
        temperature: '70°F',
        humidity: '44%',
        pressure: '14.8 psi'
      },
      checklist: [
        { task: 'Pre-rinse equipment', completed: false },
        { task: 'Apply sanitizer', completed: false },
        { task: 'Wait 10 minutes', completed: false },
        { task: 'Final rinse', completed: false },
        { task: 'Dry inspection', completed: false }
      ]
    }
  ];

  const handleLineClick = (line) => {
    setSelectedLine(line);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedLine(null), 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Spotlight Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />
      
      {/* Main Content */}
      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Production Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Intelligent Sanitation Monitoring System
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {productionLines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductionLineCard
                line={line}
                isActive={line.isActive}
                onClick={handleLineClick}
                isHero={line.id === 1} // MACY is the hero card
              />
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Factory, label: 'Active Lines', value: '1', color: 'text-cyan-400' },
            { icon: CheckCircle2, label: 'Completed', value: '1', color: 'text-green-400' },
            { icon: Clock, label: 'Pending', value: '1', color: 'text-amber-400' },
            { icon: TrendingUp, label: 'Efficiency', value: '94%', color: 'text-purple-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center space-x-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-slate-400 text-xs">{stat.label}</p>
                  <p className="text-white font-bold text-lg">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Premium Drawer */}
      <SanitationDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={selectedLine?.name}
        lineData={selectedLine}
      >
        {selectedLine && (
          <div className="space-y-6">
            {/* Line Status */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Line Status</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Temperature</p>
                  <p className="text-white font-semibold">{selectedLine.metrics.temperature}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Humidity</p>
                  <p className="text-white font-semibold">{selectedLine.metrics.humidity}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Pressure</p>
                  <p className="text-white font-semibold">{selectedLine.metrics.pressure}</p>
                </div>
              </div>
            </div>

            {/* Sanitation Checklist */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Sanitation Checklist</h3>
              <div className="space-y-3">
                {selectedLine.checklist.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-white/[0.02] rounded-xl"
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      ${item.completed 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-slate-700/50 border border-slate-600/30'
                      }
                    `}>
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-2 h-2 bg-slate-500 rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm ${item.completed ? 'text-slate-400' : 'text-white'}`}>
                      {item.task}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
                {selectedLine.isActive ? 'Continue Sanitation' : 'Start Sanitation'}
              </button>
              <button className="w-full py-4 bg-white/[0.05] border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/[0.10] transition-all duration-300">
                View Detailed Report
              </button>
            </div>
          </div>
        )}
      </SanitationDrawer>
    </div>
  );
}
