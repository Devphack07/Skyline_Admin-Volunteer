import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SquareCheck,
  CalendarDays,
  Sparkles,
  Users,
  ChartNoAxesColumn,
  KeyRound,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api, type User } from '../lib/api';
import { useAuth, WorkspaceLogo } from '../App';
import { Button, Form } from '../components/ui';

interface LoginProps {
  portal: 'admin' | 'volunteer';
}

export function Login({ portal }: LoginProps) {
  const nav = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    document.title = `${portal === 'admin' ? 'Admin' : 'Volunteer'} sign in · Skyline`;
  }, [portal]);

  const demoEmail = portal === 'admin' ? 'admin@skyline.example.com' : 'krish@skyline.example.com';
  const demoPass = 'SkylineDemo!2026';
  const [initial, setInitial] = useState<Record<string, string>>({});

  const isAdmin = portal === 'admin';

  // Feature cards for the left branding panel
  const volunteerFeatures = [
    {
      title: 'Manage your tasks',
      desc: 'Track assigned duties, event checklists, and status updates.',
      icon: SquareCheck,
      tone: 'indigo',
    },
    {
      title: 'Support campus events',
      desc: 'Coordinate schedules, confirm availability, and facilitate check-ins.',
      icon: CalendarDays,
      tone: 'sky',
    },
    {
      title: 'Make an impact',
      desc: 'Submit reimbursement expenses and empower student campus life.',
      icon: Sparkles,
      tone: 'emerald',
    },
  ];

  const adminFeatures = [
    {
      title: 'Manage members',
      desc: 'Track student membership records, term validity, and dues settlement.',
      icon: Users,
      tone: 'indigo',
    },
    {
      title: 'Organize events',
      desc: 'Publish campus events, manage ticketing capacity, and check-in attendees.',
      icon: CalendarDays,
      tone: 'sky',
    },
    {
      title: 'Track finances',
      desc: 'Monitor settled cash movements, review claims, and view ledger reports.',
      icon: ChartNoAxesColumn,
      tone: 'emerald',
    },
  ];

  const features = isAdmin ? adminFeatures : volunteerFeatures;

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* LEFT SIDE: Skyline Student Association Branding Panel */}
        <section className="auth-branding-panel" aria-label="Skyline Student Association Overview">
          {/* Subtle ambient glow and geometric shapes */}
          <div className="auth-brand-glow-top" aria-hidden="true" />
          <div className="auth-brand-glow-bottom" aria-hidden="true" />
          <div className="auth-brand-geo-pattern" aria-hidden="true">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 350L200 80L350 350H50Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M120 350L200 180L280 350H120Z" stroke="currentColor" strokeWidth="1" />
              <circle cx="200" cy="80" r="4" fill="currentColor" />
            </svg>
          </div>

          <div className="auth-brand-content">
            {/* Topbar: Logo & Campus Pill */}
            <div className="auth-brand-topbar">
              <Link to={`/${portal}/login`} className="auth-brand-identity" aria-label="Skyline Student Association">
                <WorkspaceLogo />
              </Link>
              <span className="auth-brand-pill">
                <span className="auth-brand-pill-dot" />
                <span>Student Organization System</span>
              </span>
            </div>

            {/* Hero Heading & Narrative */}
            <div className="auth-hero-block">
              <span className="auth-association-tag">SKYLINE STUDENT ASSOCIATION</span>
              <h2 className="auth-hero-heading">Building a brighter campus together.</h2>
              <p className="auth-hero-desc">
                The unified workspace helping students, volunteers, and administrators manage association initiatives, events, and resources with confidence.
              </p>
            </div>

            {/* Feature Highlight Cards */}
            <div className="auth-features-list">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="auth-feature-card">
                    <div className={`auth-feature-icon ${item.tone}`}>
                      <Icon size={20} />
                    </div>
                    <div className="auth-feature-text">
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Campus Trust Note */}
            <div className="auth-campus-badge">
              <ShieldCheck size={17} className="auth-campus-badge-icon" />
              <span>Institutional access · Secure session management</span>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: Authentication Card */}
        <section className="auth-card-wrapper" aria-label="Authentication">
          <div className="auth-card" key={portal}>
            {/* Top Logo / Brandmark */}
            <div className="auth-card-topbar">
              <Link to={`/${portal}/login`} className="auth-card-logo" aria-label="Skyline">
                <WorkspaceLogo compact />
              </Link>
            </div>

            <div className="auth-card-header">
              <span className="auth-eyebrow">
                {isAdmin ? 'ADMIN WORKSPACE' : 'VOLUNTEER WORKSPACE'}
              </span>
              <h1 className="auth-card-title">
                {isAdmin ? 'Admin sign in' : 'Volunteer sign in'}
              </h1>
              <p className="auth-card-subtitle">
                {isAdmin
                  ? 'Manage your association, members, events and finances from one place.'
                  : 'Welcome back. Sign in to your association workspace.'}
              </p>
            </div>

            {/* Demo Credentials Box */}
            <div className="auth-demo-box">
              <div className="auth-demo-header">
                <div className="auth-demo-title">
                  <KeyRound size={15} className="auth-demo-key-icon" />
                  <strong>Demo credentials:</strong>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="auth-autofill-btn"
                  onClick={() => setInitial({ email: demoEmail, password: demoPass })}
                >
                  Auto-fill
                </Button>
              </div>

              <div className="auth-demo-details">
                <div className="auth-demo-row">
                  <span className="auth-demo-label">Email:</span>
                  <strong className="auth-demo-val">{demoEmail}</strong>
                </div>
                <div className="auth-demo-row">
                  <span className="auth-demo-label">Password:</span>
                  <strong className="auth-demo-val">{demoPass}</strong>
                </div>
              </div>
            </div>

            {/* Sign in Form */}
            <Form
              key={`${portal}-${initial.email || 'blank'}`}
              initial={initial}
              fields={[
                { name: 'email', label: 'Email address', type: 'email', required: true },
                { name: 'password', label: 'Password', type: 'password', required: true },
              ]}
              label={
                <>
                  Sign in <span aria-hidden="true" className="auth-btn-arrow">→</span>
                </>
              }
              onSubmit={async values => {
                const user = await api<User>('/auth/login', 'POST', {
                  ...values,
                  requestedPortal: portal,
                });
                setUser(user);
                const requested = new URLSearchParams(location.search).get('returnTo');
                const next =
                  requested?.startsWith(`/${portal}/`) &&
                  !requested.includes('//') &&
                  !requested.includes('login')
                    ? requested
                    : `/${portal}`;
                nav(next, { replace: true });
              }}
            />

            {/* Help / Password Reset Guidance */}
            <p className="auth-help-text">
              Need access or forgot your password?
              <br />
              Ask an association administrator for a secure setup link.
            </p>

            {/* Switch workspace portal link */}
            <div className="auth-switch-box">
              <Link
                className="auth-switch-link"
                to={`/${isAdmin ? 'volunteer' : 'admin'}/login`}
              >
                <span>{isAdmin ? 'Volunteer sign in →' : 'Admin sign in →'}</span>
              </Link>
            </div>
          </div>

          {/* Tagline at the very bottom */}
          <p className="auth-footer-tagline">
            A brighter campus starts with a connected community.
          </p>
        </section>
      </div>
    </div>
  );
}
