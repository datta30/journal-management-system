import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const PublishedPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await api.get('/public/published');
      setPapers(response.data);
    } catch (error) {
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPapers();
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/public/search?keyword=${searchQuery}`);
      setPapers(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Published Papers</h1>
        <p className="page-subtitle">Browse published research articles</p>
      </div>

      {/* Search */}
      <div className="action-bar">
        <div className="search-box" style={{ maxWidth: '500px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, keywords, or abstract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      {/* Papers Grid */}
      {papers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <h3>No published papers found</h3>
            <p>There are no published papers matching your search.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {papers.map(paper => (
            <div key={paper.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Link 
                    to={`/paper/${paper.id}`} 
                    style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      color: '#1a365d', 
                      textDecoration: 'none' 
                    }}
                  >
                    {paper.title}
                  </Link>
                  
                  <div style={{ color: '#718096', marginTop: '8px' }}>
                    <span>{paper.author?.firstName} {paper.author?.lastName}</span>
                    {paper.author?.institution && (
                      <span> • {paper.author.institution}</span>
                    )}
                    <span> • Published: {new Date(paper.publishedAt).toLocaleDateString()}</span>
                  </div>

                  {paper.keywords && (
                    <div style={{ marginTop: '12px' }}>
                      {paper.keywords.split(',').map((keyword, i) => (
                        <span 
                          key={i}
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            background: '#edf2f7',
                            borderRadius: '16px',
                            fontSize: '0.8rem',
                            marginRight: '8px',
                            marginBottom: '4px'
                          }}
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <p style={{ marginTop: '12px', color: '#4a5568' }}>
                    {paper.abstractText?.length > 300 
                      ? paper.abstractText.substring(0, 300) + '...' 
                      : paper.abstractText}
                  </p>
                </div>
                
                <Link to={`/paper/${paper.id}`} className="btn btn-secondary" style={{ marginLeft: '20px' }}>
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublishedPapers;
