"use client";

import { useState, useEffect } from "react";
import { Building2, User, Bell, Shield, Palette, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getInitials } from "@/lib/utils";
import { useCRM } from "@/lib/crm-context";
import { useAppTheme } from "@/lib/theme-context";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "company", label: "Company", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const { auth, settings, updateSettings: updateContextSettings } = useCRM();
  const { setTheme: setAppTheme, setAccentColor: setAppAccentColor } = useAppTheme();
  const [activeSection, setActiveSection] = useState("profile");
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateLocalSettings = (section: string, data: any) => {
    setLocalSettings((prev: typeof settings) => ({ ...prev, [section]: data }));
  };

  const handleSave = () => {
    setSaving(true);
    updateContextSettings(localSettings);

    // Apply theme changes immediately
    setAppTheme(localSettings.theme);
    setAppAccentColor(localSettings.accentColor);

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const handleNotificationToggle = (key: string) => {
    setLocalSettings((prev: typeof settings) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  const handlePasswordChange = () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!passwords.current) {
      setPasswordError("Please enter your current password");
      return;
    }

    if (passwords.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Verify current password and update
    const users = JSON.parse(localStorage.getItem("crm_users") || "[]");
    const currentUser = auth.user;
    const userMatch = users.find((u: any) => u.email === currentUser?.email && u.password === passwords.current);

    if (userMatch) {
      userMatch.password = passwords.new;
      if (currentUser?.firstName) {
        userMatch.firstName = currentUser.firstName;
        userMatch.lastName = currentUser.lastName;
        userMatch.phone = currentUser.phone;
      }
      localStorage.setItem("crm_users", JSON.stringify(users));
      setPasswordSuccess(true);
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError("Current password is incorrect");
    }
  };

  const handleProfileUpdate = () => {
    const users = JSON.parse(localStorage.getItem("crm_users") || "[]");
    const currentUser = auth.user;
    const userIndex = users.findIndex((u: any) => u.email === currentUser?.email);

    if (userIndex >= 0) {
      users[userIndex] = {
        ...users[userIndex],
        firstName: localSettings.profile.firstName,
        lastName: localSettings.profile.lastName,
        phone: localSettings.profile.phone,
      };
      localStorage.setItem("crm_users", JSON.stringify(users));

      // Update context
      const updatedUser = { ...currentUser!, ...localSettings.profile };
      localStorage.setItem("crm_current_user", JSON.stringify(updatedUser));
    }
  };

  // Get profile data
  const profile = auth.user ? {
    firstName: auth.user.firstName,
    lastName: auth.user.lastName,
    email: auth.user.email,
    phone: auth.user.phone || "",
  } : localSettings.profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-accent-primary text-white"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1">
          {activeSection === "profile" && (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Profile Settings</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {getInitials(`${profile.firstName} ${profile.lastName}`)}
                </div>
                <div>
                  <Button variant="secondary" size="sm">Change Photo</Button>
                  <p className="text-xs text-text-muted mt-2">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={localSettings.profile.firstName}
                  onChange={(e) => updateLocalSettings("profile", { ...localSettings.profile, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={localSettings.profile.lastName}
                  onChange={(e) => updateLocalSettings("profile", { ...localSettings.profile, lastName: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={localSettings.profile.email}
                  disabled
                  className="opacity-60"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={localSettings.profile.phone}
                  onChange={(e) => updateLocalSettings("profile", { ...localSettings.profile, phone: e.target.value })}
                />
              </div>
              <div className="flex justify-end mt-6 pt-6 border-t border-border-default gap-3">
                {saved && (
                  <span className="flex items-center gap-1 text-accent-secondary text-sm">
                    <Check className="w-4 h-4" /> Saved
                  </span>
                )}
                <Button onClick={() => { handleProfileUpdate(); handleSave(); }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeSection === "company" && (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Company Settings</h2>
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  value={localSettings.company.name}
                  onChange={(e) => updateLocalSettings("company", { ...localSettings.company, name: e.target.value })}
                />
                <Input
                  label="Address"
                  value={localSettings.company.address}
                  onChange={(e) => updateLocalSettings("company", { ...localSettings.company, address: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={localSettings.company.city}
                    onChange={(e) => updateLocalSettings("company", { ...localSettings.company, city: e.target.value })}
                  />
                  <Input
                    label="Country"
                    value={localSettings.company.country}
                    onChange={(e) => updateLocalSettings("company", { ...localSettings.company, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-6 border-t border-border-default gap-3">
                {saved && (
                  <span className="flex items-center gap-1 text-accent-secondary text-sm">
                    <Check className="w-4 h-4" /> Saved
                  </span>
                )}
                <Button onClick={handleSave}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: "newLeads", label: "New leads", desc: "Get notified when new leads are added" },
                  { key: "salesUpdates", label: "Sales updates", desc: "Updates on sales and conversions" },
                  { key: "paymentAlerts", label: "Payment alerts", desc: "Notifications for payments and overdue" },
                  { key: "projectMilestones", label: "Project milestones", desc: "Updates on project progress" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-bg-tertiary">
                    <div>
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(item.key)}
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors relative",
                        localSettings.notifications[item.key as keyof typeof localSettings.notifications] ? "bg-accent-primary" : "bg-bg-elevated"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          localSettings.notifications[item.key as keyof typeof localSettings.notifications] && "translate-x-5"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6 pt-6 border-t border-border-default gap-3">
                {saved && (
                  <span className="flex items-center gap-1 text-accent-secondary text-sm">
                    <Check className="w-4 h-4" /> Saved
                  </span>
                )}
                <Button onClick={handleSave}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-text-primary mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        label="Current Password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-9 text-text-muted hover:text-text-primary"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        label="New Password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-9 text-text-muted hover:text-text-primary"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        label="Confirm New Password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-9 text-text-muted hover:text-text-primary"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-accent-danger text-sm mt-2">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-accent-secondary text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Password updated successfully!
                    </p>
                  )}

                  <Button className="mt-4" onClick={handlePasswordChange}>
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-text-primary mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(["dark", "light", "system"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updateLocalSettings("theme", theme)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all capitalize",
                          localSettings.theme === theme
                            ? "border-accent-primary bg-accent-primary/10"
                            : "border-border-default hover:border-border-hover"
                        )}
                      >
                        <p className="font-medium text-text-primary">{theme}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary mb-4">Accent Color</h3>
                  <div className="flex gap-3">
                    {["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateLocalSettings("accentColor", color)}
                        className={cn(
                          "w-10 h-10 rounded-full transition-transform hover:scale-110",
                          localSettings.accentColor === color && "ring-2 ring-white ring-offset-2 ring-offset-bg-secondary"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-6 border-t border-border-default gap-3">
                {saved && (
                  <span className="flex items-center gap-1 text-accent-secondary text-sm">
                    <Check className="w-4 h-4" /> Saved
                  </span>
                )}
                <Button onClick={handleSave}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
