import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paper, setPaper] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionData, setRevisionData] = useState({
    changesSummary: '',
    authorResponse: '',
    file: null
  });

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      const [paperRes, revisionsRes] = await Promise.all([
        api.get(`/papers/${id}`),
        api.get(`/papers/${id}/revisions`)
      ]);
      setPaper(paperRes.data);
      setRevisions(revisionsRes.data);
    } catch (error) {
      toast.error('Failed to fetch paper details');
      navigate('/app/my-papers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('changesSummary', revisionData.changesSummary);
    formData.append('authorResponse', revisionData.authorResponse);
    if (revisionData.file) {
      formData.append('file', revisionData.file);
    }

    try {
      await api.post(`/papers/${id}/revision`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Revision submitted successfully');
      setShowRevisionModal(false);
      fetchPaper();
    } catch (error) {
      toast.error('Failed to submit revision');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this paper?')) {
      try {
        await api.delete(`/papers/${id}`);
        toast.success('Paper deleted successfully');
        navigate('/app/my-papers');
      } catch (error) {
        toast.error('Failed to delete paper');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace('_', '-');
    return <span className={`badge badge-${statusClass}`}>{status?.replace('_', ' ')}</span>;
  };

  const canEdit = () => {
    return paper?.author?.id === user?.id && 
           ['SUBMITTED', 'REVISION_REQUIRED'].includes(paper?.status);
  };

  const canSubmitRevision = () => {
    return paper?.author?.id === user?.id && paper?.status === 'REVISION_REQUIRED';
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!paper) {
    return <div>Paper not found</div>;
  }

  return (
    <div className="paper-detail">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{paper.title}</h1>
            <p className="page-subtitle">
              Submitted by {paper.author?.firstName} {paper.author?.lastName}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {canEdit() && (
              <Link to={`/app/paper/${id}/edit`} className="btn btn-secondary">Edit</Link>
            )}
            {canSubmitRevision() && (
              <button className="btn btn-primary" onClick={() => setShowRevisionModal(true)}>
                Submit Revision
              </button>
            )}
            {(paper.author?.id === user?.id || user?.role === 'ADMIN') && (
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            )}
          </div>
        </div>
      </div>

      {/* Paper Info */}
      <div className="card">
        <div className="paper-meta">
          <div className="meta-item">
            <div className="meta-label">Status</div>
            <div className="meta-value">{getStatusBadge(paper.status)}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Version</div>
            <div className="meta-value">v{paper.version}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Submitted</div>
            <div className="meta-value">
              {new Date(paper.submittedAt).toLocaleDateString()}
            </div>
          </div>
          {paper.publishedAt && (
            <div className="meta-item">
              <div className="meta-label">Published</div>
              <div className="meta-value">
                {new Date(paper.publishedAt).toLocaleDateString()}
              </div>
            </div>
          )}
          <div className="meta-item">
            <div className="meta-label">Keywords</div>
            <div className="meta-value">{paper.keywords || 'None'}</div>
          </div>
        </div>

        <div className="paper-abstract">
          <h4>Abstract</h4>
          <p>{paper.abstractText}</p>
        </div>

        {paper.fileName && (
          <div style={{ marginTop: '16px' }}>
            <strong>Attached File:</strong> {paper.fileName}
          </div>
        )}
      </div>

      {/* Plagiarism Report */}
      {paper.plagiarismScore !== null && (
        <div className="card">
          <h3 className="card-title">Plagiarism Report</h3>
          <div className="plagiarism-report">
            <div className={`plagiarism-score ${paper.plagiarismScore < 10 ? 'low' : paper.plagiarismScore < 20 ? 'medium' : 'high'}`}>
              {paper.plagiarismScore.toFixed(1)}% Similarity
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
              {paper.plagiarismReport}
            </pre>
          </div>
        </div>
      )}

      {/* Editor Comments */}
      {paper.editorComments && (
        <div className="card">
          <h3 className="card-title">Editor Comments</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{paper.editorComments}</p>
        </div>
      )}

      {/* Assigned Reviewers */}
      {paper.assignedReviewers?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Assigned Reviewers</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {paper.assignedReviewers.map(reviewer => (
              <div key={reviewer.id} style={{ 
                padding: '12px 16px', 
                background: '#f7fafc', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontWeight: 500 }}>
                  {reviewer.firstName} {reviewer.lastName}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                  {reviewer.institution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {paper.reviews?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Reviews</h3>
          <div className="reviews-list">
            {paper.reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <strong>{review.reviewer?.firstName} {review.reviewer?.lastName}</strong>
                    <span style={{ marginLeft: '12px' }}>{getStatusBadge(review.status)}</span>
                  </div>
                  {review.recommendation && (
                    <span className={`badge ${review.recommendation === 'ACCEPT' ? 'badge-accepted' : 
                      review.recommendation === 'REJECT' ? 'badge-rejected' : 'badge-under-review'}`}>
                      {review.recommendation.replace('_', ' ')}
                    </span>
                  )}
                </div>
                
                {review.status === 'COMPLETED' && (
                  <>
                    <div className="review-scores">
                      <div className="score-item">
                        <div className="score-label">Quality</div>
                        <div className="score-value">{review.qualityScore}/10</div>
                      </div>
                      <div className="score-item">
                        <div className="score-label">Originality</div>
                        <div className="score-value">{review.originalityScore}/10</div>
                      </div>
                      <div className="score-item">
                        <div className="score-label">Clarity</div>
                        <div className="score-value">{review.clarityScore}/10</div>
                      </div>
                      <div className="score-item">
                        <div className="score-label">Significance</div>
                        <div className="score-value">{review.significanceScore}/10</div>
                      </div>
                      <div className="score-item" style={{ background: '#3182ce', color: 'white' }}>
                        <div className="score-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Average</div>
                        <div className="score-value">{review.averageScore?.toFixed(1)}/10</div>
                      </div>
                    </div>
                    
                    {review.comments && (
                      <div style={{ marginTop: '12px' }}>
                        <strong>Comments:</strong>
                        <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{review.comments}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision History */}
      {revisions.length > 0 && (
        <div className="card">
          <h3 className="card-title">Revision History</h3>
          <div className="revision-list">
            {revisions.map(revision => (
              <div key={revision.id} className="revision-item">
                <div className="revision-number">v{revision.versionNumber}</div>
                <div className="revision-content">
                  <div style={{ fontWeight: 500, marginBottom: '8px' }}>
                    {new Date(revision.createdAt).toLocaleString()}
                  </div>
                  {revision.changesSummary && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Changes:</strong> {revision.changesSummary}
                    </div>
                  )}
                  {revision.authorResponse && (
                    <div>
                      <strong>Response to reviewers:</strong> {revision.authorResponse}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="modal-overlay" onClick={() => setShowRevisionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Submit Revision</h3>
              <button className="modal-close" onClick={() => setShowRevisionModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitRevision}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Summary of Changes *</label>
                  <textarea
                    className="form-input form-textarea"
                    value={revisionData.changesSummary}
                    onChange={(e) => setRevisionData({...revisionData, changesSummary: e.target.value})}
                    required
                    placeholder="Describe the changes made in this revision..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Response to Reviewers</label>
                  <textarea
                    className="form-input form-textarea"
                    value={revisionData.authorResponse}
                    onChange={(e) => setRevisionData({...revisionData, authorResponse: e.target.value})}
                    placeholder="Address the reviewers' comments..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Upload Revised Paper</label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={(e) => setRevisionData({...revisionData, file: e.target.files[0]})}
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRevisionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Submit Revision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetail;
