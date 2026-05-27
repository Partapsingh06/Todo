import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Circle,
  Trash2,
  Plus,
  LogOut,
  ListTodo,
  User,
  Calendar,
  AlertTriangle,
  Mail,
  Lock,
  Loader2,
  TrendingUp,
  Inbox,
  Filter,
  Check
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

export default function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // toggle between login & register
  const [authError, setAuthError] = useState('');
  
  // Auth Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Todos State
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, active, completed

  // New Todo Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  // Status Notification State
  const [notif, setNotif] = useState(null);

  // Fetch current user details if token exists
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUserProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setTodos([]);
    }
  }, [token]);

  // Fetch todos when user profile is loaded
  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        // Token expired or invalid
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLogin ? 'login' : 'register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      setToken(data.token);
      showNotification(isLogin ? `Welcome back, ${data.name}!` : 'Account created successfully!');
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    showNotification('Logged out successfully');
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, priority, dueDate })
      });
      if (!res.ok) throw new Error('Could not create task');
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);
      showNotification('Task created');
      
      // Reset Form fields
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const res = await fetch(`${API_BASE}/todos/${todo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !todo.completed })
      });
      if (!res.ok) throw new Error('Could not update status');
      const updated = await res.json();
      setTodos(todos.map(t => t._id === todo._id ? updated : t));
      showNotification(updated.completed ? 'Task completed! 🎉' : 'Task marked active');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Could not delete task');
      setTodos(todos.filter(t => t._id !== id));
      showNotification('Task deleted');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Stats Calculations
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = todos.filter(t => t.priority === 'high' && !t.completed).length;

  // Filter logic
  const filteredTodos = todos.filter(todo => {
    if (activeTab === 'active') return !todo.completed;
    if (activeTab === 'completed') return todo.completed;
    return true;
  });

  // Authentication UI Screens
  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <ListTodo size={32} />
            </div>
            <h2 className="auth-title">NovaTasks</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Sign in to access your elegant taskroom' : 'Create an account to start organizing'}
            </p>
          </div>

          {authError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#f43f5e',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User size={18} /></span>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={18} /></span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
              {isLogin ? 'Sign In' : 'Get Started'}
            </button>
          </form>

          <div className="auth-footer">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <span className="auth-link" onClick={() => { setIsLogin(false); setAuthError(''); }}>
                  Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="auth-link" onClick={() => { setIsLogin(true); setAuthError(''); }}>
                  Sign In
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard / App UI
  return (
    <div className="dashboard-container">
      {/* Toast Alert Notification */}
      {notif && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: notif.type === 'error' ? '#f43f5e' : '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out'
        }}>
          {notif.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
          {notif.message}
        </div>
      )}

      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <span className="brand-icon"><ListTodo size={22} /></span>
            <h1 className="brand-name">NovaTasks</h1>
          </div>

          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              <Inbox size={18} />
              <span>All Tasks</span>
            </div>
            <div className={`nav-item ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
              <Circle size={18} />
              <span>Active</span>
            </div>
            <div className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
              <CheckCircle size={18} />
              <span>Completed</span>
            </div>
          </nav>
        </div>

        <div className="user-profile">
          <div className="avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-role">{user.email}</p>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="welcome-msg">
            <h2>Welcome, {user.name.split(' ')[0]}!</h2>
            <p>Here is an elegant overview of your day.</p>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Stats Grid Dashboard */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h4>Total Tasks</h4>
              <div className="stat-value">{totalTasks}</div>
            </div>
            <div className="stat-icon blue"><ListTodo size={24} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h4>Completed</h4>
              <div className="stat-value">{completedTasks}</div>
            </div>
            <div className="stat-icon green"><CheckCircle size={24} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h4>Pending</h4>
              <div className="stat-value">{pendingTasks}</div>
            </div>
            <div className="stat-icon yellow"><Circle size={24} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h4>High Alert</h4>
              <div className="stat-value">{highPriorityTasks}</div>
            </div>
            <div className="stat-icon red"><AlertTriangle size={24} /></div>
          </div>
        </section>

        {/* Core Workspace Grid */}
        <div className="workspace-split">
          {/* Create Task Form Column */}
          <section className="task-form-box">
            <h3 className="box-title">
              <Plus size={20} style={{ color: 'var(--primary)' }} />
              Create New Task
            </h3>
            
            <form onSubmit={handleAddTodo}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  placeholder="Provide some details..."
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <div className="priority-selector">
                  <div
                    className={`priority-option low ${priority === 'low' ? 'active' : ''}`}
                    onClick={() => setPriority('low')}
                  >
                    Low
                  </div>
                  <div
                    className={`priority-option medium ${priority === 'medium' ? 'active' : ''}`}
                    onClick={() => setPriority('medium')}
                  >
                    Medium
                  </div>
                  <div
                    className={`priority-option high ${priority === 'high' ? 'active' : ''}`}
                    onClick={() => setPriority('high')}
                  >
                    High
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Calendar size={16} /></span>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                <Plus size={18} /> Add Task
              </button>
            </form>
          </section>

          {/* Task Board Column */}
          <section className="task-board">
            <div className="board-header">
              <h3 className="box-title" style={{ margin: 0 }}>
                <Filter size={18} style={{ color: 'var(--primary)' }} />
                Tasks Board
              </h3>
              
              <div className="filter-tabs">
                <button
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button
                  className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active
                </button>
                <button
                  className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <Loader2 size={40} className="empty-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
                <h3>Loading taskroom...</h3>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <TrendingUp size={36} />
                </div>
                <h3>No tasks here</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-dark)', marginTop: '4px' }}>
                  {activeTab === 'all' ? 'Add some tasks to get started!' : 'No tasks match this filter.'}
                </p>
              </div>
            ) : (
              <div className="todo-list-wrapper">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo._id}
                    className={`todo-card priority-${todo.priority} ${todo.completed ? 'completed' : ''}`}
                  >
                    <div
                      className={`checkbox-container ${todo.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleComplete(todo)}
                    >
                      {todo.completed && <Check size={14} />}
                    </div>

                    <div className="todo-details">
                      <h4 className="todo-title">{todo.title}</h4>
                      {todo.description && <p className="todo-description">{todo.description}</p>}
                      
                      <div className="todo-meta">
                        <span className={`badge ${todo.priority}`}>
                          {todo.priority}
                        </span>
                        
                        {todo.dueDate && (
                          <span className="meta-item">
                            <Calendar size={12} />
                            {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="todo-actions">
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteTodo(todo._id)}
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Basic spin animation style */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
