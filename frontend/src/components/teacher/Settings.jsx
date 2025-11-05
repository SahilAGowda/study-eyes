import React, { useState, useRef } from "react";
import {
  User,
  BookOpen,
  Bell,
  Settings,
  ClipboardList,
  Shield,
  Camera,
  Lock,
  HelpCircle,
  Save,
  X,
  Upload,
  Edit,
  Trash2,
  Plus,
  Globe,
  Clock,
  Phone,
  Mail,
  Key,
  Video,
  Mic,
  Monitor,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  Users,
  Calendar,
  MapPin,
  Timer,
  Zap,
  BarChart,
  Download,
  MessageSquare,
  Eye,
  EyeOff,
  Volume2,
  Smartphone,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";

const TeacherSettings = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef(null);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "Mr. John Smith",
    email: "teachtest@gmail.com",
    teacherId: "TCH-2024-001",
    department: "Mathematics & Physics",
    phone: "+1 (555) 123-4567",
    language: "English",
    timezone: "America/New_York",
    avatar: null,
  });

  // Classes
  const [classes] = useState([
    {
      id: 1,
      name: "Math 12A",
      grade: "12",
      subject: "Mathematics",
      students: 24,
      schedule: "Mon, Wed, Fri 9:00-10:00 AM",
      room: "Room 201",
    },
    {
      id: 2,
      name: "Physics 11B",
      grade: "11",
      subject: "Physics",
      students: 28,
      schedule: "Tue, Thu 10:00-11:00 AM",
      room: "Lab 3",
    },
    {
      id: 3,
      name: "Math 12B",
      grade: "12",
      subject: "Mathematics",
      students: 22,
      schedule: "Mon, Wed, Fri 11:00 AM-12:00 PM",
      room: "Room 201",
    },
    {
      id: 4,
      name: "Chem 11A",
      grade: "11",
      subject: "Chemistry",
      students: 20,
      schedule: "Tue, Thu 1:00-2:00 PM",
      room: "Lab 2",
    },
    {
      id: 5,
      name: "Physics 12A",
      grade: "12",
      subject: "Physics",
      students: 16,
      schedule: "Mon, Wed 2:00-3:00 PM",
      room: "Lab 3",
    },
    {
      id: 6,
      name: "Chem 12B",
      grade: "12",
      subject: "Chemistry",
      students: 18,
      schedule: "Tue, Thu 3:00-4:00 PM",
      room: "Lab 2",
    },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState({
    inApp: true,
    email: true,
    sms: false,
    lowEngagement: { enabled: true, frequency: "real-time" },
    studentConcerns: { enabled: true, frequency: "real-time" },
    quizCompletions: { enabled: true, frequency: "daily" },
    attendance: { enabled: true, frequency: "daily" },
    systemUpdates: { enabled: true, frequency: "weekly" },
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "07:00",
      weekends: false,
    },
  });

  // Teaching Preferences
  const [teachingPrefs, setTeachingPrefs] = useState({
    thresholds: { high: 75, medium: 60, low: 60, critical: 40 },
    autoQuizSuggest: true,
    alertDisengaged: true,
    weeklySummary: true,
    defaultView: "engagement",
    teachingStyle: "mixed",
    breakFrequency: 30,
    sessionDuration: 45,
    breakReminder: 30,
    autoTracking: true,
  });

  // Quiz Settings
  const [quizSettings, setQuizSettings] = useState({
    defaultDuration: 45,
    lateSubmissions: true,
    graceHours: 24,
    showAnswers: "immediately",
    autoGrade: true,
    aiEnabled: true,
    aiDifficulty: "medium",
    aiQuestions: 5,
    autoSend: false,
    proctoringEnabled: true,
    gazeThreshold: 5,
    headPoseMonitoring: true,
    audioMonitoring: true,
    realtimeAlerts: true,
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    videoAnalysis: true,
    audioAnalysis: true,
    rPPG: true,
    screenActivity: true,
    shareWithAdmin: true,
    researchParticipation: false,
    shareWithParents: true,
    retentionEngagement: "1year",
    retentionQuiz: "2years",
    retentionNotes: "graduation",
  });

  // Camera & Audio
  const [cameraSettings, setCameraSettings] = useState({
    camera: "Built-in Camera",
    microphone: "Built-in Microphone",
    videoQuality: "high",
    autoEnable: true,
    noiseCancellation: true,
    privacyIndicators: true,
  });

  // Security
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    autoLogout: 60,
    sessions: [
      {
        device: "Chrome on Windows",
        location: "New York, US",
        lastActive: "2 min ago",
        current: true,
      },
      {
        device: "Safari on iPhone",
        location: "New York, US",
        lastActive: "1 hour ago",
        current: false,
      },
    ],
  });

  const menuSections = [
    {
      id: "profile",
      label: "Profile & Account",
      icon: <User />,
      color: "#4CAF50",
    },
    {
      id: "classes",
      label: "Class Management",
      icon: <BookOpen />,
      color: "#2196F3",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell />,
      color: "#FF9800",
    },
    {
      id: "teaching",
      label: "Teaching Preferences",
      icon: <Settings />,
      color: "#9C27B0",
    },
    {
      id: "quiz",
      label: "Quiz & Assessment",
      icon: <ClipboardList />,
      color: "#E91E63",
    },
    {
      id: "privacy",
      label: "Privacy & Data",
      icon: <Shield />,
      color: "#00BCD4",
    },
    {
      id: "camera",
      label: "Camera & Audio",
      icon: <Camera />,
      color: "#FF5722",
    },
    { id: "security", label: "Security", icon: <Lock />, color: "#F44336" },
    {
      id: "help",
      label: "Help & Support",
      icon: <HelpCircle />,
      color: "#607D8B",
    },
  ];

  const handleSave = (section) => {
    setToastMessage(`${section} settings saved successfully!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700 font-medium">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          Personal Information
        </h3>

        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profileData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4 text-green-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"

              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Teacher ID
              </label>
              <input
                type="text"
                value={profileData.teacherId}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl   bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Department
            </label>
            <input
              type="text"
              value={profileData.department}
              onChange={(e) =>
                setProfileData({ ...profileData, department: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Language
            </label>
            <select
              value={profileData.language}
              onChange={(e) =>
                setProfileData({ ...profileData, language: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>

        <button className="mt-6 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
          <Key className="w-4 h-4" />
          Change Password
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 font-semibold hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Profile")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all "
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderClassesSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            My Classes
          </h3>
          <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Add New Class
          </button>
        </div>

        <div className="space-y-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">
                      {cls.name}
                    </h4>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                      Grade {cls.grade}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                      {cls.subject}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{cls.students} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{cls.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{cls.room}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Class Defaults
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Preferred Break Frequency
            </label>
            <select
              value={teachingPrefs.breakFrequency}
              onChange={(e) =>
                setTeachingPrefs({
                  ...teachingPrefs,
                  breakFrequency: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="45">Every 45 minutes</option>
              <option value="60">Every 60 minutes</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Default Dashboard View
            </label>
            <select
              value={teachingPrefs.defaultView}
              onChange={(e) =>
                setTeachingPrefs({
                  ...teachingPrefs,
                  defaultView: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option value="today">Today's Classes</option>
              <option value="engagement">Engagement Overview</option>
              <option value="analytics">Analytics Dashboard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Teaching Preferences")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderQuizSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-pink-600" />
          Quiz Defaults
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold bg-white text-gray-700 mb-2 block">
                Default Duration
              </label>
              <select
                value={quizSettings.defaultDuration}
                onChange={(e) =>
                  setQuizSettings({
                    ...quizSettings,
                    defaultDuration: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 border  border-gray-300 rounded-xl bg-white"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block bg-white">
                Show Correct Answers
              </label>
              <select
                value={quizSettings.showAnswers}
                onChange={(e) =>
                  setQuizSettings({
                    ...quizSettings,
                    showAnswers: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
              >
                <option value="immediately">Immediately</option>
                <option value="deadline">After Deadline</option>
                <option value="manual">Manual Release</option>
              </select>
            </div>
          </div>
          <ToggleSwitch
            enabled={quizSettings.lateSubmissions}
            onChange={(val) =>
              setQuizSettings({ ...quizSettings, lateSubmissions: val })
            }
            label={`Allow late submissions (${quizSettings.graceHours}h grace period)`}
          />
          <ToggleSwitch
            enabled={quizSettings.autoGrade}
            onChange={(val) =>
              setQuizSettings({ ...quizSettings, autoGrade: val })
            }
            label="Auto-grade submissions"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border border-cyan-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-600" />
          AI Quiz Generation
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={quizSettings.aiEnabled}
            onChange={(val) =>
              setQuizSettings({ ...quizSettings, aiEnabled: val })
            }
            label="Enable AI-powered quiz suggestions"
          />
          {quizSettings.aiEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Default Difficulty
                  </label>
                  <select
                    value={quizSettings.aiDifficulty}
                    onChange={(e) =>
                      setQuizSettings({
                        ...quizSettings,
                        aiDifficulty: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Default Questions
                  </label>
                  <input
                    type="number"
                    value={quizSettings.aiQuestions}
                    onChange={(e) =>
                      setQuizSettings({
                        ...quizSettings,
                        aiQuestions: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
                  />
                </div>
              </div>
              <ToggleSwitch
                enabled={quizSettings.autoSend}
                onChange={(val) =>
                  setQuizSettings({ ...quizSettings, autoSend: val })
                }
                label="Auto-send generated quizzes (without review)"
              />
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-600" />
          Exam Mode & Proctoring
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={quizSettings.proctoringEnabled}
            onChange={(val) =>
              setQuizSettings({ ...quizSettings, proctoringEnabled: val })
            }
            label="Enable online proctoring"
          />
          {quizSettings.proctoringEnabled && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Gaze Tracking Threshold (deviations before alert)
                </label>
                <input
                  type="number"
                  value={quizSettings.gazeThreshold}
                  onChange={(e) =>
                    setQuizSettings({
                      ...quizSettings,
                      gazeThreshold: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
                />
              </div>
              <ToggleSwitch
                enabled={quizSettings.headPoseMonitoring}
                onChange={(val) =>
                  setQuizSettings({ ...quizSettings, headPoseMonitoring: val })
                }
                label="Head pose monitoring"
              />
              <ToggleSwitch
                enabled={quizSettings.audioMonitoring}
                onChange={(val) =>
                  setQuizSettings({ ...quizSettings, audioMonitoring: val })
                }
                label="Audio monitoring (detect multiple voices)"
              />
              <ToggleSwitch
                enabled={quizSettings.realtimeAlerts}
                onChange={(val) =>
                  setQuizSettings({ ...quizSettings, realtimeAlerts: val })
                }
                label="Real-time alerts for suspicious activity"
              />
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Quiz & Assessment")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-600" />
          Student Data Collection
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={privacySettings.videoAnalysis}
            onChange={(val) =>
              setPrivacySettings({ ...privacySettings, videoAnalysis: val })
            }
            label="Video analysis (facial expressions, eye tracking)"
          />
          <ToggleSwitch
            enabled={privacySettings.audioAnalysis}
            onChange={(val) =>
              setPrivacySettings({ ...privacySettings, audioAnalysis: val })
            }
            label="Audio analysis (speech patterns, engagement)"
          />
          <ToggleSwitch
            enabled={privacySettings.rPPG}
            onChange={(val) =>
              setPrivacySettings({ ...privacySettings, rPPG: val })
            }
            label="Physiological signals (rPPG - heart rate estimation)"
          />
          <ToggleSwitch
            enabled={privacySettings.screenActivity}
            onChange={(val) =>
              setPrivacySettings({ ...privacySettings, screenActivity: val })
            }
            label="Screen activity monitoring"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Data Sharing
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={privacySettings.shareWithAdmin}
            onChange={(val) =>
              setPrivacySettings({ ...privacySettings, shareWithAdmin: val })
            }
            label="Share anonymized data with administration"
          />
          <ToggleSwitch
            enabled={privacySettings.researchParticipation}
            onChange={(val) =>
              setPrivacySettings({
                ...privacySettings,
                researchParticipation: val,
              })
            }
            label="Allow participation in research studies"
          />
          <ToggleSwitch
            enabled={privacySettings.shareWithParents}
            onChange={(val) =>
              setPrivacySettings({ ...privacySettings, shareWithParents: val })
            }
            label="Share insights with parents (requires consent)"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Data Retention
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Engagement Data
            </label>
            <select
              value={privacySettings.retentionEngagement}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  retentionEngagement: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option value="6months">6 months</option>
              <option value="1year">1 year</option>
              <option value="2years">2 years</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Quiz Results
            </label>
            <select
              value={privacySettings.retentionQuiz}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  retentionQuiz: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option value="1year">1 year</option>
              <option value="2years">2 years</option>
              <option value="5years">5 years</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Notes & Observations
            </label>
            <select
              value={privacySettings.retentionNotes}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  retentionNotes: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option value="graduation">Until graduation</option>
              <option value="1year">1 year after graduation</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Data Export
        </h3>
        <div className="flex gap-4">
          <button className="flex-1 px-6 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Download All Class Data
          </button>
          <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Annual Report
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Privacy & Data")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderCameraSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-600" />
          Camera & Microphone Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Camera Device
            </label>
            <select
              value={cameraSettings.camera}
              onChange={(e) =>
                setCameraSettings({ ...cameraSettings, camera: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option>Built-in Camera</option>
              <option>External Webcam</option>
              <option>USB Camera</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Microphone
            </label>
            <select
              value={cameraSettings.microphone}
              onChange={(e) =>
                setCameraSettings({
                  ...cameraSettings,
                  microphone: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option>Built-in Microphone</option>
              <option>External Microphone</option>
              <option>USB Microphone</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Video Quality
            </label>
            <select
              value={cameraSettings.videoQuality}
              onChange={(e) =>
                setCameraSettings({
                  ...cameraSettings,
                  videoQuality: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
            >
              <option value="low">Low (480p)</option>
              <option value="medium">Medium (720p)</option>
              <option value="high">High (1080p)</option>
            </select>
          </div>
          <ToggleSwitch
            enabled={cameraSettings.autoEnable}
            onChange={(val) =>
              setCameraSettings({ ...cameraSettings, autoEnable: val })
            }
            label="Auto-enable camera in Live Class"
          />
          <ToggleSwitch
            enabled={cameraSettings.noiseCancellation}
            onChange={(val) =>
              setCameraSettings({ ...cameraSettings, noiseCancellation: val })
            }
            label="Noise cancellation"
          />
          <ToggleSwitch
            enabled={cameraSettings.privacyIndicators}
            onChange={(val) =>
              setCameraSettings({ ...cameraSettings, privacyIndicators: val })
            }
            label="Show privacy indicators when camera/mic active"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-gray-700" />
          Test Your Devices
        </h3>
        <div className="space-y-4">
          <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Camera preview will appear here</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Video className="w-5 h-5" />
              Test Camera
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Mic className="w-5 h-5" />
              Test Microphone
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Camera & Audio")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 mb-4">
          <div>
            <p className="font-semibold text-gray-800">2FA Status</p>
            <p className="text-sm text-gray-600">
              {securitySettings.twoFactorEnabled ? "Enabled" : "Not enabled"}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-lg font-semibold ${
              securitySettings.twoFactorEnabled
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {securitySettings.twoFactorEnabled ? "Active" : "Inactive"}
          </span>
        </div>
        <button className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" />
          {securitySettings.twoFactorEnabled ? "Manage 2FA" : "Set up 2FA"}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 ">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Active Sessions
        </h3>
        <div className="space-y-3">
          {securitySettings.sessions.map((session, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="w-4 h-4 text-gray-600" />
                    <p className="font-semibold text-gray-800">
                      {session.device}
                    </p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">📍 {session.location}</p>
                  <p className="text-sm text-gray-500">
                    Last active: {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl bg-red-300 font-semibold hover:bg-red-500 hover:text-red-50 transition-all flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          Sign Out All Other Sessions
        </button>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Timer className="w-5 h-5 text-yellow-600" />
          Auto-Logout
        </h3>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            After inactivity
          </label>
          <select
            value={securitySettings.autoLogout}
            onChange={(e) =>
              setSecuritySettings({
                ...securitySettings,
                autoLogout: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="0">Never</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 font-semibold hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Security")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderHelpSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          Help & Support
        </h3>
        <div className="space-y-3">
          <button className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Video Tutorials</p>
                <p className="text-sm text-gray-600">
                  Watch step-by-step guides
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>

          <button className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Download className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">User Guide (PDF)</p>
                <p className="text-sm text-gray-600">
                  Download complete documentation
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-700" />
          About
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Version</span>
            <span className="font-semibold text-gray-800">v1.0.0</span>
          </div>
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <button className="w-full text-left py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors bg-white border-gray-400">
              Privacy Policy →
            </button>
            <button className="w-full text-left py-2 text-blue-600 hover:text-blue-700 font-medium transition-color bg-white border-gray-400" >
              Terms of Service →
            </button>
            <button className="w-full text-left py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors bg-white border-gray-400">
              Open Source Licenses →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-600" />
          Notification Delivery
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={notifications.inApp}
            onChange={(val) =>
              setNotifications({ ...notifications, inApp: val })
            }
            label="In-App Notifications"
          />
          <ToggleSwitch
            enabled={notifications.email}
            onChange={(val) =>
              setNotifications({ ...notifications, email: val })
            }
            label="Email Notifications"
          />
          <ToggleSwitch
            enabled={notifications.sms}
            onChange={(val) => setNotifications({ ...notifications, sms: val })}
            label="SMS Notifications"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Notification Types
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "lowEngagement",
              label: "Low Engagement Alerts",
              freq: "Real-time",
            },
            {
              key: "studentConcerns",
              label: "Student Concerns",
              freq: "Real-time",
            },
            {
              key: "quizCompletions",
              label: "Quiz Completions",
              freq: "Daily digest",
            },
            { key: "attendance", label: "Attendance Alerts", freq: "Daily" },
            { key: "systemUpdates", label: "System Updates", freq: "Weekly" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">{item.freq}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]: {
                      ...notifications[item.key],
                      enabled: !notifications[item.key].enabled,
                    },
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key].enabled
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[item.key].enabled
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Quiet Hours
        </h3>
        <ToggleSwitch
          enabled={notifications.quietHours.enabled}
          onChange={(val) =>
            setNotifications({
              ...notifications,
              quietHours: { ...notifications.quietHours, enabled: val },
            })
          }
          label="Enable Quiet Hours"
        />
        {notifications.quietHours.enabled && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Start Time
                </label>
                <input
                  type="time"
                  value={notifications.quietHours.start}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      quietHours: {
                        ...notifications.quietHours,
                        start: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  End Time
                </label>
                <input
                  type="time"
                  value={notifications.quietHours.end}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      quietHours: {
                        ...notifications.quietHours,
                        end: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
                />
              </div>
            </div>
            <ToggleSwitch
              enabled={notifications.quietHours.weekends}
              onChange={(val) =>
                setNotifications({
                  ...notifications,
                  quietHours: { ...notifications.quietHours, weekends: val },
                })
              }
              label="Apply to Weekends"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Notifications")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderTeachingSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          Teaching Preferences
        </h3>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Default Session Duration
          </label>
          <select
            value={teachingPrefs.sessionDuration}
            onChange={(e) =>
              setTeachingPrefs({
                ...teachingPrefs,
                sessionDuration: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Break Reminder After
          </label>
          <select
            value={teachingPrefs.breakReminder}
            onChange={(e) =>
              setTeachingPrefs({
                ...teachingPrefs,
                breakReminder: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="0">Never</option>
          </select>
        </div>
        <ToggleSwitch
          enabled={teachingPrefs.autoTracking}
          onChange={(val) =>
            setTeachingPrefs({ ...teachingPrefs, autoTracking: val })
          }
          label="Auto-start engagement tracking"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => handleSave("Teaching Preferences")}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "classes":
        return renderClassesSection();
      case "notifications":
        return renderNotificationsSection();
      case "teaching":
        return renderTeachingSection();
      case "quiz":
        return renderQuizSection();
      case "privacy":
        return renderPrivacySection();
      case "camera":
        return renderCameraSection();
      case "security":
        return renderSecuritySection();
      case "help":
        return renderHelpSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-sm text-gray-600">
            Customize your teaching experience
          </p>
        </div>

        <nav className="space-y-2">
          {menuSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all border ${
                activeSection === section.id
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-400 hover:text-green-700"
              }`}
            >
              <div
                className={activeSection === section.id ? "text-white" : ""}
                style={{
                  color:
                    activeSection !== section.id ? section.color : undefined,
                }}
              >
                {React.cloneElement(section.icon, { className: "w-5 h-5" })}
              </div>
              <span className="flex-1 text-left">{section.label}</span>
              {activeSection === section.id && (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 sticky top-0 z-10 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-2">
              {menuSections.find((s) => s.id === activeSection)?.label}
            </h2>
            <p className="text-green-100">
              {activeSection === "profile" &&
                "Manage your personal information and account details"}
              {activeSection === "classes" &&
                "Organize and manage your classes"}
              {activeSection === "notifications" &&
                "Control how and when you receive notifications"}
              {activeSection === "teaching" &&
                "Customize your teaching preferences and thresholds"}
              {activeSection === "quiz" &&
                "Configure quiz defaults and proctoring settings"}
              {activeSection === "privacy" &&
                "Manage student data collection and privacy settings"}
              {activeSection === "camera" &&
                "Configure camera and audio devices"}
              {activeSection === "security" &&
                "Secure your account and manage sessions"}
              {activeSection === "help" &&
                "Get assistance and access resources"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-5xl mx-auto">{renderSection()}</div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-white border-2 border-green-500 rounded-2xl shadow-2xl p-4 flex items-center gap-3 animate-slideIn z-50">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Success!</p>
            <p className="text-sm text-gray-600">{toastMessage}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TeacherSettings;
