import React, { useEffect, useState } from 'react';

const SUPABASE_URL = 'https://ydmumpaarisrlnpybhcp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbXVtcGFhcmlzcmxucHliaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjc5MjEsImV4cCI6MjA3Mjc0MzkyMX0.RFsW2XO3VxR-KoPjGLXfhLZs9gCoz--vGdlFI5hq6sQ';
let supabase = null;
if (typeof window !== 'undefined' && window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

function Sidebar({ collapsed, open, onClose, active, setActive }) {
  React.useEffect(() => {
    // Only lock scroll if overlay is visible (mobile/tablet)
    if (typeof window !== 'undefined' && window.innerWidth < 992 && open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);
  return (
    <>
      <div className={`sidebar d-flex flex-column${open ? ' open' : ''}${collapsed ? ' sidebar-collapsed' : ''}`}
        style={{ position: typeof window !== 'undefined' && window.innerWidth < 992 ? 'fixed' : 'relative' }}>
        <div className="sidebar-header d-flex align-items-center justify-content-between">
          <span><i className="bi bi-speedometer2 me-2"></i>Admin Panel</span>
          {typeof window !== 'undefined' && window.innerWidth < 992 && (
            <button className="btn btn-sm btn-light ms-2" onClick={onClose} aria-label="Close sidebar">
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        <nav className="nav flex-column px-3 mt-3">
          <a
            className={`nav-link${active === 'add' ? ' active' : ''}`}
            href="#add"
            onClick={e => { e.preventDefault(); setActive('add'); if (typeof window !== 'undefined' && window.innerWidth < 992) onClose(); }}
          >
            <i className="bi bi-person-plus me-2"></i>Add User
          </a>
          <a
            className={`nav-link${active === 'view' ? ' active' : ''}`}
            href="#view"
            onClick={e => { e.preventDefault(); setActive('view'); if (typeof window !== 'undefined' && window.innerWidth < 992) onClose(); }}
          >
            <i className="bi bi-people me-2"></i>View Users
          </a>
        </nav>
      </div>
      {/* Only show overlay on mobile/tablet when sidebar is open */}
      {typeof window !== 'undefined' && window.innerWidth < 992 && (
        <div className={`overlay${open ? ' show' : ''}`} onClick={onClose}></div>
      )}
    </>
  );
}

function TopNavbar({ onSidebarToggle }) {
  return (
    <nav className="navbar navbar-expand navbar-light sticky-top px-3 shadow-sm animate__animated animate__fadeInDown">
      <button className="sidebar-toggler d-lg-none" onClick={onSidebarToggle} aria-label="Open sidebar">
        <i className="bi bi-list"></i>
      </button>
      <span className="navbar-brand fw-bold text-primary">Email, Gender & City Admin</span>
    </nav>
  );
}

function UsersTable({ users }) {
  return (
    <div className="container py-4 d-flex flex-column align-items-center animate__animated animate__fadeInUp">
      <div className="mb-4">
        <h2 className="fw-bold text-center">User List</h2>
        <p className="text-muted text-center">All users from Supabase</p>
      </div>
      <div className="table-responsive shadow-lg" style={{ maxWidth: 700, width: '100%', background: '#fff' }}>
        <table className="table table-hover align-middle mb-0">
          <thead className="table-primary">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Email</th>
              <th scope="col">Gender</th>
              <th scope="col">City</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">No users found.</td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id || idx} className="animate__animated animate__fadeIn animate__faster">
                  <th scope="row">{idx + 1}</th>
                  <td>{user.email || <span className="text-muted">N/A</span>}</td>
                  <td>{user.gender || <span className="text-muted">N/A</span>}</td>
                  <td>{user.city || <span className="text-muted">N/A</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SingleUserCard({ user }) {
  return (
    <div className="container py-4 d-flex flex-column justify-content-center align-items-center animate__animated animate__fadeInUp">
      <div className="card shadow-lg" style={{ maxWidth: 400, width: '100%' }}>
        <div className="card-body">
          <h3 className="card-title mb-4 text-center fw-bold">User Info</h3>
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Email:</span>
              <span>{user.email || <span className="text-muted">N/A</span>}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Gender:</span>
              <span>{user.gender || <span className="text-muted">N/A</span>}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="fw-semibold">City:</span>
              <span>{user.city || <span className="text-muted">N/A</span>}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function UserForm({ onUserAdded }) {
  const [form, setForm] = useState({ email: '', gender: '', city: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [fail, setFail] = useState(null);

  function validate() {
    const errs = {};
    if (!form.email) {
      errs.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Invalid email address.';
    }
    if (!form.gender) {
      errs.gender = 'Gender is required.';
    }
    if (!form.city) {
      errs.city = 'City is required.';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(null);
    setFail(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    if (!supabase) {
      setFail('Supabase client not available.');
      setSubmitting(false);
      return;
    }
    const { data, error } = await supabase.from('addusers').insert([
      { email: form.email, gender: form.gender, city: form.city }
    ]);
    setSubmitting(false);
    if (error) {
      setFail(error.message);
    } else {
      setSuccess('User added successfully!');
      setForm({ email: '', gender: '', city: '' });
      if (onUserAdded) onUserAdded();
    }
  }

  return (
    <div className="form-section animate__animated animate__fadeInDown">
      <div className="card shadow-lg">
        <div className="card-body">
          <h4 className="card-title mb-3 fw-bold text-center">Add User</h4>
          {success && <div className="alert alert-success animate__animated animate__fadeIn mb-3"><i className="bi bi-check-circle me-2"></i>{success}</div>}
          {fail && <div className="alert alert-danger animate__animated animate__fadeIn mb-3"><i className="bi bi-x-circle me-2"></i>{fail}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control${errors.email ? ' is-invalid' : ''}`}
                id="email"
                placeholder="Enter email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="off"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                className={`form-select${errors.gender ? ' is-invalid' : ''}`}
                id="gender"
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="city" className="form-label">City</label>
              <input
                type="text"
                className={`form-control${errors.city ? ' is-invalid' : ''}`}
                id="city"
                placeholder="Enter city"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                autoComplete="off"
              />
              {errors.city && <div className="invalid-feedback">{errors.city}</div>}
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? (
                <span><span className="spinner-border spinner-border-sm me-2"></span>Adding...</span>
              ) : (
                <span><i className="bi bi-plus-circle me-2"></i>Add User</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('add');
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      if (!supabase) {
        setError('Supabase client not available.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('addusers')
        .select('id, email, gender, city')
        .order('id', { ascending: false });
      if (error) {
        setError(error.message);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }
    if (active === 'view') {
      fetchUsers();
    }
  }, [refresh, active]);

  function handleUserAdded() {
    setActive('view');
    setRefresh(r => r + 1);
  }

  // Responsive sidebar collapse on resize
  useEffect(() => {
    function handleResize() {
      if (typeof window !== 'undefined' && window.innerWidth >= 992) {
        setSidebarOpen(false);
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={typeof window !== 'undefined' && window.innerWidth < 992 && !sidebarOpen}
        open={sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 992)}
        onClose={() => setSidebarOpen(false)}
        active={active}
        setActive={setActive}
      />
      <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: '100vh' }}>
        <TopNavbar onSidebarToggle={() => setSidebarOpen(true)} />
        <main className="main-content">
          {active === 'add' && <UserForm onUserAdded={handleUserAdded} />}
          {active === 'view' && (
            loading ? (
              <div className="spinner-container">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="container d-flex flex-column justify-content-center align-items-center">
                <div className="alert alert-danger animate__animated animate__fadeInDown mt-4" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="container d-flex flex-column justify-content-center align-items-center">
                <div className="alert alert-info animate__animated animate__fadeInDown mt-4" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  No users found in Supabase.
                </div>
              </div>
            ) : users.length === 1 ? (
              <SingleUserCard user={users[0]} />
            ) : (
              <UsersTable users={users} />
            )
          )}
        </main>
      </div>
    </div>
  );
}
