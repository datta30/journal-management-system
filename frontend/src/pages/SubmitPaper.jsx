import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const SubmitPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstractText: '',
    keywords: '',
    file: null
  });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchPaper();
    }
  }, [id]);

  const fetchPaper = async () => {
    try {
      const response = await api.get(`/papers/${id}`);
      const paper = response.data;
      setFormData({
        title: paper.title,
        abstractText: paper.abstractText,
        keywords: paper.keywords || '',
        file: null
      });
    } catch (error) {
      toast.error('Failed to fetch paper');
      navigate('/app/my-papers');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('abstractText', formData.abstractText);
    data.append('keywords', formData.keywords);
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      if (isEditing) {
        await api.put(`/papers/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Paper updated successfully');
      } else {
        await api.post('/papers', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Paper submitted successfully');
      }
      navigate('/app/my-papers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit paper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'Edit Paper' : 'Submit New Paper'}</h1>
        <p className="page-subtitle">
          {isEditing 
            ? 'Update your paper submission' 
            : 'Submit your research paper for review and publication'}
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter the title of your paper"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Abstract *</label>
            <textarea
              name="abstractText"
              className="form-input form-textarea"
              value={formData.abstractText}
              onChange={handleChange}
              placeholder="Provide a comprehensive abstract of your research..."
              rows="6"
              required
            />
            <small style={{ color: '#718096' }}>
              Minimum 100 words recommended. Describe your research objectives, methodology, and key findings.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Keywords</label>
            <input
              type="text"
              name="keywords"
              className="form-input"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="e.g., machine learning, neural networks, deep learning"
            />
            <small style={{ color: '#718096' }}>
              Separate keywords with commas. Keywords help reviewers and readers find your paper.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Paper (PDF, DOC, DOCX)</label>
            <input
              type="file"
              className="form-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              style={{ padding: '10px' }}
            />
            <small style={{ color: '#718096' }}>
              Maximum file size: 50MB. Preferred format: PDF.
            </small>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : (isEditing ? 'Update Paper' : 'Submit Paper')}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/app/my-papers')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {!isEditing && (
        <div className="card" style={{ background: '#f0fff4', borderLeft: '4px solid #38a169' }}>
          <h3 style={{ color: '#276749', marginBottom: '12px' }}>Submission Guidelines</h3>
          <ul style={{ marginLeft: '20px', color: '#2f855a' }}>
            <li>Ensure your paper is original and not published elsewhere</li>
            <li>Follow the journal's formatting guidelines</li>
            <li>Include all necessary citations and references</li>
            <li>Papers will undergo automated plagiarism detection</li>
            <li>Expect initial feedback within 2-4 weeks</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubmitPaper;
