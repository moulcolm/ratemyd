'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  User,
  Camera,
  BarChart3,
  Trophy,
  Settings,
  Mail,
  Lock,
  Bell,
  Trash2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { Card, Button, Input, Modal } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function ProfileSettingsPage() {
  const menuItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/profile/photos', icon: Camera, label: 'Photos' },
    { href: '/profile/stats', icon: BarChart3, label: 'Stats' },
    { href: '/profile/achievements', icon: Trophy, label: 'Achievements' },
    { href: '/profile/settings', icon: Settings, label: 'Settings', active: true },
  ];

  const router = useRouter();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data, isLoading } = useQuery<{ data: UserProfile }>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.data) {
        setUsername(data.data.username);
      }
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string }) => {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      addToast({ type: 'success', title: 'Profile updated successfully' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error);
      }
      return res.json();
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({ type: 'success', title: 'Password changed successfully' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    onSuccess: async () => {
      await signOut();
      router.push('/');
    },
    onError: () => {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete account' });
    },
  });

  const profile = data?.data;

  const handleUpdateProfile = () => {
    if (username && username !== profile?.username) {
      updateProfileMutation.mutate({ username });
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Error', message: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      addToast({ type: 'error', title: 'Error', message: 'Password must be at least 8 characters' });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="bordered" className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      item.active
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-gray-400">Manage your account settings and preferences</p>
            </div>

            {/* Profile settings */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />

                <Input
                  label="Email"
                  value={profile?.email || ''}
                  disabled
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Button
                  onClick={handleUpdateProfile}
                  isLoading={updateProfileMutation.isPending}
                  disabled={username === profile?.username}
                >
                  Save Changes
                </Button>
              </div>
            </Card>

            {/* Password settings */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </h3>

              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  helperText="Minimum 8 characters"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Button
                  onClick={handleChangePassword}
                  isLoading={changePasswordMutation.isPending}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  Change Password
                </Button>
              </div>
            </Card>

            {/* Session */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Session
              </h3>

              <p className="text-gray-400 mb-4">
                Sign out from your account on this device
              </p>

              <Button
                variant="outline"
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </Card>

            {/* Danger zone */}
            <Card variant="bordered" className="p-6 border-red-500/30">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>

              <p className="text-gray-400 mb-4">
                Permanently delete your account and all associated data
              </p>

              <Button
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Account
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete account modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
        }}
        title="Delete Account"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-medium">Are you absolutely sure?</h4>
              <p className="text-sm text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">
              This will permanently delete your account, all your photos, votes, and statistics. This action is irreversible.
            </p>
          </div>

          <Input
            label={`Type "${profile?.username || ''}" to confirm`}
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={profile?.username}
          />

          <div className="flex gap-3 justify-end mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteAccountMutation.mutate()}
              isLoading={deleteAccountMutation.isPending}
              disabled={deleteConfirmation !== profile?.username}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
