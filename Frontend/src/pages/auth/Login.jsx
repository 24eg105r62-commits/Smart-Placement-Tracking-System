import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Input } from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { ROLE_HOME } from '../../routes/ProtectedRoute.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async ({ email, password }) => {
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || ROLE_HOME[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-400">Sign in to continue to your placement dashboard.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
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

        <Button type="submit" className="w-full" isLoading={isSubmitting} icon={LogIn}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New to vSmart Placement?{' '}
        <Link to="/register" className="font-medium text-primary hover:text-primary-700">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-400 dark:border-slate-700">
        <p className="mb-1.5 font-medium text-slate-500 dark:text-slate-300">Demo accounts (seeded):</p>
        <p>Admin — admin@vsmart.test / Admin@123</p>
        <p>Student — asha.rao@vsmart.test / Student@123</p>
        <p>Recruiter — karan.shah@techcorp.test / Recruiter@123</p>
      </div>
    </div>
  );
};

export default Login;
