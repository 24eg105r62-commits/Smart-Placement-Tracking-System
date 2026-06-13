import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send, Megaphone } from 'lucide-react';
import { useSendNotification } from '../../hooks/useNotifications.js';
import { GlassCard } from '../../components/Card.jsx';
import { Input, Textarea, Select } from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'STUDENT', label: 'Students' },
  { value: 'RECRUITER', label: 'Recruiters' },
  { value: 'ADMIN', label: 'Admins' },
];

const defaultValues = { title: '', message: '', audience: 'ALL' };

const Notifications = () => {
  const sendNotification = useSendNotification();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const onSubmit = async (values) => {
    try {
      const result = await sendNotification.mutateAsync(values);
      toast.success(`Notification sent to ${result?.recipientCount ?? 0} user(s)`);
      reset(defaultValues);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not send notification');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Send notifications</h1>
        <p className="mt-1 text-sm text-slate-400">Broadcast announcements to students, recruiters, admins — or everyone.</p>
      </div>

      <GlassCard className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">Compose announcement</p>
            <p className="text-xs text-slate-400">Recipients will see this in their notifications feed.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Title"
            placeholder="e.g. Placement drive next week"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />
          <Textarea
            label="Message"
            rows={5}
            placeholder="Write your announcement…"
            error={errors.message?.message}
            {...register('message', { required: 'Message is required' })}
          />
          <Select label="Audience" options={AUDIENCE_OPTIONS} {...register('audience', { required: true })} />

          <div className="flex justify-end pt-2">
            <Button type="submit" icon={Send} isLoading={sendNotification.isPending}>
              Send notification
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default Notifications;
