import React, { useState } from 'react';
import axios from 'axios';
import { Send, Trash2, User as UserIcon } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';
import './CommentSection.css';

const CommentSection = ({ ticketId, comments, currentUserId, onCommentUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const resp = await axios.post(
        `${API_BASE}/tickets/${ticketId}/comments`,
        null,
        {
          params: { content: newComment },
          headers: getAuthHeaders()
        }
      );
      onCommentUpdate(resp.data);
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const resp = await axios.delete(
        `${API_BASE}/tickets/${ticketId}/comments/${commentId}`,
        { headers: getAuthHeaders() }
      );
      onCommentUpdate(resp.data);
    } catch (err) {
      alert('Failed to delete comment.');
    }
  };

  return (
    <div className="comment-section-wrapper">
      <h3 className="section-title">Case Discussion</h3>
      
      <div className="comments-list">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                <UserIcon size={16} />
              </div>
              <div className="comment-bubble">
                <div className="comment-header">
                  <span className="comment-author">{comment.userId}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
                {comment.userId === currentUserId && (
                  <button 
                    className="delete-comment-btn"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-comments">No internal comments yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || !newComment.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
