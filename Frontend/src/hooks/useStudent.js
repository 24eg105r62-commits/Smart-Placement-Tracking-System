import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyStudentProfile,
  updateMyStudentProfile,
  uploadStudentPicture,
  uploadStudentResume,
  removeStudentResume,
  fetchStudents,
  fetchStudentById,
} from '../api/students.js';
import { useAuth } from '../context/AuthContext.jsx';

export const STUDENT_PROFILE_KEY = ['student', 'me'];

export const useMyStudentProfile = () =>
  useQuery({ queryKey: STUDENT_PROFILE_KEY, queryFn: fetchMyStudentProfile });

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyStudentProfile,
    onSuccess: (student) => queryClient.setQueryData(STUDENT_PROFILE_KEY, student),
  });
};

export const useUploadStudentPicture = () => {
  const queryClient = useQueryClient();
  const { refreshMe } = useAuth();
  return useMutation({
    mutationFn: uploadStudentPicture,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_PROFILE_KEY });
      await refreshMe();
    },
  });
};

export const useUploadStudentResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadStudentResume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENT_PROFILE_KEY }),
  });
};

export const useRemoveStudentResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeStudentResume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENT_PROFILE_KEY }),
  });
};

export const useStudents = (params) =>
  useQuery({ queryKey: ['students', 'list', params], queryFn: () => fetchStudents(params), placeholderData: (prev) => prev });

export const useStudentById = (id) =>
  useQuery({ queryKey: ['students', 'detail', id], queryFn: () => fetchStudentById(id), enabled: Boolean(id) });
