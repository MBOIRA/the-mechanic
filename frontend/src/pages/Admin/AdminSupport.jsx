import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const AdminSupport = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState({});
  const { token } = useAuth();

  const getToken = () => {
    return token || localStorage.getItem('token');
  };

  useEffect(() => {
    fetchInquiries();
    const interval = setInterval(fetchInquiries, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchInquiries = async () => {
    try {
      setError('');
      const authToken = getToken();
      if (!authToken) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/inquiries', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to fetch inquiries');
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setError('Network error fetching inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText[id]) return;

    try {
      const authToken = getToken();
      const response = await fetch(`http://localhost:5000/api/inquiries/${id}/response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: replyText[id] })
      });

      if (response.ok) {
        setReplyText({ ...replyText, [id]: '' });
        fetchInquiries();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Network error sending reply');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Support Inquiries
          </h1>
          <p className="text-gray-600 mt-1">Manage and respond to user support requests</p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
              <MessageSquare className="h-10 w-10 text-blue-600" />
            </div>
            <p className="text-lg font-medium">No support inquiries found.</p>
            <p className="text-sm mt-1">Inquiries from users will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {inquiries.map((inquiry) => (
              <li key={inquiry._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        inquiry.status === 'resolved' 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm' 
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm'
                      }`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{inquiry.subject}</span>
                      <span className="text-sm text-gray-600 border-l border-gray-300 pl-3">
                        From: {inquiry.name} ({inquiry.email})
                      </span>
                      {inquiry.priority && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          inquiry.priority === 'high' 
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' 
                            : inquiry.priority === 'medium' 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          {inquiry.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {inquiry.userId && (
                      <div className="text-xs text-gray-500 mb-2 p-2 bg-indigo-50 rounded-lg inline-block">
                        <span className="font-semibold">User:</span> {inquiry.userId?.firstName} {inquiry.userId?.lastName} ({inquiry.userId?.role})
                        {inquiry.userId?.phone && ` - ${inquiry.userId.phone}`}
                      </div>
                    )}
                    <p className="text-gray-700 text-sm mb-4 p-3 bg-gray-50 rounded-xl">{inquiry.message}</p>
                    {inquiry.category && (
                      <div className="text-xs text-gray-500 mb-2">
                        <span className="font-semibold">Category:</span> {inquiry.category}
                      </div>
                    )}

                    {inquiry.response?.content ? (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">Response Sent:</span>
                          {inquiry.response.respondedBy && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">
                              by {inquiry.response.respondedBy.firstName} {inquiry.response.respondedBy.lastName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 p-3 bg-white rounded-lg">{inquiry.response.content}</p>
                        {inquiry.response.respondedAt && (
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(inquiry.response.respondedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <textarea
                          rows={3}
                          className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm p-4 border transition-all duration-200"
                          placeholder="Type your reply here..."
                          value={replyText[inquiry._id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [inquiry._id]: e.target.value })}
                        />
                        <button
                          onClick={() => handleReply(inquiry._id)}
                          disabled={!replyText[inquiry._id]}
                          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          Send Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
