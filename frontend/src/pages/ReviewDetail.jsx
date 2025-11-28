import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    qualityScore: '',
    originalityScore: '',
    clarityScore: '',
    significanceScore: '',
    comments: '',
    confidentialComments: '',
    recommendation: ''
  });

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const reviewRes = await api.get(`/reviews/${id}`);
      const reviewData = reviewRes.data;
      setReview(reviewData);
      
      const paperRes = await api.get(`/papers/${reviewData.paperId}`);
      setPaper(paperRes.data);
      
      // Pre-fill form if review has data
      setFormData({
        qualityScore: reviewData.qualityScore || '',
        originalityScore: reviewData.originalityScore || '',
        clarityScore: reviewData.clarityScore || '',
        significanceScore: reviewData.significanceScore || '',
        comments: reviewData.comments || '',
        confidentialComments: reviewData.confidentialComments || '',
        recommendation: reviewData.recommendation || ''
      });
    } catch (error) {
      toast.error('Failed to fetch review');
      navigate('/app/reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStartReview = async () => {
    try {
      await api.put(`/reviews/${id}/start`);
      toast.success('Review started');
      fetchReview();
    } catch (error) {
      toast.error('Failed to start review');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Validate scores
    const scores = ['qualityScore', 'originalityScore', 'clarityScore', 'significanceScore'];
    for (const score of scores) {
      const value = parseInt(formData[score]);
      if (isNaN(value) || value < 1 || value > 10) {
        toast.error(`${score.replace('Score', '')} score must be between 1 and 10`);
        return;
      }
    }
    
    if (!formData.recommendation) {
      toast.error('Please select a recommendation');
      return;
    }

    setSubmitting(true);
    
    try {
      await api.put(`/reviews/${id}/submit`, {
        ...formData,
        qualityScore: parseInt(formData.qualityScore),
        originalityScore: parseInt(formData.originalityScore),
        clarityScore: parseInt(formData.clarityScore),
        significanceScore: parseInt(formData.significanceScore)
      });
      toast.success('Review submitted successfully');
      navigate('/app/reviews');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace('_', '-');
    return <span className={`badge badge-${statusClass}`}>{status?.replace('_', ' ')}</span>;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const isCompleted = review?.status === 'COMPLETED';
  const canReview = ['PENDING', 'IN_PROGRESS'].includes(review?.status);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Review Paper</h1>
            <p className="page-subtitle">{paper?.title}</p>
          </div>
          <div>
            {getStatusBadge(review?.status)}
          </div>
        </div>
      </div>

      {/* Paper Details */}
      <div className="card">
        <h3 className="card-title">Paper Information</h3>
        
        <div className="paper-meta">
          <div className="meta-item">
            <div className="meta-label">Author</div>
            <div className="meta-value">
              {paper?.author?.firstName} {paper?.author?.lastName}
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Version</div>
            <div className="meta-value">v{review?.paperVersion}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Due Date</div>
            <div className="meta-value">
              {review?.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'No deadline'}
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Keywords</div>
            <div className="meta-value">{paper?.keywords || 'None'}</div>
          </div>
        </div>

        <div className="paper-abstract">
          <h4>Abstract</h4>
          <p>{paper?.abstractText}</p>
        </div>

        {paper?.fileName && (
          <div style={{ marginTop: '16px' }}>
            <strong>Attached File:</strong> {paper.fileName}
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link to={`/app/paper/${paper?.id}`} className="btn btn-secondary">
            View Full Paper Details
          </Link>
        </div>
      </div>

      {/* Review Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Review</h3>
          {review?.status === 'PENDING' && (
            <button className="btn btn-primary" onClick={handleStartReview}>
              Start Review
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitReview}>
          {/* Scores */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>Scores (1-10)</h4>
            <div className="score-grid">
              <div className="form-group">
                <label className="form-label">Quality *</label>
                <input
                  type="number"
                  name="qualityScore"
                  className="form-input"
                  value={formData.qualityScore}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  disabled={!canReview}
                  required
                />
                <small style={{ color: '#718096' }}>Technical quality and rigor</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Originality *</label>
                <input
                  type="number"
                  name="originalityScore"
                  className="form-input"
                  value={formData.originalityScore}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  disabled={!canReview}
                  required
                />
                <small style={{ color: '#718096' }}>Novel contribution to the field</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Clarity *</label>
                <input
                  type="number"
                  name="clarityScore"
                  className="form-input"
                  value={formData.clarityScore}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  disabled={!canReview}
                  required
                />
                <small style={{ color: '#718096' }}>Writing quality and presentation</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Significance *</label>
                <input
                  type="number"
                  name="significanceScore"
                  className="form-input"
                  value={formData.significanceScore}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  disabled={!canReview}
                  required
                />
                <small style={{ color: '#718096' }}>Impact and importance</small>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="form-group">
            <label className="form-label">Recommendation *</label>
            <select
              name="recommendation"
              className="form-input form-select"
              value={formData.recommendation}
              onChange={handleChange}
              disabled={!canReview}
              required
            >
              <option value="">Select recommendation</option>
              <option value="ACCEPT">Accept</option>
              <option value="MINOR_REVISION">Accept with Minor Revisions</option>
              <option value="MAJOR_REVISION">Major Revisions Required</option>
              <option value="REJECT">Reject</option>
            </select>
          </div>

          {/* Comments */}
          <div className="form-group">
            <label className="form-label">Comments to Author *</label>
            <textarea
              name="comments"
              className="form-input form-textarea"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Provide detailed feedback for the author..."
              rows="6"
              disabled={!canReview}
              required
            />
            <small style={{ color: '#718096' }}>
              These comments will be visible to the author
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Confidential Comments to Editor</label>
            <textarea
              name="confidentialComments"
              className="form-input form-textarea"
              value={formData.confidentialComments}
              onChange={handleChange}
              placeholder="Private comments for the editor only..."
              rows="4"
              disabled={!canReview}
            />
            <small style={{ color: '#718096' }}>
              These comments are only visible to the editor, not the author
            </small>
          </div>

          {canReview && (
            <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/app/reviews')}
              >
                Cancel
              </button>
            </div>
          )}

          {isCompleted && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              background: '#f0fff4', 
              borderRadius: '8px',
              borderLeft: '4px solid #38a169'
            }}>
              <strong style={{ color: '#276749' }}>Review Completed</strong>
              <p style={{ color: '#2f855a', marginTop: '8px' }}>
                Your review was submitted on {new Date(review.completedAt).toLocaleString()}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReviewDetail;
