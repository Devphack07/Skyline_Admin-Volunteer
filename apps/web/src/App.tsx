import { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, Users, CalendarDays, Heart, SquareCheck, Package, ChartNoAxesColumn, FileText, Megaphone, Settings, LogOut, Menu, ChevronRight, ArrowLeftRight, UserRound, Bell, Clock, CreditCard } from 'lucide-react';
import { api, ApiError, queryClient, refresh, type User, type Row, useData } from './lib/api';
import { Button, Form, Modal, Notice, State, Badge } from './components/ui';
import { AdminDashboard, VolunteerDashboard } from './pages/dashboards';
import { MembersPage, EventsPage, EventPage, VolunteersPage, TasksPage, ProfilePage, SettingsPage } from './pages/core';
import { ClaimsPage, ShopPage, FinancePage, AnnouncementsPage } from './pages/operations';
import { Login } from './pages/auth';
const AuthContext=createContext<{user:User|null;setUser:(u:User|null)=>void}>({user:null,setUser:()=>{}});
export const useAuth=()=>useContext(AuthContext);
const allowed=(u:User|null,portal:string)=>!!u?.roles?.includes(portal);
export function WorkspaceLogo({compact=false}:{compact?:boolean}){
  return (
    <div className={`workspace-brand ${compact?'compact':''}`}>
      <img src="/logo.png" alt="Skyline" className="workspace-logo-img"/>
    </div>
  );
}

function ResetPassword(){
  const [done,setDone]=useState(false);
  const token=new URLSearchParams(useLocation().search).get('token')||'';
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Set your password</h1>
        <p className="muted">Use the single-use setup link provided by your administrator.</p>
        {done ? (
          <Notice>
            Password updated. You can now sign in.
            <div className="action-row">
              <Link to="/admin/login">Admin sign in</Link>
              <Link to="/volunteer/login">Volunteer sign in</Link>
            </div>
          </Notice>
        ) : (
          <Form
            fields={[{name:'password',label:'New password',type:'password',required:true,help:'At least 12 characters.'}]}
            label="Set password"
            onSubmit={async v=>{
              await api('/auth/reset-password','POST',{token,password:v.password});
              setDone(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

function Protected({portal}:{portal:'admin'|'volunteer'}){
  const {user}=useAuth();
  const location=useLocation();
  if(!user) return <Navigate to={`/${portal}/login?returnTo=${encodeURIComponent(location.pathname)}`} replace/>;
  if(!allowed(user,portal)) return (
    <div className="denied">
      <h1>Access denied</h1>
      <p>Your account does not have permission to open this workspace.</p>
      <Button asChild><Link to={`/${user.roles.includes('admin')?'admin':'volunteer'}`}>Go to your workspace</Link></Button>
    </div>
  );
  return <Layout portal={portal}/>;
}

function Notifications({open,onOpenChange}:any){
  const q=useData<Row[]>('/notifications',open);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Notifications" description="Updates intended for your account.">
      <State query={q}>
        <div className="notification-list">
          {(q.data||[]).map(n=>(
            <div className="notification" key={n.id}>
              <div>
                <strong>{n.title||n.message}</strong>
                <p className="muted">{n.body||n.message}</p>
              </div>
              <div className="notification-meta">
                {!n.read_at && (
                  <Button variant="outline" onClick={async()=>{await api(`/notifications/${n.id}/read`,'POST',{});refresh();}}>Mark read</Button>
                )}
                {n.read_at && <Badge status="READ"/>}
              </div>
            </div>
          ))}
          {!q.data?.length&&<p className="muted empty-notification">You're all caught up.</p>}
        </div>
      </State>
    </Modal>
  );
}

function Layout({portal}:{portal:'admin'|'volunteer'}){
  const {user,setUser}=useAuth();
  const [drawer,setDrawer]=useState(false);
  const [notifications,setNotifications]=useState(false);
  const location=useLocation();
  const nav=useNavigate();

  useEffect(()=>{setDrawer(false);},[location.pathname]);

  const links = portal==='admin' ? [
    ['','Overview',Home],
    ['members','Members',Users],
    ['events','Events',CalendarDays],
    ['volunteers','Volunteers',Heart],
    ['tasks','Tasks',SquareCheck],
    ['shop','Shop & inventory',Package],
    ['finance','Finance',ChartNoAxesColumn],
    ['reimbursements','Reimbursements',FileText],
    ['announcements','Announcements',Megaphone],
    ['settings','Settings',Settings]
  ] : [
    ['','Overview',Home],
    ['events','My events',CalendarDays],
    ['tasks','My tasks',SquareCheck],
    ['availability','Availability',Clock],
    ['expenses','My expenses',CreditCard],
    ['announcements','Announcements',Megaphone]
  ];

  const logout=async()=>{
    await api('/auth/logout','POST',{});
    queryClient.clear();
    setUser(null);
    nav(`/${portal}/login`);
  };

  return (
    <div className="app-shell">
      {drawer && <div className="drawer-backdrop" onClick={()=>setDrawer(false)}/>}
      <aside className={`sidebar ${drawer?'is-open':''}`}>
        <div className="sidebar-top">
          <Link className="brand" to={`/${portal}`}>
            <WorkspaceLogo/>
          </Link>
          <div className="workspace-badge">
            <span className="workspace-badge-dot"/>
            <span className="workspace-badge-text">{portal==='admin'?'Admin Workspace':'Volunteer Workspace'}</span>
          </div>
        </div>
        <nav aria-label={`${portal} navigation`}>
          {links.map(([path,label,Icon]:any)=>(
            <NavLink
              key={path}
              to={`/${portal}${path?'/'+path:''}`}
              end={!path}
              className={({isActive})=>`nav-item ${isActive?'active':''}`}
            >
              <Icon size={19}/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {portal==='admin' && (
            <div className="campus-note">
              <div className="campus-note-header">
                <Users size={16}/>
                <span>Skyline Association</span>
              </div>
              <p>Empowering student life and campus organization.</p>
            </div>
          )}
          <Link to={`/${portal}/profile`} className="account">
            <div className="avatar">
              {user?.name?.split(' ').map(s=>s[0]).slice(0,2).join('')}
            </div>
            <div className="account-meta">
              <strong>{user?.name}</strong>
              <span>{portal==='admin'?'Administrator':'Volunteer'}</span>
            </div>
            <ChevronRight size={15}/>
          </Link>
          {allowed(user,portal==='admin'?'volunteer':'admin') && (
            <Button variant="ghost" className="switch-btn" asChild>
              <Link to={`/${portal==='admin'?'volunteer':'admin'}`}>
                <ArrowLeftRight size={15}/> Switch workspace
              </Link>
            </Button>
          )}
          <Button variant="ghost" className="signout-btn" onClick={logout}>
            <LogOut size={15}/> Sign out
          </Button>
        </div>
      </aside>
      <div className="workspace">
        <div className="mobile-top">
          <Button variant="ghost" onClick={()=>setDrawer(true)} aria-label="Open navigation">
            <Menu size={22}/>
          </Button>
          <div className="mobile-brand">
            <WorkspaceLogo compact/>
            <span className="mobile-tag">{portal==='admin'?'Admin':'Volunteer'}</span>
          </div>
          <Button variant="ghost" onClick={()=>setNotifications(true)} aria-label="Notifications">
            <Bell size={20}/>
          </Button>
        </div>
        <main>
          <Outlet context={{openNotifications:()=>setNotifications(true)}}/>
        </main>
        <footer className="workspace-footer">
          <span>Skyline Student Organization System · Local demo</span>
          <span>INR · Asia/Kolkata</span>
        </footer>
      </div>
      <Notifications open={notifications} onOpenChange={setNotifications}/>
    </div>
  );
}

export default function App(){
  const [userState,setUserState]=useState<User|null>(null);
  const session=useQuery({queryKey:['session'],queryFn:()=>api<User>('/auth/me'),retry:false,refetchInterval:15000,refetchOnWindowFocus:true});
  useEffect(()=>{
    if(session.isSuccess) setUserState(session.data);
    else if(session.isError) setUserState(null);
  },[session.data,session.isSuccess,session.isError]);
  const user=(session.isPending?userState:(session.data||null))||userState;
  const setUser=(u:User|null)=>{
    setUserState(u);
    queryClient.setQueryData(['session'],u);
    if(!u) queryClient.removeQueries({predicate:q=>q.queryKey[0]!=='session'});
  };
  useEffect(()=>{
    const expired=()=>{setUser(null);};
    window.addEventListener('session-expired',expired);
    return()=>window.removeEventListener('session-expired',expired);
  },[]);
  if(session.isPending&&!user) return <div className="state">Opening Skyline…</div>;
  return (
    <AuthContext.Provider value={{user,setUser}}>
      <Routes>
        <Route path="/admin/login" element={<Login portal="admin"/>}/>
        <Route path="/volunteer/login" element={<Login portal="volunteer"/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/admin" element={<Protected portal="admin"/>}>
          <Route index element={<AdminDashboard/>}/>
          <Route path="members" element={<MembersPage/>}/>
          <Route path="events" element={<EventsPage/>}/>
          <Route path="events/:id" element={<EventPage/>}/>
          <Route path="volunteers" element={<VolunteersPage/>}/>
          <Route path="tasks" element={<TasksPage/>}/>
          <Route path="shop" element={<ShopPage/>}/>
          <Route path="finance" element={<FinancePage/>}/>
          <Route path="reimbursements" element={<ClaimsPage/>}/>
          <Route path="announcements" element={<AnnouncementsPage/>}/>
          <Route path="settings" element={<SettingsPage/>}/>
          <Route path="profile" element={<ProfilePage/>}/>
        </Route>
        <Route path="/volunteer" element={<Protected portal="volunteer"/>}>
          <Route index element={<VolunteerDashboard/>}/>
          <Route path="events" element={<EventsPage volunteer/>}/>
          <Route path="events/:id" element={<EventPage volunteer/>}/>
          <Route path="tasks" element={<TasksPage volunteer/>}/>
          <Route path="availability" element={<EventsPage volunteer availability/>}/>
          <Route path="expenses" element={<ClaimsPage volunteer/>}/>
          <Route path="announcements" element={<AnnouncementsPage volunteer/>}/>
          <Route path="profile" element={<ProfilePage/>}/>
        </Route>
        <Route path="/" element={<Navigate to={user?`/${allowed(user,'admin')?'admin':'volunteer'}`:'/admin/login'} replace/>}/>
        <Route path="*" element={<div className="denied"><h1>Page not found</h1><Button asChild><Link to="/">Return to Skyline</Link></Button></div>}/>
      </Routes>
    </AuthContext.Provider>
  );
}
