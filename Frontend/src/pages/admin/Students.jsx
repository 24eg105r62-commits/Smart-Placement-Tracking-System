import { useState } from 'react';
import { GraduationCap, FileText, ExternalLink, Mail, Phone } from 'lucide-react';
import { useStudents } from '../../hooks/useStudent.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import SearchBar from '../../components/SearchBar.jsx';
import { Select } from '../../components/Input.jsx';
import { Table, Tr, Td } from '../../components/Table.jsx';
import { Badge } from '../../components/Badge.jsx';
import Avatar from '../../components/Avatar.jsx';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { TableSkeleton } from '../../components/Skeleton.jsx';
import { BRANCH_OPTIONS } from '../../utils/constants.js';

const COLUMNS = ['Student', 'Roll number', 'Branch', 'CGPA', 'Skills', ''];

const Students = () => {
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useStudents({ search: debouncedSearch || undefined, branch: branch || undefined, page, limit: 10 });
  const students = data?.students || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Students</h1>
          <p className="mt-1 text-sm text-slate-400">Browse and search every registered student.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by name, email or roll number…"
            className="sm:w-72"
          />
          <Select
            options={BRANCH_OPTIONS}
            placeholder="All branches"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              setPage(1);
            }}
            wrapperClassName="sm:w-56"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students found" description="Try adjusting your search or filters." />
      ) : (
        <Table columns={COLUMNS}>
          {students.map((student) => (
            <Tr key={student._id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar src={student.userId?.profilePicture} name={student.userId?.name} size="sm" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-100">{student.userId?.name}</p>
                    <p className="text-xs text-slate-400">{student.userId?.email}</p>
                  </div>
                </div>
              </Td>
              <Td>{student.rollNumber || '—'}</Td>
              <Td>{student.branch || '—'}</Td>
              <Td>{student.cgpa ?? '—'}</Td>
              <Td>
                <div className="flex max-w-50 flex-wrap gap-1">
                  {(student.skills || []).slice(0, 3).map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                  {student.skills?.length > 3 && <Badge>+{student.skills.length - 3}</Badge>}
                </div>
              </Td>
              <Td>
                <button type="button" onClick={() => setSelected(student)} className="text-sm font-medium text-primary hover:text-primary-700">
                  View
                </button>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Student profile" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={selected.userId?.profilePicture} name={selected.userId?.name} size="lg" />
              <div>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">{selected.userId?.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Mail className="h-3.5 w-3.5" /> {selected.userId?.email}
                </p>
                {selected.phone && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Phone className="h-3.5 w-3.5" /> {selected.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 p-4 text-sm dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Roll number</p>
                <p className="font-medium text-slate-700 dark:text-slate-100">{selected.rollNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Branch</p>
                <p className="font-medium text-slate-700 dark:text-slate-100">{selected.branch || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">CGPA</p>
                <p className="font-medium text-slate-700 dark:text-slate-100">{selected.cgpa ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Graduation year</p>
                <p className="font-medium text-slate-700 dark:text-slate-100">{selected.graduationYear || '—'}</p>
              </div>
            </div>

            {selected.skills?.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs text-slate-400">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills.map((skill) => (
                    <Badge key={skill} tone="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selected.resumeUrl && (
              <a
                href={selected.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/30 hover:bg-primary/5 dark:border-slate-700"
              >
                <FileText className="h-4 w-4" /> View resume <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Students;
