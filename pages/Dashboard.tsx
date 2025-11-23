import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Request, RequestType, RequestStatus } from '../types';
import { getRequests, saveRequest } from '../services/storageService';
import { DISTRICTS, BANKS } from '../constants';
import { Button } from '../components/ui/Button';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'leave' | 'ot'>('overview');
  
  // Form States
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveDistrict, setLeaveDistrict] = useState(DISTRICTS[0]);
  const [leaveReason, setLeaveReason] = useState('');
  
  const [otDate, setOtDate] = useState('');
  const [otHours, setOtHours] = useState('');
  const [otBank, setOtBank] = useState(BANKS[0]);
  const [otDistrict, setOtDistrict] = useState(DISTRICTS[0]);
  const [otReason, setOtReason] = useState('');

  useEffect(() => {
    if (user) {
      const allRequests = getRequests();
      const userRequests = allRequests.filter(r => r.userId === user.id);
      // Sort by latest
      setRequests(userRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, [user, activeTab]);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newRequest: Request = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      employeeId: user.employeeId,
      type: RequestType.LEAVE,
      status: RequestStatus.PENDING,
      date: new Date().toISOString(),
      details: {
        startDate: leaveStart,
        endDate: leaveEnd,
        district: leaveDistrict,
        reason: leaveReason
      },
      createdAt: new Date().toISOString()
    };
    
    saveRequest(newRequest);
    setRequests(prev => [newRequest, ...prev]);
    setActiveTab('overview');
    alert('Leave request submitted successfully!');
    // Reset form
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
  };

  const handleOtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newRequest: Request = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      employeeId: user.employeeId,
      type: RequestType.OVERTIME,
      status: RequestStatus.PENDING,
      date: new Date().toISOString(),
      details: {
        otDate: otDate,
        otHours: Number(otHours),
        bank: otBank,
        district: otDistrict,
        reason: otReason
      },
      createdAt: new Date().toISOString()
    };

    saveRequest(newRequest);
    setRequests(prev => [newRequest, ...prev]);
    setActiveTab('overview');
    alert('Overtime request submitted successfully!');
    // Reset
    setOtDate('');
    setOtHours('');
    setOtReason('');
  };

  const StatusIcon = ({ status }: { status: RequestStatus }) => {
    switch (status) {
      case RequestStatus.APPROVED: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case RequestStatus.REJECTED: return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const chartData = [
    { name: 'Pending', value: requests.filter(r => r.status === RequestStatus.PENDING).length },
    { name: 'Approved', value: requests.filter(r => r.status === RequestStatus.APPROVED).length },
    { name: 'Rejected', value: requests.filter(r => r.status === RequestStatus.REJECTED).length },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
          <p className="text-gray-500">Here's what's happening with your account today.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => setActiveTab('leave')} variant={activeTab === 'leave' ? 'primary' : 'secondary'}>
                <Plus className="w-4 h-4 mr-2 inline" />
                New Leave
            </Button>
            <Button onClick={() => setActiveTab('ot')} variant={activeTab === 'ot' ? 'primary' : 'secondary'}>
                <Plus className="w-4 h-4 mr-2 inline" />
                New OT
            </Button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Annual Leave Balance</h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">{user.leaveDays}</span>
                <span className="ml-2 text-sm text-gray-500">days available</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total OT Hours</h3>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">{user.otHours}</span>
                <span className="ml-2 text-sm text-gray-500">hours approved</span>
              </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Request Status Overview</h3>
                <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" hide />
                            <Tooltip />
                            <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity History</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No recent activity.</div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${req.type === RequestType.LEAVE ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {req.type === RequestType.LEAVE ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {req.type === RequestType.LEAVE ? 'Annual Leave Request' : 'Overtime Request'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {req.type === RequestType.LEAVE 
                            ? `${req.details.startDate} to ${req.details.endDate}` 
                            : `${req.details.otHours} hours on ${req.details.otDate}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">District: {req.details.district}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                          req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'leave' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">New Annual Leave Request</h2>
                <Button variant="secondary" onClick={() => setActiveTab('overview')}>Cancel</Button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input required type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input required type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select value={leaveDistrict} onChange={e => setLeaveDistrict(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border">
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea required value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows={3} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border" placeholder="e.g. Family vacation" />
                </div>
                <div className="pt-4">
                    <Button type="submit" fullWidth>Submit Application</Button>
                </div>
            </form>
        </div>
      )}

      {activeTab === 'ot' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">New Overtime Request</h2>
                <Button variant="secondary" onClick={() => setActiveTab('overview')}>Cancel</Button>
            </div>
            <form onSubmit={handleOtSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input required type="date" value={otDate} onChange={e => setOtDate(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                        <input required type="number" min="0.5" step="0.5" value={otHours} onChange={e => setOtHours(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <select value={otDistrict} onChange={e => setOtDistrict(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border">
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                        <select value={otBank} onChange={e => setOtBank(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border">
                            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea required value={otReason} onChange={e => setOtReason(e.target.value)} rows={3} className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border" placeholder="e.g. Project deadline" />
                </div>
                <div className="pt-4">
                    <Button type="submit" fullWidth>Submit Request</Button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};