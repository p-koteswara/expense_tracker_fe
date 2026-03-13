'use client';

import { User, Bell, Shield, Moon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-accent-green/10 text-accent-green rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold">Profile Settings</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">This feature is coming soon.</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-accent-green/10 text-accent-green rounded-lg">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">This feature is coming soon.</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-accent-green/10 text-accent-green rounded-lg">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">This feature is coming soon.</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-accent-green/10 text-accent-green rounded-lg">
              <Moon size={20} />
            </div>
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">This feature is coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
