"use client";

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { InternLogbook } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { 
  GraduationCap, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  BookOpen, 
  Target, 
  Lightbulb, 
  HelpCircle,
  Mail,
  UserCheck
} from 'lucide-react';

export default function InternLogbookSection() {
  const { currentUser, logbooks, submitLogbook, reviewLogbook, role } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab state for weeks
  const [selectedWeekTab, setSelectedWeekTab] = useState<number>(42);

  // Form fields
  const [milestonesCompleted, setMilestonesCompleted] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [learnings, setLearnings] = useState('');
  const [blockers, setBlockers] = useState('');

  const [feedbackInput, setFeedbackInput] = useState<{ [id: string]: string }>({});

  const userLogbooks = currentUser?.role === 'INTERN' 
    ? logbooks.filter(l => l.internId === currentUser.id)
    : logbooks;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestonesCompleted.trim() || !tasksCompleted.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please fill in key goals and tasks completed.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await submitLogbook({
        weekNumber: selectedWeekTab,
        milestonesCompleted,
        tasksCompleted,
        learnings,
        blockers,
      });

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        setMilestonesCompleted('');
        setTasksCompleted('');
        setLearnings('');
        setBlockers('');
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewAction = async (logId: string, status: 'APPROVED' | 'NEEDS_REVISION') => {
    const feedback = feedbackInput[logId] || "Approved by Mentor. Good work!";
    await reviewLogbook(logId, status, feedback);
    setFeedbackMsg({ type: 'success', text: `Logbook marked as ${status === 'APPROVED' ? 'Reviewed / Approved' : 'Needs Revision'}` });
  };

  return (
    <div className="space-y-6">
      
      {/* Assigned Mentor Card (Top Right / Banner) */}
      {currentUser?.role === 'INTERN' && currentUser.mentorName && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Assigned Senior Mentor
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{currentUser.mentorName}</h3>
              <p className="text-xs text-slate-500">{currentUser.mentorRole} ({currentUser.mentorEmail})</p>
            </div>
          </div>

          <a
            href={`mailto:${currentUser.mentorEmail || 'mentor@techcorp.io'}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Email Mentor</span>
          </a>
        </div>
      )}

      {/* Weekly Logbook & Progress Module (Tabbed View for Weeks) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        {/* Module Header & Week Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Weekly Logbook & Progress Module</h3>
            <p className="text-xs text-slate-500">Record weekly deliverables, lessons learned, and submit for mentor evaluation</p>
          </div>

          {/* Week Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
            {[40, 41, 42, 43].map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => setSelectedWeekTab(week)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedWeekTab === week
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Week {week - 39} (W{week})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form inputs (Left 6 cols for Intern) */}
          {currentUser?.role === 'INTERN' && (
            <div className="lg:col-span-6 space-y-4">
              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    Weekly Goals & Tasks Completed (Week {selectedWeekTab - 39})
                  </label>
                  <textarea
                    rows={3}
                    value={tasksCompleted}
                    onChange={(e) => setTasksCompleted(e.target.value)}
                    placeholder="1. Completed HRM map integration&#10;2. Configured role switcher navbar..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono text-[11px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Sprint Milestones Delivered
                  </label>
                  <input
                    type="text"
                    value={milestonesCompleted}
                    onChange={(e) => setMilestonesCompleted(e.target.value)}
                    placeholder="e.g. Shipped responsive split pane dashboard layout"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    Key Learnings & Insights
                  </label>
                  <textarea
                    rows={2}
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    placeholder="What new concepts or tools did you master this week?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                    Blockers / Assistance Needed
                  </label>
                  <input
                    type="text"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="Any impediments or questions for your mentor? (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Week {selectedWeekTab - 39} Logbook</span>
                    </>
                  )}
                </button>

                {feedbackMsg && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{feedbackMsg.text}</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Submissions List & Mentor Review status (Right 6 cols) */}
          <div className={`${currentUser?.role === 'INTERN' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3`}>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Logged Reports & Reviews
            </span>

            {userLogbooks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No weekly logbook entries found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {userLogbooks.map((log) => {
                  const isApproved = log.status === 'APPROVED';
                  const isUnderReview = log.status === 'UNDER_REVIEW';

                  return (
                    <div key={log.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                      
                      {/* Header with Status Tag: Draft, Submitted / Under Review, Reviewed by Mentor */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div>
                          <span className="font-bold text-xs text-slate-900">Week {log.weekNumber} Logbook</span>
                          <span className="text-[11px] text-slate-500 ml-1.5">• {log.internName}</span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isApproved 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : isUnderReview
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {isApproved ? 'Reviewed by Mentor' : isUnderReview ? 'Submitted / Under Review' : 'Draft'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Tasks & Goals:</span>
                          <p className="text-slate-800 whitespace-pre-wrap font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                            {log.tasksCompleted}
                          </p>
                        </div>

                        {log.learnings && (
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Learnings:</span>
                            <p className="text-slate-700 mt-0.5">{log.learnings}</p>
                          </div>
                        )}

                        {log.mentorFeedback && (
                          <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg text-xs space-y-0.5">
                            <span className="font-bold text-indigo-900 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                              Mentor Evaluation:
                            </span>
                            <p className="text-indigo-800 italic">"{log.mentorFeedback}"</p>
                          </div>
                        )}
                      </div>

                      {/* Mentor Approval controls if viewing in mentor/admin mode */}
                      {role !== 'INTERN' && isUnderReview && (
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <input
                            type="text"
                            placeholder="Add evaluation feedback / comments..."
                            value={feedbackInput[log.id] || ''}
                            onChange={(e) => setFeedbackInput({ ...feedbackInput, [log.id]: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReviewAction(log.id, 'NEEDS_REVISION')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                            >
                              Request Changes
                            </button>
                            <button
                              onClick={() => handleReviewAction(log.id, 'APPROVED')}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                            >
                              Approve Logbook
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
