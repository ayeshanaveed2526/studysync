import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/use-auth';
import { registerSchema } from '@studysync/types';
import type { RegisterInput } from '@studysync/types';

export function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      department: '',
      semester: undefined,
      skills: [],
    },
  });

  const password = watch('password') || '';

  // Password strength logic
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const score = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (score === 3) return { text: 'Strong', color: 'text-green-400', bar: 'bg-green-500' };
    if (score === 2) return { text: 'Medium', color: 'text-yellow-400', bar: 'bg-yellow-500' };
    if (score > 0) return { text: 'Weak', color: 'text-red-400', bar: 'bg-red-500' };
    return { text: 'Empty', color: 'text-slate-500', bar: 'bg-slate-800' };
  };

  const strength = getStrengthLabel();

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

  const onSubmit = async (data: RegisterInput) => {
    try {
      // Clean undefined or empty strings
      const cleanedData = {
        ...data,
        department: data.department?.trim() || undefined,
        semester: data.semester ? Number(data.semester) : undefined,
        skills,
      };
      await registerUser(cleanedData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errMsg = error.response?.data?.error || 'Registration failed. Please check details.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 font-bold text-white shadow-lg shadow-purple-500/30">
            SS
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                placeholder="Jane Doe"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                placeholder="jane@university.edu"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-300">
                  Department <span className="text-xs text-slate-500">(Optional)</span>
                </label>
                <input
                  id="department"
                  type="text"
                  {...register('department')}
                  className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-slate-300">
                  Semester <span className="text-xs text-slate-500">(Optional)</span>
                </label>
                <input
                  id="semester"
                  type="number"
                  {...register('semester', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                  placeholder="1"
                  min="1"
                  max="12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className={`font-semibold ${strength.color}`}>{strength.text}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${score >= 1 ? strength.bar : 'bg-transparent'}`} />
                  <div className={`h-full transition-all ${score >= 2 ? strength.bar : 'bg-transparent'}`} />
                  <div className={`h-full transition-all ${score >= 3 ? strength.bar : 'bg-transparent'}`} />
                </div>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className={hasMinLength ? 'text-green-400' : 'text-red-400'}>
                      {hasMinLength ? '✓' : '✗'}
                    </span>
                    Minimum 8 characters
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={hasUppercase ? 'text-green-400' : 'text-red-400'}>
                      {hasUppercase ? '✓' : '✗'}
                    </span>
                    At least 1 uppercase letter
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={hasNumber ? 'text-green-400' : 'text-red-400'}>
                      {hasNumber ? '✓' : '✗'}
                    </span>
                    At least 1 number
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-slate-300">
                Skills / Expertise <span className="text-xs text-slate-500">(Type & press Enter to add)</span>
              </label>
              <input
                id="skills-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                placeholder="Python, UI Design, Research"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-900/40 border border-purple-800 px-3 py-1 text-xs font-medium text-purple-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-purple-400 hover:text-purple-200 transition-colors font-bold text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default RegisterPage;
