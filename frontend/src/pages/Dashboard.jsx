import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myPapers, setMyPapers] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user's papers
      const papersRes = await api.get('/papers/my-papers');
      setMyPapers(papersRes.data);

      // Fetch reviews for reviewers/editors
      if (['REVIEWER', 'EDITOR', 'ADMIN'].includes(user?.role)) {
        const reviewsRes = await api.get('/reviews/my-pending');
        setMyReviews(reviewsRes.data);
      }

      // Fetch stats and all papers for editors/admins
      if (['EDITOR', 'ADMIN'].includes(user?.role)) {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);
        const allPapersRes = await api.get('/papers');
        setAllPapers(allPapersRes.data);
        const reviewersRes = await api.get('/users/reviewers/active');
        setReviewers(reviewersRes.data);
      }

      // Fetch users for admin
      if (user?.role === 'ADMIN') {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace('_', '-');
    return <span className={`badge badge-${statusClass}`}>{status.replace('_', ' ')}</span>;
  };

  // Editor/Admin: Update paper status
  const handleStatusChange = async (paperId, newStatus) => {
    try {
      await api.put(`/papers/${paperId}/status?status=${newStatus}`);
      toast.success(`Paper status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Editor/Admin: Assign reviewer
  const handleAssignReviewer = async (paperId, reviewerId) => {
    if (!reviewerId) return;
    try {
      await api.put(`/papers/${paperId}/assign-reviewer/${reviewerId}`);
      toast.success('Reviewer assigned successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign reviewer');
    }
  };

  // Admin: Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role?role=${newRole}`);
      toast.success(`User role updated to ${newRole}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  // Admin: Toggle user active status
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/toggle-status`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  // ADMIN DASHBOARD
  if (user?.role === 'ADMIN') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">🛡️ Admin Dashboard</h1>
          <p className="page-subtitle">Manage users, papers, and system settings</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-label">Total Papers</div>
              <div className="stat-value">{stats.totalPapers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Reviews</div>
              <div className="stat-value">{stats.pendingReviews}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Published</div>
              <div className="stat-value">{stats.publishedPapers}</div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h2 className="card-title">👥 User Management</h2>
            <Link to="/app/users" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map(u => (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                    <td>
                      <select 
                        className="form-input form-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="AUTHOR">AUTHOR</option>
                        <option value="REVIEWER">REVIEWER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.enabled ? 'badge-published' : 'badge-rejected'}`}>
                        {u.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn btn-sm ${u.enabled ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggleActive(u.id, u.enabled)}
                      >
                        {u.enabled ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paper Management */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📄 Paper Management</h2>
            <Link to="/app/papers" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Change Status</th>
                  <th>Assign Reviewer</th>
                </tr>
              </thead>
              <tbody>
                {allPapers.slice(0, 10).map(paper => (
                  <tr key={paper.id}>
                    <td>
                      <Link to={`/app/paper/${paper.id}`} style={{ color: '#3182ce' }}>
                        {paper.title?.length > 30 ? paper.title.substring(0, 30) + '...' : paper.title}
                      </Link>
                    </td>
                    <td>{paper.author?.firstName} {paper.author?.lastName}</td>
                    <td>{getStatusBadge(paper.status)}</td>
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                        value={paper.status}
                        onChange={(e) => handleStatusChange(paper.id, e.target.value)}
                      >
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                        <option value="REVISION_REQUESTED">REVISION_REQUESTED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                        onChange={(e) => handleAssignReviewer(paper.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">-- Assign --</option>
                        {reviewers.map(r => (
                          <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // EDITOR DASHBOARD
  if (user?.role === 'EDITOR') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">📝 Editor Dashboard</h1>
          <p className="page-subtitle">Manage paper submissions and review assignments</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-label">Total Papers</div>
              <div className="stat-value">{stats.totalPapers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Submitted</div>
              <div className="stat-value">{stats.submittedPapers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Under Review</div>
              <div className="stat-value">{stats.underReviewPapers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Published</div>
              <div className="stat-value">{stats.publishedPapers}</div>
            </div>
          </div>
        )}

        {/* My Pending Reviews */}
        {myReviews.length > 0 && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h2 className="card-title">⏳ My Pending Reviews</h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Paper</th>
                    <th>Due Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myReviews.map(review => (
                    <tr key={review.id}>
                      <td>{review.paperTitle}</td>
                      <td>{review.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'No deadline'}</td>
                      <td>
                        <Link to={`/app/review/${review.id}`} className="btn btn-primary btn-sm">Review Now</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paper Workflow Management */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Paper Workflow</h2>
            <Link to="/app/papers" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Assign Reviewer</th>
                </tr>
              </thead>
              <tbody>
                {allPapers.filter(p => p.status !== 'PUBLISHED').slice(0, 10).map(paper => (
                  <tr key={paper.id}>
                    <td>
                      <Link to={`/app/paper/${paper.id}`} style={{ color: '#3182ce' }}>
                        {paper.title?.length > 30 ? paper.title.substring(0, 30) + '...' : paper.title}
                      </Link>
                    </td>
                    <td>{paper.author?.firstName} {paper.author?.lastName}</td>
                    <td>{getStatusBadge(paper.status)}</td>
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                        value={paper.status}
                        onChange={(e) => handleStatusChange(paper.id, e.target.value)}
                      >
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                        <option value="REVISION_REQUESTED">REVISION_REQUESTED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                        onChange={(e) => handleAssignReviewer(paper.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">-- Assign --</option>
                        {reviewers.map(r => (
                          <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // REVIEWER DASHBOARD
  if (user?.role === 'REVIEWER') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">🔍 Reviewer Dashboard</h1>
          <p className="page-subtitle">Review assigned papers and submit your evaluations</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-label">Pending Reviews</div>
            <div className="stat-value">{myReviews.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">My Papers</div>
            <div className="stat-value">{myPapers.length}</div>
          </div>
        </div>

        {/* Pending Reviews - Main Focus */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h2 className="card-title">📝 Assigned Papers for Review</h2>
            <Link to="/app/reviews" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          
          {myReviews.length === 0 ? (
            <div className="empty-state">
              <p>No papers assigned for review at the moment.</p>
              <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '8px' }}>
                Check back later for new assignments.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px', padding: '16px 0' }}>
              {myReviews.map(review => (
                <div key={review.id} style={{
                  padding: '20px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2d3748' }}>
                        {review.paperTitle}
                      </h3>
                      <p style={{ color: '#718096', fontSize: '0.9rem', margin: '8px 0' }}>
                        Due: {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'No deadline set'}
                      </p>
                    </div>
                    <Link to={`/app/review/${review.id}`} className="btn btn-primary">
                      Submit Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Own Papers */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📄 My Submitted Papers</h2>
            <Link to="/app/submit-paper" className="btn btn-primary btn-sm">+ New Paper</Link>
          </div>
          {myPapers.length === 0 ? (
            <div className="empty-state">
              <p>You haven't submitted any papers yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Version</th>
                  </tr>
                </thead>
                <tbody>
                  {myPapers.slice(0, 5).map(paper => (
                    <tr key={paper.id}>
                      <td>
                        <Link to={`/app/paper/${paper.id}`} style={{ color: '#3182ce' }}>
                          {paper.title?.length > 40 ? paper.title.substring(0, 40) + '...' : paper.title}
                        </Link>
                      </td>
                      <td>{getStatusBadge(paper.status)}</td>
                      <td>v{paper.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AUTHOR DASHBOARD (Default)
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.firstName}!</h1>
        <p className="page-subtitle">Manage your research paper submissions</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">Total Papers</div>
          <div className="stat-value">{myPapers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Under Review</div>
          <div className="stat-value">{myPapers.filter(p => p.status === 'UNDER_REVIEW').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accepted</div>
          <div className="stat-value">{myPapers.filter(p => p.status === 'ACCEPTED').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value">{myPapers.filter(p => p.status === 'PUBLISHED').length}</div>
        </div>
      </div>

      {/* My Papers */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My Papers</h2>
          <Link to="/app/submit-paper" className="btn btn-primary btn-sm">+ New Paper</Link>
        </div>
        
        {myPapers.length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any papers yet.</p>
            <Link to="/app/submit-paper" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Submit Your First Paper
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myPapers.map(paper => (
                  <tr key={paper.id}>
                    <td>
                      <Link to={`/app/paper/${paper.id}`} style={{ color: '#3182ce', textDecoration: 'none' }}>
                        {paper.title?.length > 40 ? paper.title.substring(0, 40) + '...' : paper.title}
                      </Link>
                    </td>
                    <td>{getStatusBadge(paper.status)}</td>
                    <td>v{paper.version}</td>
                    <td>{new Date(paper.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/app/paper/${paper.id}`} className="btn btn-secondary btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2 className="card-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
          <Link to="/app/submit-paper" className="btn btn-primary">Submit New Paper</Link>
          <Link to="/app/my-papers" className="btn btn-secondary">View All Papers</Link>
          <Link to="/" className="btn btn-secondary">Browse Published Papers</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
