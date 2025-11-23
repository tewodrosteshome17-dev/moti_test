import React, { useState, useEffect } from 'react';
import { Request, RequestType, RequestStatus, User } from '../types';
import { getRequests, updateRequestStatus, getUsers, seedDatabase, resetDatabase } from '../services/storageService';
import { Button } from '../components/ui/Button';
import { Check, X, Filter, Database, Trash2, RefreshCw } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'database'>('requests');
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = () => {
    // Refresh Requests
    const allRequests = getRequests();
    setRequests(allRequests.sort((a, b) => {
        if (a.status === RequestStatus.PENDING && b.status !== RequestStatus.PENDING) return -1;
        if (a.status !== RequestStatus.PENDING && b.status === RequestStatus.PENDING) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));

    // Refresh Users
    setUsers(getUsers());
  };

  const handleAction = (id: string, status: RequestStatus) => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) {
        updateRequestStatus(id, status);
        refreshData();
    }
  };

  const handleSeed = () => {
      seedDatabase();
      refreshData();
      alert('Database seeded with dummy data (John, Jane, Mike) and requests.');
  };

  const handleReset = () => {
      if(window.confirm('WARNING: This will delete ALL users and requests. The admin account will be reset. Continue?')) {
          resetDatabase();
      }
  };

  const filteredRequests = filter === 'ALL' 
    ? requests 
    : requests.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration Panel</h1>
          <p className="text-gray-500">Manage employee requests and system data.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button 
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'requests' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('requests')}
        >
            Request Management
        </button>
        <button 
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'database' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('database')}
        >
            Database View
        </button>
      </div>

      {activeTab === 'requests' ? (
        <>
            <div className="flex justify-end">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    <Filter className="w-4 h-4 ml-2 text-gray-400" />
                    <select 
                        className="bg-transparent border-none text-sm focus:ring-0 text-gray-600"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                    >
                        <option value="ALL">All Requests</option>
                        <option value={RequestStatus.PENDING}>Pending</option>
                        <option value={RequestStatus.APPROVED}>Approved</option>
                        <option value={RequestStatus.REJECTED}>Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-medium">Employee</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Details</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredRequests.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                        </tr>
                    ) : (
                        filteredRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                <p className="font-medium text-gray-900">{req.userName}</p>
                                <p className="text-xs text-gray-500">ID: {req.employeeId}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                ${req.type === RequestType.LEAVE ? 'bg-orange-50 text-orange-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                {req.type}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-gray-600">
                                {req.type === RequestType.LEAVE ? (
                                    <>
                                    <p><span className="font-medium">Dates:</span> {req.details.startDate} - {req.details.endDate}</p>
                                    <p className="text-xs mt-1 text-gray-500">{req.details.reason} ({req.details.district})</p>
                                    </>
                                ) : (
                                    <>
                                    <p><span className="font-medium">OT:</span> {req.details.otHours}hrs on {req.details.otDate}</p>
                                    <p className="text-xs mt-1 text-gray-500">{req.details.reason} ({req.details.bank})</p>
                                    </>
                                )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                                    req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'}`}>
                                {req.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {req.status === RequestStatus.PENDING && (
                                <div className="flex items-center justify-end gap-2">
                                    <Button 
                                        variant="success" 
                                        className="p-1 px-3 text-xs"
                                        onClick={() => handleAction(req.id, RequestStatus.APPROVED)}
                                    >
                                        <Check className="w-3 h-3 mr-1 inline" /> Approve
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        className="p-1 px-3 text-xs"
                                        onClick={() => handleAction(req.id, RequestStatus.REJECTED)}
                                    >
                                        <X className="w-3 h-3 mr-1 inline" /> Reject
                                    </Button>
                                </div>
                                )}
                            </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </>
      ) : (
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary-600" />
                      Database Actions
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                      Use these tools to manage the simulated database state. Seeding adds dummy users and requests for testing.
                  </p>
                  <div className="flex gap-4">
                      <Button onClick={handleSeed} variant="primary" className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Seed Dummy Data
                      </Button>
                      <Button onClick={handleReset} variant="danger" className="flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Reset Database
                      </Button>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Registered Users Table</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Employee ID</th>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Role</th>
                                <th className="px-6 py-3 font-medium">Joined Date</th>
                                <th className="px-6 py-3 font-medium">Stats (Leave/OT)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-mono text-gray-600">{u.employeeId}</td>
                                    <td className="px-6 py-3 font-medium text-gray-900">{u.name}</td>
                                    <td className="px-6 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{new Date(u.joinedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-3 text-gray-600">
                                        {u.leaveDays}d / {u.otHours}h
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};