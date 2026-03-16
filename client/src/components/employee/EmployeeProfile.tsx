import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../admin/Topbar";
import { User, Mail, Phone, MapPin, Briefcase, Award, Star, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

export default function EmployeeProfile() {
  const { user, logout, login } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local Form State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [position, setPosition] = useState(user?.position || "");
  const [address, setAddress] = useState(user?.address || "");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [tasksResponse, feedbackResponse] = await Promise.all([
          api.get('/service-requests'),
          api.get('/feedback'),
        ]);
        setTasks(tasksResponse.data);
        setFeedbacks(feedbackResponse.data);
      } catch (err) {
        console.error("Error fetching employee metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put('/auth/profile', {
        name,
        phone,
        department,
        position,
        address
      });
      if (response.data) {
        login({ ...response.data, token: user?.token });
        setShowEdit(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const completedTasks = useMemo(() => (
    tasks.filter((task: any) => task.status === 'completed')
  ), [tasks]);

  const ratingByRequest = useMemo(() => {
    const map = new Map<string, number[]>();
    feedbacks.forEach((feedback: any) => {
      const requestId = typeof feedback.serviceRequest === "string"
        ? feedback.serviceRequest
        : feedback.serviceRequest?._id;
      if (!requestId) return;
      if (!map.has(requestId)) {
        map.set(requestId, []);
      }
      map.get(requestId)?.push(Number(feedback.rating) || 0);
    });
    return map;
  }, [feedbacks]);

  const ratingValues = useMemo(() => {
    const values: number[] = [];
    completedTasks.forEach((task: any) => {
      const ratings = ratingByRequest.get(task._id) || [];
      ratings.forEach((rating) => values.push(rating));
    });
    return values;
  }, [completedTasks, ratingByRequest]);

  const averageRating = ratingValues.length
    ? ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length
    : null;

  const onTimeMetrics = useMemo(() => {
    const completedWithSchedule = completedTasks.filter((task: any) => task.scheduledDate && task.completionDate);
    if (completedWithSchedule.length === 0) {
      return { onTimeRate: null, onTimeCount: 0, totalScheduled: 0 };
    }
    const onTimeCount = completedWithSchedule.filter((task: any) => (
      new Date(task.completionDate) <= new Date(task.scheduledDate)
    )).length;
    return {
      onTimeRate: Math.round((onTimeCount / completedWithSchedule.length) * 100),
      onTimeCount,
      totalScheduled: completedWithSchedule.length,
    };
  }, [completedTasks]);

  const topServices = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.forEach((task: any) => {
      if (!task.title) return;
      counts.set(task.title, (counts.get(task.title) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([title]) => title);
  }, [tasks]);

  const achievements = useMemo(() => {
    const list: { title: string; description: string }[] = [];

    if (completedTasks.length >= 1) {
      list.push({
        title: "First Job Completed",
        description: `You've completed ${completedTasks.length} job${completedTasks.length > 1 ? 's' : ''} so far.`,
      });
    }

    if (completedTasks.length >= 10) {
      list.push({
        title: "10+ Jobs Completed",
        description: "Strong delivery pace across assigned service requests.",
      });
    }

    if (averageRating && ratingValues.length >= 3 && averageRating >= 4.5) {
      list.push({
        title: "High Client Ratings",
        description: `Average client rating is ${averageRating.toFixed(1)} stars.`,
      });
    }

    if (onTimeMetrics.onTimeRate !== null && onTimeMetrics.onTimeRate >= 90 && onTimeMetrics.totalScheduled >= 5) {
      list.push({
        title: "On-Time Streak",
        description: `Completed ${onTimeMetrics.onTimeCount}/${onTimeMetrics.totalScheduled} scheduled jobs on time.`,
      });
    }

    return list.slice(0, 3);
  }, [completedTasks.length, averageRating, ratingValues.length, onTimeMetrics]);

  return (
    <main className="dashboard-page">
      <EmployeeSidebar onLogout={logout} activeItem="Profile" />

      <section className="dashboard-main text-gray-900">
        <Topbar title="My Profile" />

        <div className="dashboard-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-600">
                        <User size={64} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
                    <p className="text-blue-600 font-medium mb-6">{user?.position || "Employee"}</p>
                    <button 
                      onClick={() => setShowEdit(!showEdit)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        {showEdit ? "Cancel Editing" : "Edit Profile"}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h4>
                    <div className="space-y-4">
                        <div className="flex items-center text-gray-600">
                            <Mail size={18} className="mr-3 text-gray-400" />
                            <span className="text-sm">{user?.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Phone size={18} className="mr-3 text-gray-400" />
                            <span className="text-sm">{user?.phone || "No phone added"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPin size={18} className="mr-3 text-gray-400" />
                            <span className="text-sm">{user?.address || "No location added"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Briefcase size={18} className="mr-3 text-gray-400" />
                            <span className="text-sm">{user?.department || "General"} Department</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {showEdit ? (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Update Personal Information</h4>
                    <form onSubmit={handleSave} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Department</label>
                          <input 
                            type="text" 
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Position</label>
                          <input 
                            type="text" 
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Location / Address</label>
                        <input 
                          type="text" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center disabled:opacity-70"
                      >
                        {isSaving && <Loader2 className="animate-spin mr-2" size={18} />}
                        Save Changes
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <TrendingUp className="mr-2 text-green-600" size={20} />
                            Performance Overview
                        </h4>
                        {isLoading ? (
                          <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="p-4 bg-gray-50 rounded-xl">
                                  <p className="text-gray-500 text-sm mb-1">Average Rating</p>
                                  <div className="flex items-center">
                                      <span className="text-2xl font-bold text-gray-800 mr-2">
                                        {averageRating ? averageRating.toFixed(1) : "N/A"}
                                      </span>
                                      <Star className="text-yellow-400 fill-current" size={20} />
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">{ratingValues.length} review{ratingValues.length === 1 ? "" : "s"}</p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-xl">
                                  <p className="text-gray-500 text-sm mb-1">Total Jobs</p>
                                  <span className="text-2xl font-bold text-gray-800">{completedTasks.length}</span>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-xl">
                                  <p className="text-gray-500 text-sm mb-1">On-Time Rate</p>
                                  <span className="text-2xl font-bold text-gray-800">
                                    {onTimeMetrics.onTimeRate === null ? "N/A" : `${onTimeMetrics.onTimeRate}%`}
                                  </span>
                                  {onTimeMetrics.onTimeRate !== null && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {onTimeMetrics.onTimeCount}/{onTimeMetrics.totalScheduled} scheduled jobs on time
                                    </p>
                                  )}
                              </div>
                          </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <Award className="mr-2 text-blue-600" size={20} />
                            Expertise & Skills
                        </h4>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-blue-600" size={28} />
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                              {topServices.length > 0 ? (
                                topServices.map((skill) => (
                                  <span key={skill} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm">
                                      {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-400">No service data yet.</span>
                              )}
                          </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 mb-6">Recent Achievements</h4>
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-blue-600" size={28} />
                          </div>
                        ) : (
                          <div className="space-y-4">
                              {achievements.length > 0 ? (
                                achievements.map((achievement) => (
                                  <div key={achievement.title} className="flex items-start p-4 border border-blue-100 bg-blue-50 rounded-xl">
                                      <div className="p-2 bg-blue-500 text-white rounded-lg mr-4">
                                          <Award size={20} />
                                      </div>
                                      <div>
                                          <h5 className="font-bold text-blue-900">{achievement.title}</h5>
                                          <p className="text-sm text-blue-800">{achievement.description}</p>
                                      </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-400">No achievements yet.</p>
                              )}
                          </div>
                        )}
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
