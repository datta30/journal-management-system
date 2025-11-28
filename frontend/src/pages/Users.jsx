import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role?role=${newRole}`);
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/users/${userId}/toggle-status`);
      toast.success('Status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const getFilteredUsers = () => {
    let filtered = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(query) ||
        u.firstName?.toLowerCase().includes(query) ||
        u.lastName?.toLowerCase().includes(query)
      );
    }
    
    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    return filtered;
  };

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: { bg: '#fed7d7', color: '#c53030' },
      EDITOR: { bg: '#bee3f8', color: '#2b6cb0' },
      REVIEWER: { bg: '#c6f6d5', color: '#276749' },
      AUTHOR: { bg: '#feebc8', color: '#c05621' }
    };
    const style = colors[role] || { bg: '#e2e8f0', color: '#4a5568' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 500,
        background: style.bg,
        color: style.color
      }}>
        {role}
      </span>
    );
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system users and their roles</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Authors</div>
          <div className="stat-value">{users.filter(u => u.role === 'AUTHOR').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reviewers</div>
          <div className="stat-value">{users.filter(u => u.role === 'REVIEWER').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Editors</div>
          <div className="stat-value">{users.filter(u => u.role === 'EDITOR').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="action-bar">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="form-input form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="EDITOR">Editor</option>
          <option value="REVIEWER">Reviewer</option>
          <option value="AUTHOR">Author</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Institution</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.institution || '-'}</td>
                  <td>
                    <select
                      className="form-input form-select"
                      style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.85rem' }}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="AUTHOR">Author</option>
                      <option value="REVIEWER">Reviewer</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span 
                      className={`badge ${user.enabled ? 'badge-accepted' : 'badge-rejected'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
