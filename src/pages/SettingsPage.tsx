import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { userApi } from '@/api/user';

const SettingsPage: React.FC = () => {
  const { user, updateUser, checkAuth } = useAuthStore();
  const { soundEnabled, toggleSound, requestPermission, hasPermission } = useNotificationStore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.emails?.[0]?.address || '');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch full user data on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Update edit fields when user data changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.emails?.[0]?.address || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      console.log('[Settings] Saving profile:', { name: editName, email: editEmail });
      const updatedUser = await userApi.updateProfile({
        name: editName,
        emails: [{ address: editEmail, verified: false }],
      });
      console.log('[Settings] Profile updated:', updatedUser);
      // Refresh user data from server
      await checkAuth();
      setShowEditProfile(false);
      alert('保存成功！');
    } catch (error: any) {
      console.error('[Settings] Failed to update profile:', error);
      console.error('[Settings] Error response:', error.response?.data);
      alert(`保存失败: ${error.response?.data?.message || error.response?.data?.error || error.message || '未知错误'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const settingsSections = [
    {
      title: '账号',
      items: [
        {
          icon: User,
          label: '个人资料',
          description: '修改头像、昵称、签名',
          action: () => setShowEditProfile(true),
        },
        {
          icon: Shield,
          label: '隐私设置',
          description: '管理谁可以添加你为好友',
          action: () => console.log('Privacy settings'),
        },
      ],
    },
    {
      title: '通知',
      items: [
        {
          icon: Bell,
          label: '消息通知',
          description: hasPermission ? '已开启' : '未开启',
          action: requestPermission,
          toggle: true,
          checked: hasPermission,
        },
        {
          icon: Bell,
          label: '提示音',
          description: soundEnabled ? '已开启' : '已关闭',
          action: toggleSound,
          toggle: true,
          checked: soundEnabled,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          icon: Palette,
          label: '主题设置',
          description: '浅色 / 深色',
          action: () => console.log('Theme settings'),
        },
        {
          icon: Info,
          label: '关于',
          description: '版本 1.0.0',
          action: () => console.log('About'),
        },
      ],
    },
  ];

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full">
      {/* Settings List */}
      <div className="w-80 min-w-[320px] border-r border-border flex flex-col bg-background">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">设置</h2>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {/* User Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Avatar className="w-16 h-16 mr-4">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-text-primary text-lg">
                    {user?.name || user?.username || '用户'}
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    @{user?.username || 'username'}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {user?.emails?.[0]?.address || '未设置邮箱'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                {section.title}
              </h3>
              <Card>
                <CardContent className="p-0">
                  {section.items.map((item, itemIndex) => (
                    <React.Fragment key={itemIndex}>
                      {itemIndex > 0 && <Separator />}
                      <div
                        className="flex items-center p-4 cursor-pointer hover:bg-background-secondary transition-colors"
                        onClick={item.action}
                      >
                        <div className="w-10 h-10 rounded-12 bg-background-secondary flex items-center justify-center mr-3">
                          <item.icon className="w-5 h-5 text-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{item.label}</p>
                          <p className="text-sm text-text-tertiary">{item.description}</p>
                        </div>
                        {item.toggle && (
                          <Switch
                            checked={item.checked}
                            onCheckedChange={item.action}
                          />
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 flex items-center justify-center bg-background-secondary">
        <div className="text-center text-text-tertiary">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <p className="text-lg font-medium">选择设置项</p>
          <p className="text-sm mt-1">从左侧列表选择设置</p>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-16 p-6 w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">编辑个人资料</h3>
            
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={user?.username || ''}
                  disabled
                  className="mt-1 bg-background-secondary"
                />
                <p className="text-xs text-text-tertiary mt-1">用户名无法修改</p>
              </div>

              <div>
                <Label htmlFor="name">昵称</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="输入昵称"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="输入邮箱"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditProfile(false)}
                disabled={isSaving}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;