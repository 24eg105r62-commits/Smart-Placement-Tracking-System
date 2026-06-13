import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Input, Select } from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { ROLE_HOME } from '../../routes/ProtectedRoute.jsx';

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student — looking for placements' },
  { value: 'RECRUITER', label: 'Recruiter — hiring on campus' },
];

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', email: '', password: '', role: 'STUDENT' } });

  const password = watch('password');

  const onSubmit = async ({ name, email, password: pwd, role }) => {
    setIsSubmitting(true);
    try {
      const user = await registerUser({ name, email, password: pwd, role });
      toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`);
      navigate(ROLE_HOME[user.role] || '/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create your account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-400">Join as a student or a recruiter to get started.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          placeholder="Asha Rao"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@college.edu"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
          })}
        />

        <Select
          label="I am a…"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register('role', { required: true })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Use at least 6 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-9 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting} icon={UserPlus}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
