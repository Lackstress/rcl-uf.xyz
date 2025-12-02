import React, { useState } from 'react';
import { Download, Upload, RefreshCw, AlertTriangle, Database, Clock } from 'lucide-react';

const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

function PanelSettings({ onBack }) {
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const handleExport = () => {
    const allData = {
      week: getStoredData('rcl_week', 11),
      schedule: getStoredData('rcl_schedule', []),
      teamRecords: getStoredData('rcl_team_records', {}),
      links: getStoredData('rcl_all_links', {}),
      rules: getStoredData('rcl_rules', []),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    setExportData(dataStr);
    
    // Download as file
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rcl-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setImportStatus('Please paste JSON data to import');
      return;
    }

    try {
      const data = JSON.parse(importData);
      
      // Validate data structure
      if (!data.week || !data.schedule || !data.teamRecords) {
        throw new Error('Invalid data structure');
      }

      // Import data
      if (data.week !== undefined) saveData('rcl_week', data.week);
      if (data.schedule) saveData('rcl_schedule', data.schedule);
      if (data.teamRecords) saveData('rcl_team_records', data.teamRecords);
      if (data.links) saveData('rcl_all_links', data.links);
      if (data.rules) saveData('rcl_rules', data.rules);

      setImportStatus('Data imported successfully! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setImportStatus(`Import error: ${error.message}`);
      setTimeout(() => setImportStatus(''), 5000);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all panel data? This cannot be undone!')) {
      const keys = ['rcl_week', 'rcl_schedule', 'rcl_team_records', 'rcl_all_links', 'rcl_rules'];
      keys.forEach(key => localStorage.removeItem(key));
      setImportStatus('All data cleared! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const getDataStats = () => {
    const schedule = getStoredData('rcl_schedule', []);
    const teamRecords = getStoredData('rcl_team_records', {});
    const links = getStoredData('rcl_all_links', {});
    const rules = getStoredData('rcl_rules', []);

    return {
      gamesCount: schedule.length,
      teamsWithRecords: Object.keys(teamRecords).length,
      totalLinks: Object.values(links).reduce((acc, cat) => acc + cat.length, 0),
      rulesSections: rules.length
    };
  };

  const stats = getDataStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
          >
            ← Back to Panel
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="text-purple-400" /> Data Management
          </h1>
        </div>

        {/* Data Statistics */}
        <div className="glass rounded-xl p-6 mb-6 border border-purple-500/20">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-purple-400" /> Current Data Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.gamesCount}</div>
              <div className="text-gray-400 text-sm">Games Scheduled</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.teamsWithRecords}</div>
              <div className="text-gray-400 text-sm">Team Records</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalLinks}</div>
              <div className="text-gray-400 text-sm">Total Links</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.rulesSections}</div>
              <div className="text-gray-400 text-sm">Rules Sections</div>
            </div>
          </div>
        </div>

        {/* Export/Import */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Export */}
          <div className="glass rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Download className="text-green-400" /> Export Data
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Download a backup of all panel data including schedules, records, links, and rules.
            </p>
            <button
              onClick={handleExport}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <Download size={18} /> Export All Data
            </button>
            {exportData && (
              <div className="mt-4">
                <label className="text-gray-400 text-xs block mb-2">Exported JSON:</label>
                <textarea
                  value={exportData}
                  readOnly
                  className="w-full h-32 bg-slate-800 border border-green-500/30 rounded-lg px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Import */}
          <div className="glass rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="text-blue-400" /> Import Data
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Paste previously exported JSON data to restore all panel settings.
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              className="w-full h-32 bg-slate-800 border border-blue-500/30 rounded-lg px-3 py-2 text-white text-xs font-mono mb-4"
            />
            <button
              onClick={handleImport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <Upload size={18} /> Import Data
            </button>
            {importStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                importStatus.includes('error') 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : importStatus.includes('success')
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass rounded-xl p-6 border border-red-500/20">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-400" /> Danger Zone
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            These actions are irreversible. Please be careful before proceeding.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw size={18} /> Clear All Data
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw size={18} /> Reset Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelSettings;
