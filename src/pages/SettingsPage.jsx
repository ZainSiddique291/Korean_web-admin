import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Check,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  UploadCloud,
  Link as LinkIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

// Helper to optimize and convert device images to Data URL
const processImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function SettingsPage() {
  const { adminUser, updateAdminProfile, showToast } = useAdmin();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: adminUser?.name || '',
    phone: adminUser?.phone || '',
    address: adminUser?.address || '',
    city: adminUser?.city || 'Lahore',
    avatar: adminUser?.avatar || '',
  });

  // Avatar selector state
  const [avatarMode, setAvatarMode] = useState('upload'); // 'upload' | 'url'
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (adminUser) {
      setProfileForm({
        name: adminUser.name || '',
        phone: adminUser.phone || '',
        address: adminUser.address || '',
        city: adminUser.city || 'Lahore',
        avatar: adminUser.avatar || '',
      });
      if (adminUser.avatar && !adminUser.avatar.startsWith('data:')) {
        setAvatarMode('url');
      }
    }
  }, [adminUser]);

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingAvatar(true);
    try {
      const dataUrl = await processImageFile(file);
      setProfileForm((prev) => ({ ...prev, avatar: dataUrl }));
    } catch (err) {
      showToast('Could not process avatar image');
    } finally {
      setProcessingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('Username/Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      await updateAdminProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        city: profileForm.city.trim(),
        avatar: profileForm.avatar,
      });
    } catch (err) {
      // Error toast handled in context
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      showToast('Please enter a new password');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New password and confirmation do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await updateAdminProfile({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully! ✅');
    } catch (err) {
      // Error toast handled in context
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Admin Profile & Account Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrator identity, credentials, contact information, and store access preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card Overview & Quick Stats */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="card-admin text-center relative overflow-hidden">
            <div className="w-full h-20 bg-gradient-to-r from-primary-800 to-primary-700 -mx-6 -mt-6 mb-10 border-b border-primary-900/40" />

            <div className="relative -mt-16 mb-4 flex justify-center">
              {profileForm.avatar ? (
                <img
                  src={profileForm.avatar}
                  alt={adminUser?.name || 'Admin'}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary-100 text-primary-800 font-bold text-3xl flex items-center justify-center border-4 border-white shadow-md">
                  {adminUser?.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif">
              {adminUser?.name || 'Administrator'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{adminUser?.email || 'admin@store.com'}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Store Administrator
              </span>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Access Level:</span>
                <span className="font-semibold text-slate-800">Full Control</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">City:</span>
                <span className="font-semibold text-slate-800">{adminUser?.city || 'Lahore'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Storefront:</span>
                <span className="font-semibold text-emerald-700">SEORA Skincare</span>
              </div>
            </div>
          </div>

          {/* Security & Access Banner */}
          <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100/80 text-primary-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-primary-950">
              <Sparkles className="w-4 h-4 text-primary-700" />
              <span>Administrative Security</span>
            </div>
            <p className="text-primary-800/80 leading-relaxed text-[11px]">
              Profile changes and credential updates take effect immediately across all admin sessions and store audit logs.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Profile Information Form */}
          <div className="card-admin space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center border border-primary-100 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal & Store Profile</h3>
                  <p className="text-xs text-slate-500">Update your username, avatar, and contact details</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              {/* Profile Avatar Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Profile Picture / Avatar</label>
                
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-2.5 border border-slate-200/60 max-w-xs">
                  <button
                    type="button"
                    onClick={() => setAvatarMode('upload')}
                    className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      avatarMode === 'upload'
                        ? 'bg-white text-primary-700 shadow-xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode('url')}
                    className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      avatarMode === 'url'
                        ? 'bg-white text-primary-700 shadow-xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                </div>

                {avatarMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      id="admin-avatar-file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFile}
                    />
                    {profileForm.avatar && profileForm.avatar.startsWith('data:') ? (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
                        <img
                          src={profileForm.avatar}
                          alt="Avatar Preview"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-800 block">Avatar Loaded</span>
                          <span className="text-[11px] text-emerald-600 block">Ready to apply</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="admin-avatar-file"
                            className="cursor-pointer text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                          >
                            Change
                          </label>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, avatar: '' })}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="admin-avatar-file"
                        className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-300 hover:border-primary-500 bg-slate-50/70 hover:bg-primary-50/30 rounded-xl cursor-pointer transition-colors max-w-md"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-semibold text-slate-700 block">
                            {processingAvatar ? 'Processing image...' : 'Click to choose an avatar image'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">PNG, JPG, or WEBP up to 5MB</span>
                        </div>
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-w-md">
                    <input
                      type="url"
                      value={profileForm.avatar.startsWith('data:') ? '' : profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="input-field text-xs"
                    />
                    {profileForm.avatar && !profileForm.avatar.startsWith('data:') && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <img
                          src={profileForm.avatar}
                          alt="Preview"
                          className="w-8 h-8 rounded-lg object-cover border"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[11px] text-slate-500 truncate flex-1">{profileForm.avatar}</span>
                        <button
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, avatar: '' })}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Username & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username / Display Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Administrator Name"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-[10px] text-slate-400 font-normal">(Primary Login)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={adminUser?.email || ''}
                      className="input-field pl-10 bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & City Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operating City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="Lahore, Karachi, Islamabad..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Store Office / Dispatch Address
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Office #12, Commercial Hub, Main Boulevard"
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary py-2.5 px-5 text-xs font-semibold flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. Change Password Form */}
          <div className="card-admin space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500">Update your security passkey for logging into the portal</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              {/* Current Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="At least 6 characters"
                      className="input-field pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="input-field pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary bg-slate-800 hover:bg-slate-900 py-2.5 px-5 text-xs font-semibold flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
