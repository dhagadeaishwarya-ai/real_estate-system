import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, HelpCircle, MessageSquare, Send, Trash2 } from 'lucide-react';
import { questionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PropertyQnA = ({ propertyId, canManageProperty }) => {
  const { user, isAuthenticated, isBuyer, isAdmin, isAgent } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadQuestions = useCallback(async () => {
    try {
      const data = await questionAPI.getByProperty(propertyId);
      setQuestions(data);
    } catch {
      setError('Failed to load buyer questions.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadQuestions();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadQuestions]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleAskQuestion = async (event) => {
    event.preventDefault();
    clearMessages();

    if (questionText.trim().length < 5) {
      setError('Please enter a question with at least 5 characters.');
      return;
    }

    setActionLoading('ask');
    try {
      await questionAPI.create({
        property_id: propertyId,
        question: questionText
      });
      setQuestionText('');
      setSuccess('Your question has been posted for the property host.');
      await loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnswer = async (questionId) => {
    clearMessages();
    const answer = answerDrafts[questionId] || '';

    if (answer.trim().length < 3) {
      setError('Please enter a valid answer before saving.');
      return;
    }

    setActionLoading(`answer-${questionId}`);
    try {
      await questionAPI.answer(questionId, answer);
      setAnswerDrafts(prev => ({ ...prev, [questionId]: '' }));
      setSuccess('Answer saved successfully.');
      await loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save answer.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (questionId) => {
    clearMessages();
    if (!window.confirm('Delete this question permanently?')) {
      return;
    }

    setActionLoading(`delete-${questionId}`);
    try {
      await questionAPI.delete(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setSuccess('Question deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    return new Date(dateValue).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canAnswer = isAuthenticated && (isAdmin || isAgent || canManageProperty);

  return (
    <section className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={20} style={{ color: 'var(--primary-color)' }} />
            Buyer Q&A
          </h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
            Ask listing-specific questions and read verified host responses.
          </p>
        </div>
        <span className="badge badge-info">{questions.length} questions</span>
      </div>

      {success && (
        <div className="alert-box alert-success" style={{ padding: '0.75rem' }}>
          <CheckCircle size={16} />
          <span style={{ fontSize: '0.85rem' }}>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error" style={{ padding: '0.75rem' }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Sign in</Link> as a buyer to ask the property host a question.
        </div>
      ) : isBuyer ? (
        <form onSubmit={handleAskQuestion} style={{ marginBottom: '1.75rem' }}>
          <div className="form-group" style={{ marginBottom: '0.8rem' }}>
            <label>Your Question</label>
            <textarea
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              className="form-control"
              rows="3"
              placeholder="Ask about parking, maintenance, nearby facilities, ownership documents..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="gradient-btn" disabled={actionLoading === 'ask'}>
            <Send size={16} />
            {actionLoading === 'ask' ? 'Posting...' : 'Post Question'}
          </button>
        </form>
      ) : (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Buyer accounts can post new questions. Hosts can answer questions below.
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>Loading questions...</div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
          <MessageSquare size={22} style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }} />
          <div>No buyer questions yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((item) => {
            const canDelete = isAuthenticated && (
              isAdmin ||
              isAgent ||
              canManageProperty ||
              Number(item.buyer_id) === Number(user?.id)
            );

            return (
              <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{item.buyer_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatDate(item.created_at)}</div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="outline-btn"
                      style={{ padding: '0.35rem 0.55rem', color: 'var(--error)', borderColor: 'rgba(244,63,94,0.3)' }}
                      disabled={actionLoading === `delete-${item.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <p style={{ marginTop: '0.85rem', lineHeight: 1.7, color: 'var(--text-main)' }}>{item.question}</p>

                {item.answer ? (
                  <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--success)' }}>Host Answer</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {item.answered_by_name} {item.answered_at ? `on ${formatDate(item.answered_at)}` : ''}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.answer}</p>
                  </div>
                ) : canAnswer ? (
                  <div style={{ marginTop: '1rem' }}>
                    <textarea
                      value={answerDrafts[item.id] || ''}
                      onChange={(event) => setAnswerDrafts(prev => ({ ...prev, [item.id]: event.target.value }))}
                      className="form-control"
                      rows="2"
                      placeholder="Write an answer for this buyer..."
                      style={{ resize: 'vertical', marginBottom: '0.75rem' }}
                    />
                    <button
                      onClick={() => handleAnswer(item.id)}
                      className="outline-btn"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                      disabled={actionLoading === `answer-${item.id}`}
                    >
                      <Send size={14} />
                      {actionLoading === `answer-${item.id}` ? 'Saving...' : 'Save Answer'}
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem', color: 'var(--warning)', fontSize: '0.85rem' }}>
                    Awaiting host response.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PropertyQnA;
