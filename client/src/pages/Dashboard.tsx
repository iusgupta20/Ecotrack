import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Award, Calendar, CheckCircle2, ChevronRight, Download, 
  Flame, Leaf, RotateCcw, TrendingDown, Users 
} from 'lucide-react';

interface GoalType {
  _id: string;
  title: string;
  category: string;
  description: string;
  targetReduction: number;
  points: number;
  isCompleted: boolean;
}

interface FootprintType {
  _id: string;
  totalCo2: number;
  treeEquivalent: number;
  score: number;
  transport: { co2: number };
  energy: { co2: number };
  food: { co2: number };
  waste: { co2: number };
  water: { co2: number };
  date: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  streak: number;
  isCurrentUser: boolean;
}

interface ActivityType {
  _id: string;
  type: string;
  description: string;
  pointsEarned: number;
  co2Saved: number;
  date: string;
}

export const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [latestFootprint, setLatestFootprint] = useState<FootprintType | null>(null);
  const [history, setHistory] = useState<FootprintType[]>([]);
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [footprintData, historyData, goalsData, leaderboardData, activityData] = await Promise.all([
        api.get<FootprintType>('/footprint/latest').catch(() => null),
        api.get<FootprintType[]>('/footprint/history').catch(() => []),
        api.get<GoalType[]>('/goals'),
        api.get<LeaderboardUser[]>('/goals/leaderboard'),
        api.get<ActivityType[]>('/goals/activities').catch(() => [])
      ]);

      setLatestFootprint(footprintData);
      setHistory(historyData);
      setGoals(goalsData);
      setLeaderboard(leaderboardData);
      setActivities(activityData);

      if (footprintData) {
        const report = await api.get<{ report: string }>('/coach/report');
        setReportText(report.report);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    setCompletingId(goalId);
    try {
      await api.post(`/goals/${goalId}/complete`, {});
      await fetchDashboardData();
      await refreshUser();
    } catch (err) {
      console.error('Error completing goal:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const handleDownloadPDF = () => {
    if (!latestFootprint) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('EcoTrack AI - Sustainability Report', 20, 30);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Member: ${user?.name || 'Eco Warrior'}`, 20, 47);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(220);
    doc.line(20, 52, 190, 52);
    
    // Emissions summary
    doc.setFontSize(16);
    doc.setTextColor(30);
    doc.text('Carbon Footprint Summary', 20, 65);
    
    doc.setFontSize(12);
    doc.text(`Total Emissions: ${latestFootprint.totalCo2} kg CO2 / month`, 20, 75);
    doc.text(`Carbon Score: ${latestFootprint.score} / 100`, 20, 82);
    doc.text(`Tree Absorption Equivalent: ${latestFootprint.treeEquivalent} trees`, 20, 89);
    
    // Table
    doc.text('Category Details:', 20, 102);
    doc.text(`- Transportation: ${latestFootprint.transport.co2} kg CO2`, 30, 109);
    doc.text(`- Home Electricity & AC: ${latestFootprint.energy.co2} kg CO2`, 30, 116);
    doc.text(`- Dietary Intake: ${latestFootprint.food.co2} kg CO2`, 30, 123);
    doc.text(`- Waste & Recycling: ${latestFootprint.waste.co2} kg CO2`, 30, 130);
    doc.text(`- Water consumption: ${latestFootprint.water.co2} kg CO2`, 30, 137);
    
    doc.line(20, 145, 190, 145);
    
    // Recommendations
    doc.setFontSize(16);
    doc.text('AI Coach Recommendations', 20, 158);
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    const splitAdvice = doc.splitTextToSize(reportText || "Start tracking your categories and completing weekly goals to save carbon emissions.", 170);
    doc.text(splitAdvice, 20, 168);
    
    doc.save(`ecotrack_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium">Loading your ecological metrics...</p>
      </div>
    );
  }

  // Prepping charts data
  const pieData = latestFootprint ? [
    { name: 'Transport', value: latestFootprint.transport.co2, color: '#10b981' },
    { name: 'Energy', value: latestFootprint.energy.co2, color: '#3b82f6' },
    { name: 'Food', value: latestFootprint.food.co2, color: '#f59e0b' },
    { name: 'Waste', value: latestFootprint.waste.co2, color: '#8b5cf6' },
    { name: 'Water', value: latestFootprint.water.co2, color: '#06b6d4' }
  ].filter(c => c.value > 0) : [];

  const historyChartData = [...history].reverse().map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    CO2: item.totalCo2
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/30 dark:to-teal-950/10 border border-emerald-500/20 dark:border-emerald-800/30">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Hello, {user?.name}!</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            {latestFootprint 
              ? `Your latest carbon footprint is ${latestFootprint.totalCo2} kg CO₂/month. Let's make it lower!`
              : "Let's calculate your carbon footprint to get customized insights."}
          </p>
        </div>
        {latestFootprint && (
          <button
            onClick={handleDownloadPDF}
            className="mt-4 md:mt-0 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition"
            aria-label="Download Sustainability Report as PDF"
          >
            <Download size={16} />
            Download Report
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Score Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Carbon Score</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {latestFootprint ? `${latestFootprint.score}/100` : 'N/A'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Higher score = lower emissions</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
            <Award size={24} />
          </div>
        </div>

        {/* Footprint Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Footprint</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {latestFootprint ? `${latestFootprint.totalCo2} kg` : '0 kg'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">CO₂ greenhouse gas equivalent</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Trees Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trees Required</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {latestFootprint ? latestFootprint.treeEquivalent : '0'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">To offset your footprint monthly</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-500">
            <Leaf size={24} />
          </div>
        </div>

        {/* Gamification metrics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Eco Rewards</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {user?.points || 0} pts
            </p>
            <div className="flex items-center gap-1.5 text-xs text-orange-500 font-medium">
              <Flame size={14} className="fill-orange-500" />
              <span>{user?.streak || 0} Day Streak</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
            <Flame size={24} />
          </div>
        </div>
      </div>

      {/* Main Charts & Dashboard Info split */}
      {latestFootprint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Carbon Emission Breakdown</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Emissions']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {historyChartData.length > 1 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Emissions Over Time</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyChartData}>
                      <defs>
                        <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Total Footprint']} />
                      <Area type="monotone" dataKey="CO2" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCo2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Goals / AI Coach mini-advisor panel */}
          <div className="space-y-8">
            {/* Weekly Challenges */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-500" />
                  Weekly Challenges
                </h2>
              </div>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div 
                    key={goal._id} 
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      goal.isCompleted 
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60' 
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                          goal.category === 'transport' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' :
                          goal.category === 'energy' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
                          goal.category === 'food' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                        }`}>
                          {goal.category}
                        </span>
                        <span className="text-xs text-slate-400">{goal.points} pts</span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white mt-2 text-sm">{goal.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{goal.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        -{goal.targetReduction} kg CO₂
                      </span>
                      {goal.isCompleted ? (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteGoal(goal._id)}
                          disabled={completingId === goal._id}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition disabled:opacity-50"
                        >
                          {completingId === goal._id ? 'Saving...' : 'Mark Done'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Advisor Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">AI Coach Insights</h2>
              <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto pr-1">
                {reportText || "Analyzing your footprint trends..."}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-500 mb-2">
            <Leaf size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Run your first calculation!</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            We need a few details about your transportation, diet, and energy usage to calculate your personal carbon footprint and start coaching.
          </p>
          <a
            href="#calculator"
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition"
          >
            Start Calculator
          </a>
        </div>
      )}

      {/* Leaderboard & Badges & Activities row */}
      {latestFootprint && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-500" />
              Community Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.map((item) => (
                <div 
                  key={item.name} 
                  className={`p-3 rounded-xl flex items-center justify-between border ${
                    item.isCurrentUser 
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 font-semibold' 
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold text-sm ${
                      item.rank === 1 ? 'text-amber-500' :
                      item.rank === 2 ? 'text-slate-400' :
                      item.rank === 3 ? 'text-amber-700' :
                      'text-slate-400'
                    }`}>
                      #{item.rank}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{item.points} pts</span>
                    {item.streak > 0 && (
                      <span className="text-xs text-orange-500 flex items-center gap-0.5 font-medium">
                        <Flame size={12} className="fill-orange-500" /> {item.streak}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Your Badges</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Green Starter', desc: 'First footprint calculation', key: 'Green Starter' },
                { name: 'Eco Explorer', desc: 'Completed 3 challenges', key: 'Eco Explorer' },
                { name: 'Carbon Saver', desc: 'Saved 50kg CO2', key: 'Carbon Saver' },
                { name: 'Climate Champion', desc: 'Calculated score >= 80', key: 'Climate Champion' },
                { name: 'Net Zero Hero', desc: 'Saved 200kg CO2', key: 'Net Zero Hero' }
              ].map((badge) => {
                const unlocked = user?.badges.includes(badge.key);
                return (
                  <div 
                    key={badge.name} 
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                      unlocked 
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-500/20 text-slate-800 dark:text-white' 
                        : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      unlocked ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Award size={20} />
                    </div>
                    <p className="text-xs font-bold">{badge.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{badge.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity._id} className="flex gap-3 text-xs leading-relaxed">
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'calculation' ? 'bg-blue-500' :
                        activity.type === 'goal_completed' ? 'bg-emerald-500' :
                        'bg-purple-500'
                      }`}></div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-slate-700 dark:text-slate-300">{activity.description}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(activity.date).toLocaleDateString()}
                        {activity.pointsEarned > 0 && ` • +${activity.pointsEarned} points`}
                        {activity.co2Saved > 0 && ` • Saved ${activity.co2Saved}kg CO₂`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No recent activity logs.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
