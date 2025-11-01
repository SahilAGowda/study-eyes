import React, { useState } from 'react';
import { Camera, Mic, Bell, Lock, User, Eye, Palette, Book, HelpCircle, Info, ChevronRight, Save, X, Check, AlertTriangle, Upload, Moon, Sun, Shield, LogOut, Trash2, Download, Settings as SettingsIcon, Mail, Phone, Calendar, Globe, Clock } from 'lucide-react';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showModal, setShowModal] = useState(null);

  const [settings, setSettings] = useState({
    fullName: 'Alex Johnson',
    email: 'alex.johnson@school.edu',
    emailVerified: true,
    phone: '+1 (555) 123-4567',
    grade: '10',
    dateOfBirth: '2008-05-15',
    username: 'alexj2024',
    language: 'en',
    timezone: 'America/New_York',
    parentEmail: 'parent@email.com',
    engagementMonitoring: true,
    videoAnalysis: false,
    audioAnalysis: true,
    physiologicalSignals: false,
    screenActivity: true,
    dataRetention: '1year',
    anonymizedBenchmarking: true,
    shareWithTeachers: true,
    shareWithParents: true,
    sessionRecording: true,
    autoDeleteRecordings: '30days',
    inAppNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    quizReminders: true,
    teacherMessages: true,
    engagementAlerts: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    notificationSound: true,
    emailDigest: 'daily',
    learningStyle: 'visual',
    dailyStudyGoal: 60,
    weeklyEngagement: 300,
    focusSessionDuration: 25,
    breakFrequency: 5,
    studyReminders: true,
    streakReminders: true,
    defaultSessionLength: 30,
    autoStartNext: false,
    backgroundMusic: 'lofi',
    aiRecommendations: true,
    theme: 'light',
    fontSize: 'medium',
    compactView: false,
    animations: true,
    reduceMotion: false,
    dateFormat: 'MM/DD/YYYY',
    firstDayOfWeek: 'sunday',
    selectedCamera: 'default',
    videoQuality: 'hd',
    autoEnableCamera: false,
    selectedMicrophone: 'default',
    micVolume: 75,
    noiseCancellation: true,
    autoEnableMic: false,
    showPrivacyIndicator: true,
    blurBackground: false,
    twoFactorEnabled: false,
    autoLogout: 30,
    requirePasswordForData: true
  });

  const [tempPassword, setTempPassword] = useState({ current: '', new: '', confirm: '' });

  const menuSections = [
    { id: 'profile', icon: User, label: 'Profile & Account' },
    { id: 'privacy', icon: Eye, label: 'Privacy & Data' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'study', icon: Book, label: 'Study Preferences' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'camera', icon: Camera, label: 'Camera & Audio' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
    { id: 'about', icon: Info, label: 'About' }
  ];

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    setTimeout(() => {
      setUnsavedChanges(false);
      setToastMessage('Changes saved successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 500);
  };

  const handleCancel = () => {
    setUnsavedChanges(false);
    setToastMessage('Changes discarded');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const Modal = ({ title, children, onClose, onConfirm, danger = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
          {children}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white transition-colors font-medium ${
                danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingCard = ({ title, description, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}
      {children}
    </div>
  );

  const Toggle = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1">
        <span className="text-gray-800 font-medium block">{label}</span>
        {description && <span className="text-sm text-gray-500">{description}</span>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          enabled ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none text-gray-900`}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, icon: Icon, children, ...props }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />}
        <select
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none appearance-none text-gray-900`}
        >
          {children}
        </select>
        <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={18} />
      </div>
    </div>
  );

  const renderProfileSection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Profile & Account</h2>
      
      <SettingCard title="Profile Information">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-100">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              AJ
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2.5 rounded-full hover:bg-blue-600 transition-all shadow-lg hover:scale-110">
              <Upload size={18} />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-gray-800">{settings.fullName}</h4>
            <p className="text-gray-500">@{settings.username}</p>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">Grade {settings.grade}</span>
              {settings.emailVerified && (
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium flex items-center gap-1">
                  <Check size={14} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Full Name" icon={User} type="text" value={settings.fullName} onChange={(e) => updateSetting('fullName', e.target.value)} />
          <InputField label="Username" type="text" value={settings.username} onChange={(e) => updateSetting('username', e.target.value)} />
          <InputField label="Email Address" icon={Mail} type="email" value={settings.email} onChange={(e) => updateSetting('email', e.target.value)} />
          <InputField label="Phone Number" icon={Phone} type="tel" value={settings.phone} onChange={(e) => updateSetting('phone', e.target.value)} />
          <SelectField label="Grade Level" value={settings.grade} onChange={(e) => updateSetting('grade', e.target.value)}>
            {[9, 10, 11, 12].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </SelectField>
          <InputField label="Date of Birth" icon={Calendar} type="date" value={settings.dateOfBirth} onChange={(e) => updateSetting('dateOfBirth', e.target.value)} />
        </div>
      </SettingCard>

      <SettingCard title="Account Settings">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField label="Preferred Language" icon={Globe} value={settings.language} onChange={(e) => updateSetting('language', e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </SelectField>
            <SelectField label="Time Zone" icon={Clock} value={settings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)}>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </SelectField>
          </div>
          <InputField label="Parent/Guardian Email" icon={Mail} type="email" value={settings.parentEmail} onChange={(e) => updateSetting('parentEmail', e.target.value)} />
          <button
            onClick={() => setShowModal('password')}
            className="w-full px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all font-medium flex items-center justify-center gap-2 border border-blue-200"
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </SettingCard>

      <SettingCard title="Danger Zone">
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>These actions are irreversible. Please be certain before proceeding.</span>
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setShowModal('deactivate')}
            className="w-full px-5 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium border border-orange-200"
          >
            Deactivate Account
          </button>
          <button
            onClick={() => setShowModal('delete')}
            className="w-full px-5 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
          >
            Delete Account Permanently
          </button>
        </div>
      </SettingCard>
    </div>
  );

  const renderPrivacySection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Privacy & Data</h2>
      
      <SettingCard title="Data Collection" description="Control what data is collected during your study sessions">
        <div className="space-y-1">
          <Toggle enabled={settings.engagementMonitoring} onChange={(v) => updateSetting('engagementMonitoring', v)} label="Engagement Monitoring" description="Track your focus and participation" />
          <Toggle enabled={settings.videoAnalysis} onChange={(v) => updateSetting('videoAnalysis', v)} label="Video Analysis" description="Analyze facial expressions and attention" />
          <Toggle enabled={settings.audioAnalysis} onChange={(v) => updateSetting('audioAnalysis', v)} label="Audio Analysis" description="Monitor voice patterns and participation" />
          <Toggle enabled={settings.physiologicalSignals} onChange={(v) => updateSetting('physiologicalSignals', v)} label="Physiological Signals" description="Track heart rate and stress levels" />
          <Toggle enabled={settings.screenActivity} onChange={(v) => updateSetting('screenActivity', v)} label="Screen Activity Tracking" description="Monitor screen time and app usage" />
        </div>
      </SettingCard>

      <SettingCard title="Data Retention">
        <div className="space-y-5">
          <SelectField label="Keep my data for" value={settings.dataRetention} onChange={(e) => updateSetting('dataRetention', e.target.value)}>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
            <option value="2years">2 Years</option>
            <option value="forever">Forever</option>
          </SelectField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="px-5 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium border border-blue-200">
              <Download size={18} /> Download My Data
            </button>
            <button className="px-5 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium border border-red-200">
              <Trash2 size={18} /> Delete My Data
            </button>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Privacy Settings" description="Control who can see your data">
        <div className="space-y-1">
          <Toggle enabled={settings.anonymizedBenchmarking} onChange={(v) => updateSetting('anonymizedBenchmarking', v)} label="Anonymized Benchmarking" description="Compare your performance anonymously" />
          <Toggle enabled={settings.shareWithTeachers} onChange={(v) => updateSetting('shareWithTeachers', v)} label="Share Data with Teachers" description="Allow teachers to view your progress" />
          <Toggle enabled={settings.shareWithParents} onChange={(v) => updateSetting('shareWithParents', v)} label="Share Data with Parents" description="Allow parents to see your activity" />
        </div>
      </SettingCard>

      <SettingCard title="Session Recording">
        <div className="space-y-5">
          <Toggle enabled={settings.sessionRecording} onChange={(v) => updateSetting('sessionRecording', v)} label="Enable Session Recording" description="Record study sessions for review" />
          <SelectField label="Auto-delete recordings after" value={settings.autoDeleteRecordings} onChange={(e) => updateSetting('autoDeleteRecordings', e.target.value)}>
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
            <option value="90days">90 Days</option>
            <option value="never">Never</option>
          </SelectField>
        </div>
      </SettingCard>
    </div>
  );

  const renderNotificationsSection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>
      
      <SettingCard title="Delivery Methods" description="Choose how you want to receive notifications">
        <div className="space-y-1">
          <Toggle enabled={settings.inAppNotifications} onChange={(v) => updateSetting('inAppNotifications', v)} label="In-App Notifications" description="Show notifications within the app" />
          <Toggle enabled={settings.emailNotifications} onChange={(v) => updateSetting('emailNotifications', v)} label="Email Notifications" description="Receive updates via email" />
          <Toggle enabled={settings.smsNotifications} onChange={(v) => updateSetting('smsNotifications', v)} label="SMS Notifications" description="Get text message alerts" />
          <Toggle enabled={settings.pushNotifications} onChange={(v) => updateSetting('pushNotifications', v)} label="Push Notifications" description="Desktop and mobile push alerts" />
        </div>
      </SettingCard>

      <SettingCard title="Notification Types" description="Select which notifications you want to receive">
        <div className="space-y-1">
          <Toggle enabled={settings.quizReminders} onChange={(v) => updateSetting('quizReminders', v)} label="Quiz Reminders" description="Upcoming quizzes and assignments" />
          <Toggle enabled={settings.teacherMessages} onChange={(v) => updateSetting('teacherMessages', v)} label="Teacher Messages" description="Messages from your teachers" />
          <Toggle enabled={settings.engagementAlerts} onChange={(v) => updateSetting('engagementAlerts', v)} label="Engagement Alerts" description="Alerts about your study patterns" />
          <Toggle enabled={settings.studyReminders} onChange={(v) => updateSetting('studyReminders', v)} label="Study Reminders" description="Daily study session reminders" />
          <Toggle enabled={settings.streakReminders} onChange={(v) => updateSetting('streakReminders', v)} label="Streak Reminders" description="Maintain your study streak" />
        </div>
      </SettingCard>

      <SettingCard title="Quiet Hours" description="Set times when you don't want to be disturbed">
        <div className="space-y-5">
          <Toggle enabled={settings.quietHoursEnabled} onChange={(v) => updateSetting('quietHoursEnabled', v)} label="Enable Quiet Hours" />
          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-4 border-blue-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </SettingCard>

      <SettingCard title="Sound & Email Digest">
        <div className="space-y-5">
          <Toggle enabled={settings.notificationSound} onChange={(v) => updateSetting('notificationSound', v)} label="Notification Sounds" description="Play sound when notifications arrive" />
          <SelectField label="Email Digest Frequency" value={settings.emailDigest} onChange={(e) => updateSetting('emailDigest', e.target.value)}>
            <option value="realtime">Real-time (immediately)</option>
            <option value="daily">Daily Digest</option>
            <option value="weekly">Weekly Digest</option>
            <option value="never">Never</option>
          </SelectField>
        </div>
      </SettingCard>
    </div>
  );

  const renderStudySection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Study Preferences</h2>
      
      <SettingCard title="Learning Style" description="Choose your preferred learning method">
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'visual', label: 'Visual', desc: 'Pictures & diagrams' },
            { value: 'auditory', label: 'Auditory', desc: 'Listening & speaking' },
            { value: 'kinesthetic', label: 'Kinesthetic', desc: 'Hands-on practice' },
            { value: 'reading', label: 'Reading/Writing', desc: 'Text-based learning' }
          ].map(style => (
            <button
              key={style.value}
              onClick={() => updateSetting('learningStyle', style.value)}
              className={`px-4 py-4 rounded-lg border-2 transition-all text-left ${
                settings.learningStyle === style.value
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`font-semibold ${settings.learningStyle === style.value ? 'text-blue-700' : 'text-gray-800'}`}>
                {style.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">{style.desc}</div>
            </button>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="Study Goals" description="Set your daily and weekly study targets">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Daily Study Goal</label>
              <span className="text-lg font-bold text-blue-600">{settings.dailyStudyGoal} min</span>
            </div>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={settings.dailyStudyGoal}
              onChange={(e) => updateSetting('dailyStudyGoal', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15 min</span>
              <span>180 min</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Weekly Engagement</label>
              <span className="text-lg font-bold text-blue-600">{settings.weeklyEngagement} min</span>
            </div>
            <input
              type="range"
              min="60"
              max="1200"
              step="60"
              value={settings.weeklyEngagement}
              onChange={(e) => updateSetting('weeklyEngagement', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 hr</span>
              <span>20 hrs</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Focus Session Duration</label>
              <span className="text-lg font-bold text-blue-600">{settings.focusSessionDuration} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={settings.focusSessionDuration}
              onChange={(e) => updateSetting('focusSessionDuration', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Break Frequency</label>
              <span className="text-lg font-bold text-blue-600">{settings.breakFrequency} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={settings.breakFrequency}
              onChange={(e) => updateSetting('breakFrequency', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>30 min</span>
            </div>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Session Preferences" description="Customize your study session experience">
        <div className="space-y-5">
          <SelectField label="Default Session Length" value={settings.defaultSessionLength} onChange={(e) => updateSetting('defaultSessionLength', parseInt(e.target.value))}>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </SelectField>
          <Toggle enabled={settings.autoStartNext} onChange={(v) => updateSetting('autoStartNext', v)} label="Auto-start Next Session" description="Automatically begin the next session" />
          <SelectField label="Background Music" value={settings.backgroundMusic} onChange={(e) => updateSetting('backgroundMusic', e.target.value)}>
            <option value="none">None (Silence)</option>
            <option value="lofi">Lo-fi Hip Hop</option>
            <option value="classical">Classical Music</option>
            <option value="nature">Nature Sounds</option>
            <option value="ambient">Ambient Sounds</option>
          </SelectField>
          <Toggle enabled={settings.aiRecommendations} onChange={(v) => updateSetting('aiRecommendations', v)} label="AI Study Recommendations" description="Get personalized study suggestions" />
        </div>
      </SettingCard>
    </div>
  );

  const renderAppearanceSection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Appearance</h2>
      
      <SettingCard title="Theme Selection" description="Choose your preferred color scheme">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateSetting('theme', 'light')}
            className={`px-6 py-8 rounded-xl border-2 transition-all ${
              settings.theme === 'light'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Sun className={`mx-auto mb-3 ${settings.theme === 'light' ? 'text-blue-600' : 'text-yellow-500'}`} size={40} />
            <span className="block font-bold text-gray-800">Light Mode</span>
            <span className="block text-sm text-gray-500 mt-1">Easy on the eyes</span>
          </button>
          <button
            onClick={() => updateSetting('theme', 'dark')}
            className={`px-6 py-8 rounded-xl border-2 transition-all ${
              settings.theme === 'dark'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Moon className={`mx-auto mb-3 ${settings.theme === 'dark' ? 'text-blue-600' : 'text-indigo-500'}`} size={40} />
            <span className="block font-bold text-gray-800">Dark Mode</span>
            <span className="block text-sm text-gray-500 mt-1">Reduce eye strain</span>
          </button>
        </div>
      </SettingCard>

      <SettingCard title="Display Settings" description="Adjust how content is displayed">
        <div className="space-y-5">
          <SelectField label="Font Size" value={settings.fontSize} onChange={(e) => updateSetting('fontSize', e.target.value)}>
            <option value="small">Small (12px)</option>
            <option value="medium">Medium (14px)</option>
            <option value="large">Large (16px)</option>
            <option value="xlarge">Extra Large (18px)</option>
          </SelectField>
          <Toggle enabled={settings.compactView} onChange={(v) => updateSetting('compactView', v)} label="Compact View" description="Show more content in less space" />
          <Toggle enabled={settings.animations} onChange={(v) => updateSetting('animations', v)} label="Animations Enabled" description="Smooth transitions and effects" />
          <Toggle enabled={settings.reduceMotion} onChange={(v) => updateSetting('reduceMotion', v)} label="Reduce Motion" description="Minimize animations for accessibility" />
        </div>
      </SettingCard>

      <SettingCard title="Language & Region" description="Customize regional preferences">
        <div className="space-y-5">
          <SelectField label="Date Format" value={settings.dateFormat} onChange={(e) => updateSetting('dateFormat', e.target.value)}>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (UK)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
          </SelectField>
          <SelectField label="First Day of Week" value={settings.firstDayOfWeek} onChange={(e) => updateSetting('firstDayOfWeek', e.target.value)}>
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
          </SelectField>
        </div>
      </SettingCard>
    </div>
  );

  const renderCameraSection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Camera & Audio</h2>
      
      <SettingCard title="Camera Settings" description="Configure your camera preferences">
        <div className="space-y-5">
          <SelectField label="Camera Device" icon={Camera} value={settings.selectedCamera} onChange={(e) => updateSetting('selectedCamera', e.target.value)}>
            <option value="default">Default Camera</option>
            <option value="camera1">Front Camera</option>
            <option value="camera2">Back Camera</option>
            <option value="camera3">External Webcam</option>
          </SelectField>
          <SelectField label="Video Quality" value={settings.videoQuality} onChange={(e) => updateSetting('videoQuality', e.target.value)}>
            <option value="low">Low (360p) - Save bandwidth</option>
            <option value="medium">Medium (480p) - Balanced</option>
            <option value="hd">HD (720p) - High quality</option>
            <option value="fullhd">Full HD (1080p) - Best quality</option>
          </SelectField>
          <Toggle enabled={settings.autoEnableCamera} onChange={(v) => updateSetting('autoEnableCamera', v)} label="Auto-enable Camera on Join" description="Turn on camera when joining sessions" />
          <Toggle enabled={settings.blurBackground} onChange={(v) => updateSetting('blurBackground', v)} label="Blur Background" description="Apply background blur effect" />
        </div>
      </SettingCard>

      <SettingCard title="Microphone Settings" description="Configure your audio input">
        <div className="space-y-5">
          <SelectField label="Microphone Device" icon={Mic} value={settings.selectedMicrophone} onChange={(e) => updateSetting('selectedMicrophone', e.target.value)}>
            <option value="default">Default Microphone</option>
            <option value="mic1">Built-in Microphone</option>
            <option value="mic2">External Microphone</option>
            <option value="mic3">Headset Microphone</option>
          </SelectField>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Microphone Volume</label>
              <span className="text-lg font-bold text-blue-600">{settings.micVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.micVolume}
              onChange={(e) => updateSetting('micVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          <Toggle enabled={settings.noiseCancellation} onChange={(v) => updateSetting('noiseCancellation', v)} label="Noise Cancellation" description="Reduce background noise" />
          <Toggle enabled={settings.autoEnableMic} onChange={(v) => updateSetting('autoEnableMic', v)} label="Auto-enable Microphone on Join" description="Turn on mic when joining sessions" />
        </div>
      </SettingCard>

      <SettingCard title="Privacy Indicators">
        <div className="space-y-5">
          <Toggle enabled={settings.showPrivacyIndicator} onChange={(v) => updateSetting('showPrivacyIndicator', v)} label="Show Active Camera/Mic Indicator" description="Display when camera or mic is active" />
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="font-semibold text-gray-800">Camera & Microphone Permissions</p>
            </div>
            <p className="text-sm text-gray-600">
              Status: <span className="font-semibold text-green-600">Granted</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Your browser has allowed access to camera and microphone</p>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderSecuritySection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Security</h2>
      
      <SettingCard title="Login Security" description="Protect your account with additional security">
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex-1">
              <span className="block font-semibold text-gray-800">Two-Factor Authentication (2FA)</span>
              <span className="text-sm text-gray-500">Add an extra layer of security to your account</span>
            </div>
            <button
              onClick={() => setShowModal('2fa')}
              className={`px-5 py-2 rounded-lg transition-colors font-medium ${
                settings.twoFactorEnabled
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {settings.twoFactorEnabled ? '✓ Enabled' : 'Enable 2FA'}
            </button>
          </div>
          <SelectField label="Auto-logout after inactivity" value={settings.autoLogout} onChange={(e) => updateSetting('autoLogout', parseInt(e.target.value))}>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="0">Never</option>
          </SelectField>
          <Toggle enabled={settings.requirePasswordForData} onChange={(v) => updateSetting('requirePasswordForData', v)} label="Require Password for Sensitive Data" description="Add password confirmation for critical actions" />
        </div>
      </SettingCard>

      <SettingCard title="Active Sessions" description="Manage devices where you're logged in">
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">Chrome on Windows</p>
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">Current</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">New York, NY • Active now</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Safari on iPhone</p>
              <p className="text-sm text-gray-500 mt-1">Boston, MA • 2 hours ago</p>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm font-semibold hover:underline">Sign Out</button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Firefox on MacBook</p>
              <p className="text-sm text-gray-500 mt-1">New York, NY • Yesterday</p>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm font-semibold hover:underline">Sign Out</button>
          </div>
          <button
            onClick={() => setShowModal('signoutAll')}
            className="w-full px-5 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2 border border-red-200 mt-4"
          >
            <LogOut size={18} />
            Sign Out All Other Sessions
          </button>
        </div>
      </SettingCard>

      <SettingCard title="Login History" description="Review recent login attempts">
        <div className="space-y-2">
          {[
            { time: '2 hours ago', location: 'New York, NY', device: 'Chrome on Windows', status: 'success' },
            { time: '1 day ago', location: 'Boston, MA', device: 'Safari on iPhone', status: 'success' },
            { time: '2 days ago', location: 'New York, NY', device: 'Chrome on Windows', status: 'success' },
            { time: '3 days ago', location: 'Unknown Location', device: 'Firefox on Linux', status: 'failed' }
          ].map((login, idx) => (
            <div key={idx} className={`p-4 rounded-lg flex items-start gap-3 ${login.status === 'failed' ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`mt-1 p-1.5 rounded-full ${login.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {login.status === 'success' ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <X size={14} className="text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{login.device}</p>
                <p className="text-sm text-gray-600">{login.location}</p>
                <p className="text-xs text-gray-500 mt-1">{login.time}</p>
              </div>
              {login.status === 'failed' && (
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">Failed</span>
              )}
            </div>
          ))}
        </div>
      </SettingCard>
    </div>
  );

  const renderHelpSection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Help & Support</h2>
      
      <SettingCard title="Search Help Articles">
        <div className="relative mb-5">
          <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for help articles, FAQs, guides..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <div className="space-y-2">
          {[
            { title: 'Getting Started Guide', desc: 'Learn the basics' },
            { title: 'Privacy & Security FAQ', desc: 'Common questions answered' },
            { title: 'Study Tips & Best Practices', desc: 'Improve your learning' },
            { title: 'Troubleshooting Common Issues', desc: 'Fix problems quickly' }
          ].map(article => (
            <button key={article.title} className="w-full text-left px-4 py-4 bg-white rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between border border-gray-200 group">
              <div>
                <span className="text-gray-800 font-semibold block">{article.title}</span>
                <span className="text-sm text-gray-500">{article.desc}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="Contact Support" description="Send us a message and we'll get back to you soon">
        <div className="space-y-4">
          <InputField label="Subject" type="text" placeholder="Brief description of your issue" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              rows="5"
              placeholder="Please describe your issue in detail. Include any error messages or steps to reproduce the problem..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
            />
          </div>
          <button className="w-full px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-sm hover:shadow-md">
            Send Message
          </button>
        </div>
      </SettingCard>

      <SettingCard title="Live Chat Support">
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full mb-4 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Support Team Available</span>
          </div>
          <p className="text-gray-600 mb-4">Chat with our support team for immediate assistance</p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg">
            Start Live Chat
          </button>
        </div>
      </SettingCard>

      <SettingCard title="Submit Feedback" description="Help us improve by sharing your experience">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Rate your experience</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="text-4xl text-gray-300 hover:text-yellow-400 transition-colors hover:scale-110">
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Suggestions or Bug Reports</label>
            <textarea
              rows="4"
              placeholder="We'd love to hear your feedback, suggestions, or any bugs you've encountered..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
            />
          </div>
          <button className="w-full px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-sm hover:shadow-md">
            Submit Feedback
          </button>
        </div>
      </SettingCard>
    </div>
  );

  const renderAboutSection = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">About</h2>
      
      <SettingCard title="Application Information">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <SettingsIcon size={40} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Version</p>
              <p className="font-bold text-xl text-gray-800">2.5.1</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="font-bold text-gray-800">Oct 28, 2024</p>
            </div>
          </div>
          <button className="w-full px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all font-medium border border-blue-200">
            Check for Updates
          </button>
        </div>
      </SettingCard>

      <SettingCard title="Credits & Attribution">
        <div className="space-y-3 text-gray-700">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <p className="font-semibold text-gray-800 mb-2">Developed by</p>
            <p className="text-gray-600">Student Learning Platform Team</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-800 mb-2">Powered by</p>
            <p className="text-gray-600">React • TailwindCSS • Lucide Icons</p>
          </div>
          <p className="text-sm text-gray-500 text-center pt-4">© 2024 Student Dashboard. All rights reserved.</p>
        </div>
      </SettingCard>

      <SettingCard title="Legal & Policies">
        <div className="space-y-2">
          {[
            { title: 'Privacy Policy', desc: 'How we handle your data' },
            { title: 'Terms of Service', desc: 'Usage terms and conditions' },
            { title: 'Cookie Policy', desc: 'Cookie usage information' },
            { title: 'Acceptable Use Policy', desc: 'Community guidelines' }
          ].map(link => (
            <button key={link.title} className="w-full text-left px-4 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between border border-gray-200 group">
              <div>
                <span className="text-gray-800 font-semibold block">{link.title}</span>
                <span className="text-sm text-gray-500">{link.desc}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="System Information" description="Your device and browser details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Browser</p>
            <p className="font-semibold text-gray-800">Chrome 119.0</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Operating System</p>
            <p className="font-semibold text-gray-800">Windows 11</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Screen Resolution</p>
            <p className="font-semibold text-gray-800">1920 × 1080</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Language</p>
            <p className="font-semibold text-gray-800">English (US)</p>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'privacy': return renderPrivacySection();
      case 'notifications': return renderNotificationsSection();
      case 'study': return renderStudySection();
      case 'appearance': return renderAppearanceSection();
      case 'camera': return renderCameraSection();
      case 'security': return renderSecuritySection();
      case 'help': return renderHelpSection();
      case 'about': return renderAboutSection();
      default: return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <SettingsIcon className="text-blue-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          </div>
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px] ${isMobileMenuOpen ? 'block fixed inset-0 z-50 top-[73px]' : 'hidden'} md:block`}>
          <nav className="p-4 space-y-1">
            {menuSections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="flex-1 text-left">{section.label}</span>
                  {activeSection === section.id && (
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            {renderContent()}
          </div>

          {/* Save/Cancel Buttons */}
          {unsavedChanges && (
            <div className="fixed bottom-6 right-6 left-6 md:left-auto md:right-6 md:w-96 bg-white rounded-xl shadow-2xl p-5 border-2 border-orange-200 animate-slide-up z-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <AlertTriangle size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Unsaved Changes</p>
                  <p className="text-sm text-gray-600">Don't forget to save your changes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-md"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50 border border-gray-700">
          <div className="p-1.5 bg-green-500 rounded-full">
            <Check size={16} className="text-white" />
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      {showModal === 'password' && (
        <Modal
          title="Change Password"
          onClose={() => setShowModal(null)}
          onConfirm={() => {
            showSuccessToast('Password updated successfully!');
            setShowModal(null);
            setTempPassword({ current: '', new: '', confirm: '' });
          }}
        >
          <div className="space-y-4">
            <InputField
              label="Current Password"
              type="password"
              icon={Lock}
              value={tempPassword.current}
              onChange={(e) => setTempPassword({...tempPassword, current: e.target.value})}
              placeholder="Enter current password"
            />
            <InputField
              label="New Password"
              type="password"
              icon={Lock}
              value={tempPassword.new}
              onChange={(e) => setTempPassword({...tempPassword, new: e.target.value})}
              placeholder="Enter new password"
            />
            <InputField
              label="Confirm New Password"
              type="password"
              icon={Lock}
              value={tempPassword.confirm}
              onChange={(e) => setTempPassword({...tempPassword, confirm: e.target.value})}
              placeholder="Re-enter new password"
            />
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
              <ul className="text-xs text-blue-700 space-y-0.5">
                <li>• At least 8 characters long</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include at least one number</li>
                <li>• Include at least one special character</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {showModal === 'deactivate' && (
        <Modal
          title="Deactivate Account"
          onClose={() => setShowModal(null)}
          onConfirm={() => {
            showSuccessToast('Account deactivated successfully');
            setShowModal(null);
          }}
          danger
        >
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 font-medium mb-2">⚠️ What happens when you deactivate:</p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Your account will be temporarily disabled</li>
                <li>• Your profile will be hidden from others</li>
                <li>• You can reactivate anytime by logging in</li>
                <li>• Your data will be preserved</li>
              </ul>
            </div>
            <p className="text-gray-600">Are you sure you want to deactivate your account?</p>
          </div>
        </Modal>
      )}

      {showModal === 'delete' && (
        <Modal
          title="Delete Account Permanently"
          onClose={() => setShowModal(null)}
          onConfirm={() => {
            showSuccessToast('Account deletion initiated');
            setShowModal(null);
          }}
          danger
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <p className="text-sm text-red-800 font-bold mb-2">⚠️ WARNING: This action cannot be undone!</p>
              <p className="text-sm text-red-700 mb-3">The following will be permanently deleted:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>✗ All your study sessions and progress</li>
                <li>✗ Your profile and account data</li>
                <li>✗ All saved preferences and settings</li>
                <li>✗ Session recordings and analytics</li>
                <li>✗ All associated content and files</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">DELETE</span> to confirm
              </label>
              <input
                type="text"
                placeholder="Type DELETE"
                className="w-full px-4 py-2.5 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {showModal === '2fa' && (
        <Modal
          title="Enable Two-Factor Authentication"
          onClose={() => setShowModal(null)}
          onConfirm={() => {
            updateSetting('twoFactorEnabled', true);
            showSuccessToast('2FA enabled successfully!');
            setShowModal(null);
          }}
        >
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-gray-700 mb-4">Scan this QR code with your authenticator app:</p>
              <div className="bg-gray-100 w-48 h-48 mx-auto rounded-xl flex items-center justify-center border-2 border-gray-300">
                <div className="text-center">
                  <div className="text-6xl mb-2">📱</div>
                  <span className="text-sm text-gray-500">QR Code</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Or enter this code manually:</label>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-center">
                <code className="text-lg font-mono font-bold text-gray-800 tracking-wider">ABCD EFGH IJKL MNOP</code>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-medium mb-1">Recommended Apps:</p>
              <p className="text-xs text-blue-700">Google Authenticator, Authy, Microsoft Authenticator</p>
            </div>
          </div>
        </Modal>
      )}

      {showModal === 'signoutAll' && (
        <Modal
          title="Sign Out All Sessions"
          onClose={() => setShowModal(null)}
          onConfirm={() => {
            showSuccessToast('Signed out from all devices');
            setShowModal(null);
          }}
          danger
        >
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 font-medium mb-2">⚠️ What will happen:</p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• You'll be signed out from all devices</li>
                <li>• Except this current session</li>
                <li>• You'll need to log in again on those devices</li>
                <li>• Active sessions will be terminated immediately</li>
              </ul>
            </div>
            <p className="text-gray-600">This is useful if you've lost a device or suspect unauthorized access.</p>
          </div>
        </Modal>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Settings;