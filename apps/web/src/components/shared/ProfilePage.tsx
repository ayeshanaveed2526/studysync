import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/use-auth';
import { api } from '../../lib/api-client';
import { updateProfileSchema } from '@studysync/types';
import type { UpdateProfileInput } from '@studysync/types';
import { Camera, Upload, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Load current user details
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        department: user.department || '',
        semester: user.semester || undefined,
        skills: user.skills || [],
      });
      setSkills(user.skills || []);
      setAvatarPreview(user.avatarUrl);
    }
  }, [user, reset]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleaned = skillInput.trim();
      if (!cleaned) return;
      if (skills.includes(cleaned)) {
        setSkillInput('');
        return;
      }
      if (skills.length >= 20) {
        toast.error('You can add up to 20 skills.');
        return;
      }
      const updated = [...skills, cleaned];
      setSkills(updated);
      setValue('skills', updated);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    setValue('skills', updated);
  };

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    try {
      const response = await api.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUser = response.data.data;
      setAvatarPreview(updatedUser.avatarUrl);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errMsg = error.response?.data?.error || 'Failed to upload avatar.';
      toast.error(errMsg);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      const cleaned = {
        ...data,
        name: data.name?.trim(),
        department: data.department?.trim() || null,
        semester: data.semester ? Number(data.semester) : null,
        skills,
      };
      await updateProfile(cleaned);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errMsg = error.response?.data?.error || 'Failed to update profile.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Edit Profile</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        {/* Profile Card Layout */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 md:p-8 space-y-8 shadow-xl">
          {/* Avatar Uploader Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-900">
            <div className="relative group">
              <div className="h-28 w-28 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-500">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                  </span>
                )}
                {avatarLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 border border-purple-500 text-white hover:bg-purple-500 shadow-lg cursor-pointer transition-all"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/5'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
              }`}
            >
              <Upload className="h-8 w-8 text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                Drag and drop your avatar, or <span className="text-purple-400">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, or WEBP up to 5MB</p>
            </div>
          </div>

          {/* Form details */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/30 px-3.5 py-2 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-300">
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  {...register('department')}
                  className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/30 px-3.5 py-2 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-slate-300">
                  Semester
                </label>
                <input
                  id="semester"
                  type="number"
                  {...register('semester', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/30 px-3.5 py-2 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                  min="1"
                  max="12"
                />
              </div>
            </div>

            {/* Skills tagging input */}
            <div className="border-t border-slate-900 pt-6">
              <label htmlFor="skills-tag" className="block text-sm font-medium text-slate-300">
                Skills / Expertise <span className="text-xs text-slate-500">(Type & press Enter to add)</span>
              </label>
              <input
                id="skills-tag"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/30 px-3.5 py-2 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                placeholder="React, AWS, Machine Learning"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-purple-950/40 border border-purple-900 px-3 py-1 text-xs font-medium text-purple-300"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-purple-400 hover:text-purple-200 transition-colors ml-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-900 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg border border-slate-800 bg-transparent px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
              >
                {isSubmitting || authLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
export default ProfilePage;
