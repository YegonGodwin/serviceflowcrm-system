import {
    Filter,
    MessageSquareText,
    MoreVertical,
    Search,
    Star,
    ThumbsDown,
    ThumbsUp,
    TrendingUp,
    Loader2
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Feedback() {
    const { logout } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await api.get('/feedback');
                setFeedbacks(response.data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "received":
                return "status-active";
            case "in review":
                return "status-inprogress";
            case "resolved":
                return "status-inactive";
            case "escalated":
                return "status-suspended";
            default:
                return "status-active";
        }
    };

    const avgRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, f: any) => sum + f.rating, 0) / feedbacks.length
        : 0;

    const positiveCount = feedbacks.filter((f: any) => f.rating >= 4).length;
    const negativeCount = feedbacks.filter((f: any) => f.rating <= 2).length;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={13}
                className={i < rating ? "star-filled fill-yellow-400 text-yellow-400" : "star-empty text-gray-300"}
            />
        ));
    };

    return (
        <main className="dashboard-page">
            <Sidebar onLogout={logout} activeItem="Feedback" />

            <section className="dashboard-main">
                <Topbar title="Feedback" />

                <div className="dashboard-content">
                    <div className="feedback-header">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search feedback"
                                className="search-input"
                            />
                        </div>

                        <div className="feedback-actions">
                            <button type="button" className="btn-filter">
                                <Filter size={18} />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Feedback Summary Cards */}
                    <div className="feedback-stats">
                        <div className="feedback-stat-card">
                            <div className="feedback-stat-icon">
                                <MessageSquareText size={22} />
                            </div>
                            <div className="feedback-stat-info">
                                <div className="feedback-stat-label">Total Feedback</div>
                                <div className="feedback-stat-value">
                                    {feedbacks.length}
                                </div>
                            </div>
                        </div>

                        <div className="feedback-stat-card">
                            <div className="feedback-stat-icon avg-rating-icon text-yellow-600">
                                <TrendingUp size={22} />
                            </div>
                            <div className="feedback-stat-info">
                                <div className="feedback-stat-label">Avg. Rating</div>
                                <div className="feedback-stat-value text-yellow-700">
                                    {avgRating.toFixed(1)}
                                    <span className="feedback-stat-out-of"> / 5</span>
                                </div>
                            </div>
                        </div>

                        <div className="feedback-stat-card">
                            <div className="feedback-stat-icon positive-icon text-green-600">
                                <ThumbsUp size={22} />
                            </div>
                            <div className="feedback-stat-info">
                                <div className="feedback-stat-label">Positive (4-5 ★)</div>
                                <div className="feedback-stat-value text-green-700">{positiveCount}</div>
                            </div>
                        </div>

                        <div className="feedback-stat-card">
                            <div className="feedback-stat-icon negative-icon text-red-600">
                                <ThumbsDown size={22} />
                            </div>
                            <div className="feedback-stat-info">
                                <div className="feedback-stat-label">Negative (1-2 ★)</div>
                                <div className="feedback-stat-value text-red-700">{negativeCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Table */}
                    <div className="employees-table-container">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                            </div>
                        ) : (
                            <table className="employees-table feedback-table text-gray-900">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Client</th>
                                        <th>Service Title</th>
                                        <th>Message</th>
                                        <th>Rating</th>
                                        <th>Submitted</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbacks.map((entry: any) => (
                                        <tr key={entry._id}>
                                            <td className="font-mono text-xs">#{entry._id.slice(-6)}</td>
                                            <td>
                                                <div className="requester-info">
                                                    <div className="requester-name font-medium">{entry.client?.name}</div>
                                                    {entry.client?.companyName && (
                                                        <div className="requester-company text-gray-500 text-xs">
                                                            {entry.client.companyName}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="feedback-subject-cell font-medium">{entry.serviceRequest?.title}</td>
                                            <td>
                                                <div className="feedback-message-cell text-sm text-gray-600 max-w-xs truncate">
                                                    {entry.message}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="feedback-stars-cell">
                                                    <span className="feedback-stars-row flex">
                                                        {renderStars(entry.rating)}
                                                    </span>
                                                    <span className="feedback-rating-num ml-2 font-bold text-xs">
                                                        {entry.rating}.0
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-gray-500 text-xs">{new Date(entry.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span
                                                    className={`status-badge ${getStatusColor('Received')}`}
                                                >
                                                    Received
                                                </span>
                                            </td>
                                            <td>
                                                <button type="button" className="btn-action">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {feedbacks.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="text-center py-8 text-gray-500">No feedback received yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
