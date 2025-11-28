import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ papers: 0, authors: 0 });

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await api.get('/public/papers');
      setPapers(response.data);
      // Calculate unique authors
      const uniqueAuthors = new Set(response.data.map(p => p.author?.id)).size;
      setStats({ papers: response.data.length, authors: uniqueAuthors });
    } catch (error) {
      console.error('Failed to fetch papers');
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
      setPapers(response.data.filter(p => p.status === 'PUBLISHED'));
    } catch (error) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255,255,255,0.1)', 
        backdropFilter: 'blur(10px)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>📚 Research Journal</h1>
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

      {/* Hero Section */}
      <section style={{ 
        padding: '60px 32px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 700 }}>
          Academic Research Journal
        </h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px' }}>
          Discover groundbreaking research, submit your papers, and contribute to the academic community.
        </p>
        
        {/* Search Bar */}
        <div style={{ 
          display: 'flex', 
          maxWidth: '600px', 
          margin: '0 auto',
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <input
            type="text"
            placeholder="Search published papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1,
              padding: '16px 20px',
              border: 'none',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{
              padding: '16px 32px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '40px' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.papers}</div>
            <div style={{ opacity: 0.8 }}>Published Papers</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.authors}</div>
            <div style={{ opacity: 0.8 }}>Contributing Authors</div>
          </div>
        </div>
      </section>

      {/* Papers Section */}
      <section style={{ 
        background: '#f7fafc', 
        padding: '48px 32px',
        minHeight: '400px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#2d3748' }}>
            📖 Latest Published Papers
          </h3>

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : papers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <h4 style={{ color: '#4a5568' }}>No published papers yet</h4>
              <p style={{ color: '#718096' }}>Be the first to submit and publish your research!</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Submit Your Paper
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {papers.map(paper => (
                <div key={paper.id} className="card" style={{ 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a365d', marginBottom: '8px' }}>
                        {paper.title}
                      </h4>
                      
                      <div style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 500 }}>{paper.author?.firstName} {paper.author?.lastName}</span>
                        {paper.author?.institution && <span> • {paper.author.institution}</span>}
                        {paper.publishedAt && (
                          <span> • {new Date(paper.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>

                      {paper.keywords && (
                        <div style={{ marginBottom: '12px' }}>
                          {paper.keywords.split(',').slice(0, 4).map((keyword, i) => (
                            <span key={i} style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              background: '#e2e8f0',
                              borderRadius: '16px',
                              fontSize: '0.75rem',
                              marginRight: '6px',
                              color: '#4a5568'
                            }}>
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <p style={{ color: '#4a5568', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        {paper.abstractText?.length > 250 
                          ? paper.abstractText.substring(0, 250) + '...' 
                          : paper.abstractText}
                      </p>
                    </div>
                    
                    <Link 
                      to={`/paper/view/${paper.id}`} 
                      className="btn btn-secondary"
                      style={{ marginLeft: '20px', flexShrink: 0 }}
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#1a202c', 
        color: 'white', 
        padding: '32px',
        textAlign: 'center'
      }}>
        <p style={{ opacity: 0.7 }}>© 2025 Research Journal Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
