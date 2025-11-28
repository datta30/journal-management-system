import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ViewPaper = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      const response = await api.get(`/public/papers/${id}`);
      setPaper(response.data);
    } catch (error) {
      console.error('Failed to fetch paper');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!paper) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7fafc', padding: '32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Paper not found</h2>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ color: 'white', fontSize: '1.5rem', textDecoration: 'none' }}>
          📚 Research Journal
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn" style={{ 
            background: 'rgba(255,255,255,0.2)', 
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ background: 'white', color: '#667eea' }}>
            Register
          </Link>
        </div>
      </header>

      {/* Paper Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
        <Link to="/" style={{ 
          color: '#667eea', 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}>
          ← Back to all papers
        </Link>

        <article className="card" style={{ padding: '48px' }}>
          {/* Title */}
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a202c', marginBottom: '16px' }}>
            {paper.title}
          </h1>

          {/* Author Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px 0',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600
            }}>
              {paper.author?.firstName?.[0]}{paper.author?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#2d3748' }}>
                {paper.author?.firstName} {paper.author?.lastName}
              </div>
              <div style={{ color: '#718096', fontSize: '0.9rem' }}>
                {paper.author?.institution}
                {paper.publishedAt && ` • Published ${new Date(paper.publishedAt).toLocaleDateString()}`}
              </div>
            </div>
          </div>

          {/* Keywords */}
          {paper.keywords && (
            <div style={{ marginBottom: '24px' }}>
              <strong style={{ color: '#4a5568', fontSize: '0.9rem' }}>Keywords:</strong>
              <div style={{ marginTop: '8px' }}>
                {paper.keywords.split(',').map((keyword, i) => (
                  <span key={i} style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    background: '#edf2f7',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    marginRight: '8px',
                    marginBottom: '8px',
                    color: '#4a5568'
                  }}>
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Abstract */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2d3748', marginBottom: '12px' }}>
              Abstract
            </h2>
            <p style={{ 
              color: '#4a5568', 
              lineHeight: 1.8,
              fontSize: '1.05rem',
              textAlign: 'justify'
            }}>
              {paper.abstractText}
            </p>
          </div>

          {/* Paper Details */}
          <div style={{ 
            background: '#f7fafc', 
            padding: '20px', 
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ color: '#718096', fontSize: '0.85rem' }}>Version</div>
              <div style={{ fontWeight: 600, color: '#2d3748' }}>v{paper.version}</div>
            </div>
            <div>
              <div style={{ color: '#718096', fontSize: '0.85rem' }}>Status</div>
              <div style={{ fontWeight: 600, color: '#38a169' }}>{paper.status}</div>
            </div>
            {paper.fileName && (
              <div>
                <div style={{ color: '#718096', fontSize: '0.85rem' }}>Document</div>
                <div style={{ fontWeight: 600, color: '#3182ce' }}>{paper.fileName}</div>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
};

export default ViewPaper;
