import React, { useState } from 'react';
import {
  Settings,
  Users,
  Building2,
  Target,
  Brain,
  Shield,
  Bell,
  Monitor,
  Database,
  Plug,
  Camera,
  Wrench,
  FileText,
  Upload,
  Save,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  MonitorSpeaker,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Lock,
  Key,
  Link,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  TestTube,
  Server,
  Activity,
  TrendingUp,
  Zap,
  Volume2,
  Eye,
  Palette,
  Database as DatabaseIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const SystemSettings = () => {
  // State management
  const [activeSection, setActiveSection] = useState('General Settings');
  const [savedStates, setSavedStates] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    institution: {
      name: 'Cambridge Institute of Technology NC',
      address: '123 Education Street, Tech Park, NC 27513',
      phone: '+1 (555) 123-4567',
      email: 'admin@studyeyes.com',
      logo: null,
      academicYear: '2024-2025',
      timezone: 'Asia/Kolkata (GMT+5:30)',
      language: 'English'
    },
    systemConfig: {
      sessionDuration: 45,
      dataRetention: '1 year',
      archiveOldData: true,
      autoDeleteAfter: 3
    },
    
    // User Management
    userManagement: {
      permissions: {
        student: ['view_own_data', 'take_quizzes'],
        teacher: ['view_students', 'create_quizzes', 'generate_reports'],
        admin: ['full_access'],
        departmentHead: ['view_department', 'manage_teachers', 'view_reports']
      },
      bulkImport: {
        autoGenerate: true,
        sendWelcomeEmail: true
      },
      accountPolicies: {
        passwordMinLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        sessionTimeout: 30,
        maxConcurrentSessions: 3,
        forcePasswordChange: 90
      }
    },

    // Department Configuration
    departments: {
      maxStudentsPerClass: 30,
      targetEngagement: 75
    },

    // Engagement Thresholds
    engagement: {
      thresholds: {
        high: 75,
        medium: 60,
        low: 40,
        atRisk: 40
      },
      alertTriggers: {
        lowEngagement: { threshold: 60, duration: 5 },
        criticalAlert: { threshold: 40, duration: 2 },
        studentAtRisk: { threshold: 50, consecutiveClasses: 3 },
        teacherPerformance: { threshold: 70 }
      },
      behavioralWeights: {
        cognitive: 25,
        interactive: 20,
        social: 20,
        emotional: 15,
        focus: 20
      }
    },

    // AI & Automation
    aiAutomation: {
      quizGeneration: {
        enabled: true,
        autoGenerateBelow: 65,
        defaultQuestions: 5,
        defaultDifficulty: 'Medium',
        requireApproval: true
      },
      predictiveAnalytics: {
        enabled: true,
        earlyWarning: true,
        predictMinutes: 5
      },
      automatedActions: {
        autoQuiz: false,
        autoFlagAtRisk: true,
        autoSuggestBreaks: true
      },
      modelConfig: {
        confidenceThreshold: 0.75,
        rPPGEnabled: true,
        audioAnalysis: true
      }
    },

    // Privacy & Compliance
    privacy: {
      dataCollection: {
        videoAnalysis: true,
        audioRecording: true,
        physiologicalSignals: true,
        screenCapture: false
      },
      privacyControls: {
        storeRawVideo: false,
        anonymizeAfter: 30,
        studentVisibility: 'Teachers + Admin',
        parentAccess: true
      },
      compliance: {
        gdpr: true,
        ferpa: true,
        consentRequired: true,
        rightToDeletion: true,
        dataExport: true
      },
      auditLogs: {
        trackAccess: true,
        retention: 2
      }
    },

    // Notifications & Alerts
    notifications: {
      global: {
        enabled: true,
        frequency: 'Real-time'
      },
      admin: {
        systemErrors: 'Email + In-app',
        securityIssues: 'Email + SMS',
        lowPerformance: 'Email',
        dailySummary: 'Email at 6 PM'
      },
      teacher: {
        lowEngagement: 'Real-time',
        quizCompletions: 'Daily digest',
        systemUpdates: 'Weekly'
      },
      student: {
        quizAssignments: 'Real-time',
        lowEngagementWarnings: 'Daily',
        achievements: 'Real-time'
      },
      email: {
        smtpServer: 'smtp.studyeyes.com',
        fromEmail: 'noreply@studyeyes.com',
        port: 587,
        encryption: 'TLS'
      }
    },

    // System Monitoring
    monitoring: {
      resourceAlerts: {
        storageThreshold: 80,
        cpuThreshold: 90,
        apiResponseThreshold: 500
      }
    },

    // Backup & Security
    backup: {
      autoBackup: true,
      frequency: 'Daily at 2 AM',
      retention: 30,
      cloudStorage: 'AWS S3'
    },
    security: {
      twoFactorAuth: 'Admin + Teachers',
      ipWhitelist: false,
      maxFailedAttempts: 5,
      lockoutDuration: 30,
      endToEndEncryption: true
    },

    // Integration & API
    integration: {
      api: {
        enabled: true,
        rateLimit: 1000,
        documentation: 'https://docs.studyeyes.com'
      },
      webhooks: {
        enabled: false,
        events: ['user_created', 'quiz_completed', 'alert_triggered']
      },
      dataExport: {
        format: 'JSON',
        schedule: false,
        frequency: 'Weekly'
      }
    },

    // Advanced Configuration
    advanced: {
      camera: {
        defaultQuality: 'Medium (720p)',
        fpsTarget: 15,
        faceDetection: true,
        poseEstimation: true,
        heartRateMonitoring: true
      },
      audio: {
        speakerDiarization: true,
        noiseCancellation: true,
        emotionDetection: true
      },
      performance: {
        caching: true,
        cacheDuration: 5,
        compressImages: true,
        lazyLoad: true
      }
    },

    // Maintenance & Updates
    maintenance: {
      autoUpdate: false,
      notifyBeforeMaintenance: 24
    }
  });

  // Sidebar menu items
  const menuItems = [
    { id: 'General Settings', label: 'General Settings', icon: Settings },
    { id: 'User Management', label: 'User Management', icon: Users },
    { id: 'Department Configuration', label: 'Department Configuration', icon: Building2 },
    { id: 'Engagement Thresholds', label: 'Engagement Thresholds', icon: Target },
    { id: 'AI & Automation', label: 'AI & Automation', icon: Brain },
    { id: 'Privacy & Compliance', label: 'Privacy & Compliance', icon: Shield },
    { id: 'Notifications & Alerts', label: 'Notifications & Alerts', icon: Bell },
    { id: 'System Monitoring', label: 'System Monitoring', icon: Monitor },
    { id: 'Backup & Security', label: 'Backup & Security', icon: Database },
    { id: 'Integration & API', label: 'Integration & API', icon: Plug },
    { id: 'Advanced Configuration', label: 'Advanced Configuration', icon: Camera },
    { id: 'Maintenance & Updates', label: 'Maintenance & Updates', icon: Wrench },
    { id: 'Logs & Reports', label: 'Logs & Reports', icon: FileText }
  ];

  // Utility functions
  const handleToggle = (section, subsection, field) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: !prev[section][subsection][field]
        }
      }
    }));
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    setSavedStates(prev => ({ ...prev, [activeSection]: true }));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleReset = () => {
    setShowConfirmDialog('reset');
  };

  const confirmAction = (action) => {
    if (action === 'reset') {
      // Reset to default values for current section
      window.location.reload(); // Simple reset for demo
    }
    setShowConfirmDialog(null);
  };

  // Component renders
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Institution Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          Institution Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Institution Name</label>
            <input
              type="text"
              value={settings.institution.name}
              onChange={(e) => handleNestedInputChange('institution', 'name', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Academic Year</label>
            <select
              value={settings.institution.academicYear}
              onChange={(e) => handleNestedInputChange('institution', 'academicYear', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>2024-2025</option>
              <option>2025-2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={settings.institution.timezone}
              onChange={(e) => handleNestedInputChange('institution', 'timezone', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Asia/Kolkata (GMT+5:30)</option>
              <option>America/New_York (GMT-5)</option>
              <option>Europe/London (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={settings.institution.language}
              onChange={(e) => handleNestedInputChange('institution', 'language', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={settings.institution.address}
              onChange={(e) => handleNestedInputChange('institution', 'address', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={settings.institution.phone}
              onChange={(e) => handleNestedInputChange('institution', 'phone', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={settings.institution.email}
              onChange={(e) => handleNestedInputChange('institution', 'email', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Logo Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-600">Click to upload logo</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-600" />
          System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Session Duration (min)</label>
            <input
              type="number"
              value={settings.systemConfig.sessionDuration}
              onChange={(e) => handleNestedInputChange('systemConfig', 'sessionDuration', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Data Retention Period</label>
            <select
              value={settings.systemConfig.dataRetention}
              onChange={(e) => handleNestedInputChange('systemConfig', 'dataRetention', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>1 year</option>
              <option>2 years</option>
              <option>Until graduation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auto-delete after (years)</label>
            <input
              type="number"
              value={settings.systemConfig.autoDeleteAfter}
              onChange={(e) => handleNestedInputChange('systemConfig', 'autoDeleteAfter', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.systemConfig.archiveOldData}
                onChange={() => handleToggle('systemConfig', 'archiveOldData')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm">Archive old data</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Role Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          Role Configuration
        </h3>
        <div className="space-y-4">
          {Object.entries(settings.userManagement.permissions).map(([role, permissions]) => (
            <div key={role} className="border rounded-lg p-4">
              <h4 className="font-medium capitalize mb-2">{role} Permissions</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {permissions.map(permission => (
                  <label key={permission} className="flex items-center gap-2">
                    <input type="checkbox" checked className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">{permission.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Policies */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Account Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Password Length</label>
            <input
              type="number"
              value={settings.userManagement.accountPolicies.passwordMinLength}
              onChange={(e) => handleNestedInputChange('userManagement', 'accountPolicies', 'passwordMinLength', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Session Timeout (min)</label>
            <select
              value={settings.userManagement.accountPolicies.sessionTimeout}
              onChange={(e) => handleNestedInputChange('userManagement', 'accountPolicies', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Concurrent Sessions</label>
            <input
              type="number"
              value={settings.userManagement.accountPolicies.maxConcurrentSessions}
              onChange={(e) => handleNestedInputChange('userManagement', 'accountPolicies', 'maxConcurrentSessions', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Force Password Change (days)</label>
            <input
              type="number"
              value={settings.userManagement.accountPolicies.forcePasswordChange}
              onChange={(e) => handleNestedInputChange('userManagement', 'accountPolicies', 'forcePasswordChange', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.userManagement.accountPolicies.requireSpecialChar}
                onChange={() => handleToggle('userManagement', 'accountPolicies', 'requireSpecialChar')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm">Require special character</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.userManagement.accountPolicies.requireNumber}
                onChange={() => handleToggle('userManagement', 'accountPolicies', 'requireNumber')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm">Require number</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemMonitoring = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-orange-600" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">52%</div>
            <div className="text-sm text-gray-600">CPU Usage</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <MemoryStick className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">68%</div>
            <div className="text-sm text-gray-600">Memory</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <HardDrive className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">68%</div>
            <div className="text-sm text-gray-600">Storage (340GB/500GB)</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">542</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <Activity className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-600">142ms</div>
            <div className="text-sm text-gray-600">API Response</div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-teal-600">99.8%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5 text-green-600" />
              Database Status
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Healthy
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Last Restart
            </span>
            <span className="text-gray-600">5 days ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Total Sessions Today
            </span>
            <span className="font-medium">1,245</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Peak Concurrent Users
            </span>
            <span className="font-medium">678</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Avg Session Duration
            </span>
            <span className="font-medium">38 min</span>
          </div>
        </div>
      </div>

      {/* Resource Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Resource Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Alert when storage >80%</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.monitoring.resourceAlerts.storageThreshold > 80}
                onChange={() => {}}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Alert when CPU >90%</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.monitoring.resourceAlerts.cpuThreshold > 90}
                onChange={() => {}}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Alert when API slow (>500ms)</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.monitoring.resourceAlerts.apiResponseThreshold > 500}
                onChange={() => {}}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyCompliance = () => (
    <div className="space-y-6">
      {/* Data Collection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-orange-600" />
          Data Collection
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Video analysis</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacy.dataCollection.videoAnalysis}
                onChange={() => handleToggle('privacy', 'dataCollection', 'videoAnalysis')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Audio recording</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacy.dataCollection.audioRecording}
                onChange={() => handleToggle('privacy', 'dataCollection', 'audioRecording')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Physiological signals</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacy.dataCollection.physiologicalSignals}
                onChange={() => handleToggle('privacy', 'dataCollection', 'physiologicalSignals')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Screen capture (exam mode)</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacy.dataCollection.screenCapture}
                onChange={() => handleToggle('privacy', 'dataCollection', 'screenCapture')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-gray-600">Disabled</span>
            </label>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          Compliance Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>GDPR compliant</span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>FERPA compliant</span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Consent forms required</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacy.compliance.consentRequired}
                onChange={() => handleToggle('privacy', 'compliance', 'consentRequired')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Right to deletion</span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Anonymize data after (days)</label>
            <input
              type="number"
              value={settings.privacy.privacyControls.anonymizeAfter}
              onChange={(e) => handleNestedInputChange('privacy', 'privacyControls', 'anonymizeAfter', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Student data visible to</label>
            <select
              value={settings.privacy.privacyControls.studentVisibility}
              onChange={(e) => handleNestedInputChange('privacy', 'privacyControls', 'studentVisibility', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Teachers + Admin</option>
              <option>Only Admin</option>
              <option>Teachers only</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Parent access (with consent)</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacy.privacyControls.parentAccess}
                onChange={() => handleToggle('privacy', 'privacyControls', 'parentAccess')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Store raw video (privacy-first approach)</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.privacy.privacyControls.storeRawVideo}
                onChange={() => handleToggle('privacy', 'privacyControls', 'storeRawVideo')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-red-600">Disabled</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIAndAutomation = () => (
    <div className="space-y-6">
      {/* AI Quiz Generation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-600" />
          AI Quiz Generation
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Enable auto-generation</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.aiAutomation.quizGeneration.enabled}
                onChange={() => handleToggle('aiAutomation', 'quizGeneration', 'enabled')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auto-generate when engagement drops below (%)</label>
            <input
              type="number"
              value={settings.aiAutomation.quizGeneration.autoGenerateBelow}
              onChange={(e) => handleNestedInputChange('aiAutomation', 'quizGeneration', 'autoGenerateBelow', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Default questions</label>
            <input
              type="number"
              value={settings.aiAutomation.quizGeneration.defaultQuestions}
              onChange={(e) => handleNestedInputChange('aiAutomation', 'quizGeneration', 'defaultQuestions', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Default difficulty</label>
            <select
              value={settings.aiAutomation.quizGeneration.defaultDifficulty}
              onChange={(e) => handleNestedInputChange('aiAutomation', 'quizGeneration', 'defaultDifficulty', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Require teacher approval</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.aiAutomation.quizGeneration.requireApproval}
                onChange={() => handleToggle('aiAutomation', 'quizGeneration', 'requireApproval')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Predictive Analytics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Enable engagement prediction</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.aiAutomation.predictiveAnalytics.enabled}
                onChange={() => handleToggle('aiAutomation', 'predictiveAnalytics', 'enabled')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Early warning system</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.aiAutomation.predictiveAnalytics.earlyWarning}
                onChange={() => handleToggle('aiAutomation', 'predictiveAnalytics', 'earlyWarning')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Predict disengagement (minutes ahead)</label>
            <input
              type="number"
              value={settings.aiAutomation.predictiveAnalytics.predictMinutes}
              onChange={(e) => handleNestedInputChange('aiAutomation', 'predictiveAnalytics', 'predictMinutes', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Model Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Model Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Confidence threshold</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={settings.aiAutomation.modelConfig.confidenceThreshold}
              onChange={(e) => handleNestedInputChange('aiAutomation', 'modelConfig', 'confidenceThreshold', parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>rPPG enabled</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.aiAutomation.modelConfig.rPPGEnabled}
                onChange={() => handleToggle('aiAutomation', 'modelConfig', 'rPPGEnabled')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Audio analysis</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.aiAutomation.modelConfig.audioAnalysis}
                onChange={() => handleToggle('aiAutomation', 'modelConfig', 'audioAnalysis')}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-green-600">Enabled</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagementThresholds = () => (
    <div className="space-y-6">
      {/* Performance Tiers */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          Performance Tiers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">High Performance (%)</label>
            <input
              type="number"
              value={settings.engagement.thresholds.high}
              onChange={(e) => handleNestedInputChange('engagement', 'thresholds', 'high', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Medium Performance (%)</label>
            <input
              type="number"
              value={settings.engagement.thresholds.medium}
              onChange={(e) => handleNestedInputChange('engagement', 'thresholds', 'medium', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Low Performance (%)</label>
            <input
              type="number"
              value={settings.engagement.thresholds.low}
              onChange={(e) => handleNestedInputChange('engagement', 'thresholds', 'low', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Behavioral Weights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Behavioral Weights</h3>
        <div className="space-y-4">
          {Object.entries(settings.engagement.behavioralWeights).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')} Engagement</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={value}
                  onChange={(e) => handleNestedInputChange('engagement', 'behavioralWeights', key, parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{value}%</span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-medium">
                {Object.values(settings.engagement.behavioralWeights).reduce((a, b) => a + b, 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Triggers */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Alert Triggers</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Low engagement alert threshold (%)</label>
            <input
              type="number"
              value={settings.engagement.alertTriggers.lowEngagement.threshold}
              onChange={(e) => handleNestedInputChange('engagement', 'alertTriggers', 'lowEngagement', { ...settings.engagement.alertTriggers.lowEngagement, threshold: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={settings.engagement.alertTriggers.lowEngagement.duration}
              onChange={(e) => handleNestedInputChange('engagement', 'alertTriggers', 'lowEngagement', { ...settings.engagement.alertTriggers.lowEngagement, duration: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Critical alert threshold (%)</label>
            <input
              type="number"
              value={settings.engagement.alertTriggers.criticalAlert.threshold}
              onChange={(e) => handleNestedInputChange('engagement', 'alertTriggers', 'criticalAlert', { ...settings.engagement.alertTriggers.criticalAlert, threshold: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Main render function
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'General Settings':
        return renderGeneralSettings();
      case 'User Management':
        return renderUserManagement();
      case 'System Monitoring':
        return renderSystemMonitoring();
      case 'Privacy & Compliance':
        return renderPrivacyCompliance();
      case 'AI & Automation':
        return renderAIAndAutomation();
      case 'Engagement Thresholds':
        return renderEngagementThresholds();
      case 'Backup & Security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-600" />
                Backup Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auto-backup enabled</span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.backup.autoBackup}
                      onChange={() => handleToggle('backup', 'autoBackup')}
                      className="w-4 h-4 text-orange-600"
                    />
                    <span className="text-sm text-green-600">Enabled</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Backup frequency</label>
                  <select
                    value={settings.backup.frequency}
                    onChange={(e) => handleNestedInputChange('backup', 'frequency', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option>Daily at 2 AM</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Retention period (days)</label>
                  <input
                    type="number"
                    value={settings.backup.retention}
                    onChange={(e) => handleNestedInputChange('backup', 'retention', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Last backup: Oct 29, 2:00 AM</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Success
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
                    <Database className="w-4 h-4" />
                    Run Backup Now
                  </button>
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    Restore from Backup
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-600" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Two-factor auth required for</label>
                  <select
                    value={settings.security.twoFactorAuth}
                    onChange={(e) => handleNestedInputChange('security', 'twoFactorAuth', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option>Admin + Teachers</option>
                    <option>Admin only</option>
                    <option>All users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max failed login attempts</label>
                  <input
                    type="number"
                    value={settings.security.maxFailedAttempts}
                    onChange={(e) => handleNestedInputChange('security', 'maxFailedAttempts', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account lockout duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => handleNestedInputChange('security', 'lockoutDuration', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>End-to-end encryption</span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.security.endToEndEncryption}
                      onChange={() => handleToggle('security', 'endToEndEncryption')}
                      className="w-4 h-4 text-orange-600"
                    />
                    <span className="text-sm text-green-600">Enabled</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">{activeSection}</h3>
            <p className="text-gray-600">This section is under development. Full implementation coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            System Settings
          </h2>
        </div>
        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeSection === item.id
                      ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {renderActiveSection()}
            
            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Changes saved successfully!</span>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Confirm Action</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction(showConfirmDialog)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;