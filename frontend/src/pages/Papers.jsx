import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [editors, setEditors] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPapers();
  }, [papers, searchQuery, statusFilter]);

  const fetchData = async () => {
    try {
      const [papersRes, reviewersRes, editorsRes] = await Promise.all([
        api.get('/papers'),
        api.get('/users/reviewers/active'),
        api.get('/users/role/EDITOR')
      ]);
      setPapers(papersRes.data);
      setReviewers(reviewersRes.data);
      setEditors(editorsRes.data);
    } catch (error) {
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const filterPapers = () => {
    let filtered = [...papers];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.author?.firstName?.toLowerCase().includes(query) ||
        p.author?.lastName?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    setFilteredPapers(filtered);
  };

  const handleAssign = async (userId) => {
    try {
      if (assignType === 'editor') {
        await api.put(`/papers/${selectedPaper.id}/assign-editor/${userId}`);
        toast.success('Editor assigned successfully');
      } else {
        await api.put(`/papers/${selectedPaper.id}/assign-reviewer/${userId}`);
        toast.success('Reviewer assigned successfully');
      }
      fetchData();
      setShowAssignModal(false);
      setSelectedPaper(null);
    } catch (error) {
      toast.error('Failed to assign');
    }
  };

  const handleUpdateStatus = async (paperId, status) => {
    try {
      await api.put(`/papers/${paperId}/status?status=${status}`);
      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace('_', '-');
    return <span className={`badge badge-${statusClass}`}>{status.replace('_', ' ')}</span>;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Papers</h1>
        <p className="page-subtitle">Manage submitted papers and assign reviewers</p>
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
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="form-input form-select"
          style={{ width: 'auto', minWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="REVISION_REQUIRED">Revision Required</option>
          <option value="REVISED">Revised</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {/* Papers Table */}
      <div className="card">
        {filteredPapers.length === 0 ? (
          <div className="empty-state">
            <p>No papers found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Plagiarism</th>
                  <th>Editor</th>
                  <th>Reviewers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.map(paper => (
                  <tr key={paper.id}>
                    <td>
                      <Link to={`/app/paper/${paper.id}`} style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 500 }}>
                        {paper.title.length > 40 ? paper.title.substring(0, 40) + '...' : paper.title}
                      </Link>
                    </td>
                    <td>{paper.author?.firstName} {paper.author?.lastName}</td>
                    <td>{getStatusBadge(paper.status)}</td>
                    <td>v{paper.version}</td>
                    <td>
                      {paper.plagiarismScore !== null ? (
                        <span className={`plagiarism-score ${paper.plagiarismScore < 10 ? 'low' : paper.plagiarismScore < 20 ? 'medium' : 'high'}`}
                              style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {paper.plagiarismScore.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {paper.assignedEditor ? (
                        <span>{paper.assignedEditor.firstName} {paper.assignedEditor.lastName}</span>
                      ) : (
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setSelectedPaper(paper);
                            setAssignType('editor');
                            setShowAssignModal(true);
                          }}
                        >
                          Assign
                        </button>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{paper.assignedReviewers?.length || 0}</span>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setSelectedPaper(paper);
                            setAssignType('reviewer');
                            setShowAssignModal(true);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.85rem' }}
                        value={paper.status}
                        onChange={(e) => handleUpdateStatus(paper.id, e.target.value)}
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="REVISION_REQUIRED">Revision Required</option>
                        <option value="REVISED">Revised</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Assign {assignType === 'editor' ? 'Editor' : 'Reviewer'}
              </h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px' }}>
                Select {assignType === 'editor' ? 'an editor' : 'a reviewer'} for: <strong>{selectedPaper?.title}</strong>
              </p>
              
              {assignType === 'reviewer' && selectedPaper?.assignedReviewers?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 500, marginBottom: '8px' }}>Currently assigned:</p>
                  {selectedPaper.assignedReviewers.map(r => (
                    <span key={r.id} className="badge badge-submitted" style={{ marginRight: '8px' }}>
                      {r.firstName} {r.lastName}
                    </span>
                  ))}
                </div>
              )}
              
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {(assignType === 'editor' ? editors : reviewers).map(user => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>{user.institution}</div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAssign(user.id)}
                      disabled={selectedPaper?.assignedReviewers?.some(r => r.id === user.id)}
                    >
                      {selectedPaper?.assignedReviewers?.some(r => r.id === user.id) ? 'Assigned' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Papers;
