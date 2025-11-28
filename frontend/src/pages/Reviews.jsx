import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReviews = () => {
    if (filter === 'all') return reviews;
    return reviews.filter(r => r.status === filter);
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace('_', '-');
    return <span className={`badge badge-${statusClass}`}>{status.replace('_', ' ')}</span>;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const filteredReviews = getFilteredReviews();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Reviews</h1>
        <p className="page-subtitle">Papers assigned to you for peer review</p>
      </div>

      <div className="action-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('all')}
          >
            All ({reviews.length})
          </button>
          <button 
            className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('PENDING')}
          >
            Pending ({reviews.filter(r => r.status === 'PENDING').length})
          </button>
          <button 
            className={`btn ${filter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('IN_PROGRESS')}
          >
            In Progress ({reviews.filter(r => r.status === 'IN_PROGRESS').length})
          </button>
          <button 
            className={`btn ${filter === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed ({reviews.filter(r => r.status === 'COMPLETED').length})
          </button>
        </div>
      </div>

      <div className="card">
        {filteredReviews.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <h3>No reviews found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any review assignments yet." 
                : `No ${filter.toLowerCase().replace('_', ' ')} reviews.`}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Paper</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Recommendation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map(review => (
                  <tr key={review.id}>
                    <td>
                      <Link to={`/app/paper/${review.paperId}`} style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 500 }}>
                        {review.paperTitle?.length > 50 
                          ? review.paperTitle.substring(0, 50) + '...' 
                          : review.paperTitle}
                      </Link>
                    </td>
                    <td>v{review.paperVersion}</td>
                    <td>{getStatusBadge(review.status)}</td>
                    <td>
                      {review.dueDate ? (
                        <span style={{ 
                          color: new Date(review.dueDate) < new Date() && review.status !== 'COMPLETED' 
                            ? '#e53e3e' 
                            : 'inherit' 
                        }}>
                          {new Date(review.dueDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {review.recommendation ? (
                        <span className={`badge ${
                          review.recommendation === 'ACCEPT' ? 'badge-accepted' :
                          review.recommendation === 'REJECT' ? 'badge-rejected' :
                          'badge-under-review'
                        }`}>
                          {review.recommendation.replace('_', ' ')}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <Link 
                        to={`/app/review/${review.id}`} 
                        className={`btn btn-sm ${review.status === 'COMPLETED' ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {review.status === 'COMPLETED' ? 'View' : 'Review'}
                      </Link>
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

export default Reviews;
