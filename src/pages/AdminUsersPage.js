import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/Toast';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState(null);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/products');
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/approve`);
      fetchUsers();
      toast.success('User approved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const openRejectModal = (userId) => {
    setRejectUserId(userId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectUser = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please enter a rejection reason');
      return;
    }

    try {
      await axios.patch(`/admin/users/${rejectUserId}/reject`, { reason: rejectReason });
      fetchUsers();
      toast.success('User rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user');
    }
  };

  const openSuspendModal = (userId) => {
    setSuspendUserId(userId);
    setSuspendReason('');
    setShowSuspendModal(true);
  };

  const handleSuspendUser = async () => {
    if (!suspendReason.trim()) {
      toast.warning('Please enter a suspension reason');
      return;
    }

    try {
      await axios.patch(`/admin/users/${suspendUserId}/suspend`, { reason: suspendReason });
      fetchUsers();
      toast.success('User suspended successfully');
      setShowSuspendModal(false);
      setSuspendReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/activate`);
      fetchUsers();
      toast.success('User activated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    }
  };

  const openDeleteModal = (userId, userName) => {
    setDeleteUserId(userId);
    setDeleteUserName(userName);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/admin/users/${deleteUserId}`);
      fetchUsers();
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      APPROVED: 'bg-green-100 text-green-800 border-green-300',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      BLOCKED: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status) => {
    return status === 'BLOCKED' ? 'SUSPENDED' : status;
  };

  const formatAddress = (addressStr) => {
    if (!addressStr) return '';

    try {
      // Try to parse if it's JSON
      const addr = typeof addressStr === 'string' ? JSON.parse(addressStr) : addressStr;
      return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
    } catch (e) {
      // If not JSON, return as-is
      return addressStr;
    }
  };

  const filteredUsers = users
    .filter(u => filterStatus === 'ALL' || u.status === filterStatus)
    .filter(u =>
      searchTerm === '' ||
      u.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.primaryContactName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    total: users.length,
    approved: users.filter(u => u.status === 'APPROVED').length,
    pending: users.filter(u => u.status === 'PENDING').length,
    blocked: users.filter(u => u.status === 'BLOCKED').length,
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-gray-600 mb-6">Manage customer accounts and approvals</p>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Approval</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
              <div className="text-sm text-gray-600">Blocked/Suspended</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Search users by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="flex gap-2 overflow-x-auto">
              {['ALL', 'PENDING', 'APPROVED', 'BLOCKED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {status === 'BLOCKED' ? 'SUSPENDED' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `No users match your search: "${searchTerm}"`
                  : filterStatus === 'ALL'
                  ? 'No users registered yet'
                  : `No users with status: ${filterStatus}`}
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        {u.businessName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{u.businessName}</h3>
                        <p className="text-sm text-gray-600">{u.businessType?.replace('_', ' ')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(u.status)}`}>
                        {getStatusLabel(u.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Contact Person:</span>
                        <p className="font-semibold text-gray-900">{u.primaryContactName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-semibold text-gray-900">{u.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-semibold text-gray-900">{u.phone}</p>
                      </div>
                      {u.gstin && (
                        <div>
                          <span className="text-gray-500">GSTIN:</span>
                          <p className="font-mono text-sm font-semibold text-gray-900">{u.gstin}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Registered:</span>
                        <p className="font-semibold text-gray-900">{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <p className="font-semibold text-gray-900">{u.role}</p>
                      </div>
                    </div>

                    {u.businessAddress && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Address:</span>
                        <p className="text-gray-700">
                          {formatAddress(u.businessAddress)}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setShowModal(true);
                    }}
                    className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    👁 View
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                  {u.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApproveUser(u.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(u.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {u.status === 'APPROVED' && (
                    <button
                      onClick={() => openSuspendModal(u.id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition-colors"
                    >
                      ⏸ Suspend
                    </button>
                  )}

                  {u.status === 'BLOCKED' && (
                    <button
                      onClick={() => handleActivateUser(u.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
                    >
                      ▶ Activate
                    </button>
                  )}

                  {u.role !== 'ADMIN' && (
                    <button
                      onClick={() => openDeleteModal(u.id, u.businessName)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors ml-auto"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🏢</span>
                  Business Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-semibold">Business Name:</span>
                    <p className="text-gray-900 mt-1">{selectedUser.businessName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Business Type:</span>
                    <p className="text-gray-900 mt-1">{selectedUser.businessType?.replace('_', ' ')}</p>
                  </div>
                  {selectedUser.gstin && (
                    <div>
                      <span className="text-gray-600 font-semibold">GSTIN:</span>
                      <p className="text-gray-900 mt-1 font-mono">{selectedUser.gstin}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 font-semibold">Status:</span>
                    <p className="text-gray-900 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedUser.status)}`}>
                        {getStatusLabel(selectedUser.status)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📞</span>
                  Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-semibold">Contact Person:</span>
                    <p className="text-gray-900 mt-1">{selectedUser.primaryContactName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Email:</span>
                    <p className="text-gray-900 mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Phone:</span>
                    <p className="text-gray-900 mt-1">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Role:</span>
                    <p className="text-gray-900 mt-1">{selectedUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedUser.businessAddress && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📍</span>
                    Address
                  </h3>
                  <p className="text-gray-900">
                    {formatAddress(selectedUser.businessAddress)}
                  </p>
                </div>
              )}

              {/* Account Dates */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📅</span>
                  Account Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 font-semibold">Created:</span>
                    <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Last Updated:</span>
                    <p className="text-gray-900">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl animate-slide-in-right">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-t-lg">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-3">⏸</span>
                Suspend User
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Warning:</span> This will block the user from placing orders and accessing most features.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Suspension <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter a detailed reason for suspending this user..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows="4"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  {suspendReason.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspendReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendUser}
                  disabled={!suspendReason.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suspend User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject User Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl animate-slide-in-right">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-lg">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-3">✕</span>
                Reject User Application
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">Notice:</span> This will permanently block this user's application.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter a detailed reason for rejecting this application..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="4"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  {rejectReason.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectUser}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-in-right overflow-hidden">
            {/* Danger Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🗑️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Delete User</h2>
                  <p className="text-red-100 text-sm">Permanent action</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Critical Warning Box */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-900 font-bold text-lg mb-1">Are you absolutely sure?</h3>
                    <p className="text-red-800 text-sm leading-relaxed">
                      This action <span className="font-bold">cannot be undone</span>. This will permanently delete the user account.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">You are about to delete:</p>
                <p className="text-lg font-bold text-gray-900">{deleteUserName}</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Tip:</span> If this user has orders or RFQs, deletion will fail. Consider <span className="font-bold">suspending</span> instead.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteUserId(null);
                    setDeleteUserName('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all border-2 border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  Yes, Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
