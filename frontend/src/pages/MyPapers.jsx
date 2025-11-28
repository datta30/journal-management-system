import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const MyPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await api.get('/papers/my-papers');
      setPapers(response.data);
    } catch (error) {
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this paper?')) {
      try {
        await api.delete(`/papers/${id}`);
        toast.success('Paper deleted successfully');
        fetchPapers();
      } catch (error) {
        toast.error('Failed to delete paper');
      }
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
        <h1 className="page-title">My Papers</h1>
        <p className="page-subtitle">View and manage your submitted papers</p>
      </div>

      <div className="action-bar">
        <div></div>
        <Link to="/app/submit-paper" className="btn btn-primary">
          + Submit New Paper
        </Link>
      </div>

      <div className="card">
        {papers.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h3>No papers yet</h3>
            <p>You haven't submitted any papers. Start by submitting your first research paper.</p>
            <Link to="/app/submit-paper" className="btn btn-primary" style={{ marginTop: '16px' }}>
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
                  <th>Plagiarism Score</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map(paper => (
                  <tr key={paper.id}>
                    <td>
                      <Link to={`/app/paper/${paper.id}`} style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 500 }}>
                        {paper.title}
                      </Link>
                    </td>
                    <td>{getStatusBadge(paper.status)}</td>
                    <td>v{paper.version}</td>
                    <td>
                      {paper.plagiarismScore !== null ? (
                        <span className={paper.plagiarismScore < 10 ? 'plagiarism-score low' : paper.plagiarismScore < 20 ? 'plagiarism-score medium' : 'plagiarism-score high'}
                              style={{ fontWeight: 600 }}>
                          {paper.plagiarismScore.toFixed(1)}%
                        </span>
                      ) : 'Pending'}
                    </td>
                    <td>{new Date(paper.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/app/paper/${paper.id}`} className="btn btn-secondary btn-sm">
                          View
                        </Link>
                        {['SUBMITTED', 'REVISION_REQUIRED'].includes(paper.status) && (
                          <Link to={`/app/paper/${paper.id}/edit`} className="btn btn-secondary btn-sm">
                            Edit
                          </Link>
                        )}
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(paper.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPapers;
