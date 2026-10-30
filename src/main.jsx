import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Award, BarChart3, CalendarCheck, Check, ChevronDown, Clock3, Eye, EyeOff, Facebook, Heart, Instagram, LayoutDashboard, Mail,
  MapPin, Menu, MessageCircle, Moon, Quote, Settings, ShieldCheck, Sparkles, Sun, Tags, Users, X
} from 'lucide-react';
import axios from 'axios';
import './styles.css';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});
const API_ORIGIN = API.defaults.baseURL.replace(/\/api\/?$/, '');
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '1dc62fdf-f0b7-4978-9cb7-2270299e69fe';
const images = {
  hero: '/images/anu-glamora-portrait.png?v=2',
  studio: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1100&q=85',
  ritual: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
  hair: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=85',
  bride: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85',
  fallback: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85'
};
const studio = {
  email: 'anuviyadav11421@gmail.com',
  address: 'Paliwal Chauraha, Shikohabad',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Paliwal%20Chauraha%2C%20Shikohabad',
  instagram: 'https://www.instagram.com/official_anu.ydv?psln=a2dpanppZ3ZrZ2R0'
};

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('anu-glamora-theme', theme);
  }, [theme]);
  return [theme, () => setTheme(theme === 'light' ? 'dark' : 'light')];
}

function usePageTitle(title) {
  useEffect(() => { document.title = `${title} | Anu Glamora`; }, [title]);
}

function Brand({ compact = false }) {
  return <Link className={`brand ${compact ? 'brand-compact' : ''}`} to="/">
    <span className="brand-monogram">AG</span>
    <span><b>Anu Glamora</b><small>Beauty & Makeover Studio</small></span>
  </Link>;
}

function Layout({ children }) {
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  useEffect(() => { API.get('/auth/me').then((r) => setUser(r.data.data.user)).catch(() => { }); }, [location.pathname]);
  useEffect(() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);
  const links = [
    { to: '/', label: 'Home' }, { to: '/about', label: 'Our story' }, { to: '/services', label: 'Services' },
    { to: '/gallery', label: 'The gallery' }, { to: '/virtual-makeover', label: 'Virtual try-on' }, { to: '/contact', label: 'Contact' }
  ];
  return <div className="app-shell">
    <div className="announcement"><span><Sparkles size={13} /> Now accepting appointments for the season</span><Link to="/booking">Reserve your moment <ArrowRight size={13} /></Link></div>
    <header className="site-header">
      <Brand />
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
        <div className="nav-links">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/'}>{link.label}</NavLink>)}</div>
        <div className="nav-actions">
          <Link className="account-link" to={user ? '/profile' : '/login'}>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign in'}</Link>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'night' : 'day'} mode`}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}</button>
          <Link className="button button-small" to="/booking">Book appointment <ArrowRight size={14} /></Link>
        </div>
      </nav>
    </header>
    <main>{children}</main>
    <Footer />
  </div>;
}

function Footer() {
  return <footer>
    <div className="footer-main">
      <div className="footer-intro"><Brand /><p>Beauty begins with you.</p><div className="socials"><a href={studio.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={16} /></a><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={16} /></a><a href={`mailto:${studio.email}`} aria-label="Email"><Mail size={16} /></a></div></div>
      <div className="footer-column"><h4>Explore</h4><Link to="/about">Our story</Link><Link to="/services">Services</Link><Link to="/gallery">Gallery</Link><Link to="/offers">Offers</Link></div>
      <div className="footer-column"><h4>Visit the studio</h4><a href={studio.mapUrl} target="_blank" rel="noreferrer"><MapPin size={14} /> {studio.address}</a><span><Clock3 size={14} /> Tue — Sun · By appointment</span><a href={`mailto:${studio.email}`}><Mail size={14} /> {studio.email}</a></div>
      <div className="footer-column"><h4>Good to know</h4><Link to="/faq">FAQs</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/contact">Get in touch</Link></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Anu Glamora. Made with intention.</span><span>Beauty Begins With You.</span></div>
  </footer>;
}

function Eyebrow({ children, icon = <Sparkles size={14} /> }) { return <span className="eyebrow">{icon}{children}</span>; }
function SectionTitle({ eyebrow, title, copy, align = '' }) { return <div className={`section-title ${align}`}>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{copy && <p>{copy}</p>}</div>; }
function Button({ to, children, variant = '', onClick, type = 'button' }) { return to ? <Link className={`button ${variant}`} to={to}>{children}<ArrowRight size={16} /></Link> : <button className={`button ${variant}`} onClick={onClick} type={type}>{children}<ArrowRight size={16} /></button>; }
function Image({ src, alt, className = '', ...props }) { const resolvedSrc = src?.startsWith('/uploads/') ? `${API_ORIGIN}${src}` : src; return <img className={className} src={resolvedSrc || images.fallback} alt={alt} decoding="async" onError={(e) => { e.currentTarget.src = images.fallback; }} {...props} />; }

function Home() {
  usePageTitle('Beauty Begins With You');
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  useEffect(() => { Promise.all([API.get('/services', { params: { limit: 3 } }), API.get('/offers')]).then(([serviceResponse, offerResponse]) => { setServices(serviceResponse.data.data.items); setOffers(offerResponse.data.data); }).catch(() => { }); }, []);
  return <>
    <section className="hero">
      <div className="hero-content"><Eyebrow icon={<span className="eyebrow-line" />}>Beauty begins with you</Eyebrow><h1>Come for the <em>glow.</em><br />Stay for the feeling.</h1><p className="hero-lede">An intimate beauty studio for makeup, hair, and skin rituals that make you feel more like yourself.</p><div className="hero-cta"><Button to="/booking">Book your makeover</Button><Link className="under-link" to="/services">Explore the menu <ArrowRight size={15} /></Link></div><div className="hero-proof"><span className="proof-icons"><i>✦</i><i>✦</i><i>✦</i></span><span><b>Made personal, always.</b><small>From your first consultation to the final touch.</small></span></div></div>
      <div className="hero-visual"><div className="hero-arch" /><Image src={images.hero} alt="Woman with elegant natural makeup" /><div className="hero-caption"><span className="caption-dot" /><span><b>THE ANU GLAMORA EDIT</b><small>Soft radiance · effortless beauty</small></span></div><div className="hero-stamp">AG<br /><small>EST. 2024</small></div></div>
    </section>
    <section className="brand-strip"><span>MAKEUP</span><i>✦</i><span>HAIR</span><i>✦</i><span>SKIN</span><i>✦</i><span>CONFIDENCE</span><i>✦</i><span>CELEBRATION</span></section>
    <section className="home-intro content-section"><div className="intro-image-wrap"><Image src={images.studio} alt="Calm, welcoming beauty studio" /><span className="image-note">A softer kind of luxury <i>↗</i></span></div><div className="intro-copy"><Eyebrow icon={<span className="eyebrow-line" />}>The Anu Glamora way</Eyebrow><h2>Beauty is not a mask.<br /><em>It is a mood.</em></h2><p>We believe the best beauty experiences are the ones that leave you feeling understood. Our artists create considered looks around your features, your comfort, and the moment you are stepping into.</p><div className="signature">AG <span>with love, always</span></div><Button to="/about" variant="button-outline">Discover our story</Button></div></section>
    <section className="service-preview content-section soft-section"><div className="section-heading-row"><SectionTitle eyebrow="The edit" title="A little luxury, made for you." copy="From wedding mornings to ordinary Tuesdays, choose the ritual that meets you where you are." /><Link className="under-link" to="/services">View all services <ArrowRight size={15} /></Link></div><div className="service-grid">{services.length ? services.map((service) => <ServiceCard key={service.id} service={service} />) : <LoadingCards />}</div></section>
    {offers.length > 0 && <section className="home-offers content-section"><div className="section-heading-row"><SectionTitle eyebrow="A little extra" title="Make your moment even sweeter." copy="Enjoy an active studio offer on your next booking." /><Link className="under-link" to="/offers">View all offers <ArrowRight size={15} /></Link></div><div className="home-offer-grid">{offers.slice(0, 3).map((offer) => <article className="offer-card" key={offer.code}><div><Eyebrow>Limited-time offer</Eyebrow><h3>{offer.discount_type === 'percentage' ? `${offer.discount_value}% off` : `₹${Number(offer.discount_value).toLocaleString('en-IN')} off`}</h3><p>Use code <strong>{offer.code}</strong>{Number(offer.min_order) > 0 ? ` on orders above ₹${Number(offer.min_order).toLocaleString('en-IN')}.` : ' on your next booking.'}</p><small>Valid until {new Date(offer.expires_at).toLocaleDateString('en-IN')}</small></div><Sparkles size={28} /></article>)}</div></section>}
    <section className="experience-section content-section"><SectionTitle eyebrow="More than a makeover" title="The details make the difference." align="center" /><div className="experience-grid"><Experience icon={<Users />} number="01" title="Listen first" copy="A relaxed consultation where your preferences, features, and occasion lead the way." /><Experience icon={<ShieldCheck />} number="02" title="Craft with care" copy="Professional artistry, considered products, and the highest standards of hygiene." /><Experience icon={<Award />} number="03" title="Leave glowing" copy="Not just polished. More confident, more comfortable, and completely yourself." /></div></section>
    <section className="testimonial-section content-section"><div className="testimonial-quote"><Quote size={36} /><blockquote>“The whole experience felt so personal. I looked like myself on my best day — exactly what I wanted.”</blockquote><span>— A studio note from a recent bride</span></div><div className="testimonial-image"><Image src={images.bride} alt="Bridal makeup look" /></div></section>
    <section className="cta-section"><div><Eyebrow>Take your time</Eyebrow><h2>Your next beautiful<br /><em>moment awaits.</em></h2></div><Button to="/booking" variant="button-light">Find your service</Button></section>
  </>;
}

function Experience({ icon, number, title, copy }) { return <div className="experience-item"><div className="experience-icon">{icon}</div><span className="item-number">{number}</span><h3>{title}</h3><p>{copy}</p></div>; }
function LoadingCards() { return [1, 2, 3].map((item) => <div className="service-card skeleton" key={item}><div className="skeleton-image" /><div className="service-card-body"><div /><div /><div /></div></div>); }

function ServiceCard({ service }) {
  return <article className="service-card"><div className="service-image-wrap"><Image src={service.image_url} alt={service.name} loading="lazy" /><span className="service-category">{service.category}</span><button className="favorite-button" aria-label={`Save ${service.name}`}><Heart size={16} /></button></div><div className="service-card-body"><h3>{service.name}</h3><p>{service.description}</p><div className="service-meta"><span><Clock3 size={14} /> {service.duration_minutes} min</span><strong>₹{Number(service.discounted_price || service.price).toLocaleString('en-IN')}</strong></div><Link className="card-link" to={`/services/${service.id}`}>Explore service <ArrowRight size={15} /></Link></div></article>;
}

function Services() {
  usePageTitle('Services');
  const [allServices, setAllServices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  useEffect(() => { API.get('/services', { params: { limit: 50 } }).then((r) => setAllServices(r.data.data.items)).catch(() => setAllServices([])); }, []);
  const categories = [...new Map(allServices.filter((service) => service.category_slug).map((service) => [service.category_slug, service.category])).entries()];
  const normalizedSearch = search.trim().toLowerCase();
  const services = allServices.filter((service) => {
    const matchesCategory = category === 'all' || service.category_slug === category;
    const matchesSearch = !normalizedSearch || `${service.name} ${service.description} ${service.category}`.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
  return <section className="page-section services-page"><div className="page-hero"><Eyebrow>Our menu</Eyebrow><h1>Find your <em>kind of beautiful.</em></h1><p>A considered collection of makeup, hair, and skin experiences. Come as you are; leave feeling luminous.</p></div><div className="service-toolbar"><label className="search-field"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the menu" aria-label="Search services" /></label><div className="category-pills"><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>All services</button>{categories.map(([slug, label]) => <button key={slug} className={category === slug ? 'active' : ''} onClick={() => setCategory(slug)}>{label}</button>)}</div></div><div className="service-grid service-grid-large">{services.map((service) => <ServiceCard service={service} key={service.id} />)}</div>{allServices.length > 0 && !services.length && <EmptyState title="No matching services" copy="Try another search or choose All services." />}{!allServices.length && <EmptyState title="The menu is being prepared" copy="Import the included seed data to display the studio services." />}</section>;
}

function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  usePageTitle(service?.name || 'Service');
  useEffect(() => { API.get(`/services/${id}`).then((r) => setService(r.data.data)).catch(() => setService(false)); }, [id]);
  if (service === false) return <EmptyState title="We could not find that service" copy="Try exploring the full menu instead." action={{ to: '/services', label: 'Back to services' }} />;
  if (!service) return <LoadingPage />;
  return <section className="detail-page page-section"><Link className="back-link" to="/services">← Back to services</Link><div className="detail-layout"><div className="detail-image-panel"><Image src={service.image_url} alt={service.name} /><span className="detail-badge"><Sparkles size={14} /> Signature service</span></div><div className="detail-copy"><Eyebrow>{service.category}</Eyebrow><h1>{service.name}</h1><p className="detail-lede">{service.description}</p><div className="detail-info"><span><Clock3 size={17} /> {service.duration_minutes} minutes</span><span><Sparkles size={17} /> Personal consultation</span></div><div className="detail-price"><span>Investment from</span><strong>₹{Number(service.discounted_price || service.price).toLocaleString('en-IN')}</strong></div><Button to={`/booking?service=${service.id}`}>Reserve this service</Button><p className="detail-note"><ShieldCheck size={15} /> Your appointment is confirmed personally by our studio team.</p></div></div></section>;
}

function Booking() {
  usePageTitle('Book an appointment');
  const [params] = useSearchParams();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ service_id: params.get('service') || '', appointment_date: '', start_time: '10:00', notes: '' });
  const [state, setState] = useState({ loading: false, message: '', error: '' });
  useEffect(() => { API.get('/services').then((r) => setServices(r.data.data.items)).catch(() => { }); }, []);
  const selected = services.find((service) => String(service.id) === String(form.service_id));
  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, message: '', error: '' });
    try {
      const response = await API.post('/appointments', { ...form, service_id: Number(form.service_id) });
      setState({ loading: false, message: `Your request is with us. Reference: ${response.data.data.booking_reference}`, error: '' });
    } catch (error) { setState({ loading: false, message: '', error: error.response?.data?.error || 'Please sign in before requesting an appointment.' }); }
  }
  return <section className="booking-page page-section"><div className="booking-aside"><Eyebrow>Make it yours</Eyebrow><h1>Reserve your <em>moment.</em></h1><p>Tell us what you have in mind and we will take care of the details. Every appointment begins with a personal confirmation from our team.</p><div className="booking-promise"><span><CalendarCheck />Flexible scheduling</span><span><MessageCircle />Personal consultation</span><span><ShieldCheck />Thoughtful, hygienic care</span></div></div><form className="booking-form" onSubmit={submit}><div className="form-step"><span>01</span><div><h3>Choose your service</h3><label>Service<select required value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}><option value="">Select an experience</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name} · ₹{Number(service.discounted_price || service.price).toLocaleString('en-IN')}</option>)}</select></label></div></div><div className="form-step"><span>02</span><div><h3>Choose your preferred time</h3><div className="form-row"><label>Date<input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} /></label><label>Time<input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></label></div></div></div><div className="form-step"><span>03</span><div><h3>Anything we should know?</h3><label>Notes <textarea rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Your occasion, preferences, or questions..." /></label></div></div>{selected && <div className="booking-summary"><span>{selected.name}</span><strong>₹{Number(selected.discounted_price || selected.price).toLocaleString('en-IN')}</strong></div>}{state.error && <div className="form-alert error">{state.error}</div>}{state.message && <div className="form-alert success"><Check size={16} /> {state.message}</div>}<button className="button booking-submit" disabled={state.loading} type="submit">{state.loading ? 'Sending request...' : 'Request appointment'} <ArrowRight size={16} /></button><small className="form-disclaimer">You will be asked to sign in or create an account before confirming your appointment.</small></form></section>;
}

function Auth({ register = false, reset = false, admin = false }) {
  usePageTitle(reset ? 'Reset password' : register ? 'Create account' : admin ? 'Admin sign in' : 'Sign in');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: params.get('email') || '', password: '', confirmPassword: '', otp: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event) {
    event.preventDefault();
    try {
      if (reset) {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        await API.post('/auth/reset-password', form);
        navigate('/login');
        return;
      }
      const response = await API.post(`/auth/${register ? 'register' : 'login'}`, register ? form : { identifier: form.identifier, password: form.password });
      if (admin && response.data.data.user?.role !== 'admin') {
        await API.post('/auth/logout');
        setError('Administrator access is required.');
        return;
      }
      if (!admin && response.data.data.user?.role === 'admin') {
        await API.post('/auth/logout');
        setError('Use the administrator sign-in page.');
        return;
      }
      navigate(admin ? '/admin' : '/profile');
    } catch (e) { setError(e.response?.data?.error || 'Unable to continue.'); }
  }
  return <section className="auth-page page-section"><div className="auth-visual"><Image src={images.ritual} alt="Skincare ritual" /><div><Eyebrow>{admin ? 'Private workspace' : 'Welcome to your studio'}</Eyebrow><h2>{admin ? <>Studio control<br /><em>room.</em></> : <>There is always time<br /><em>for yourself.</em></>}</h2></div></div><div className="auth-panel"><Eyebrow>{reset ? 'Account recovery' : register ? 'Start your journey' : admin ? 'Administrator access' : 'Welcome back'}</Eyebrow><h1>{reset ? 'Choose a new password.' : register ? 'Create your account.' : admin ? 'Admin sign in.' : 'Sign in to your studio.'}</h1><p>{reset ? 'Enter your OTP and choose a new password for your account.' : register ? 'Save your favourite services and manage every appointment in one place.' : admin ? 'Sign in with your administrator username or mobile number.' : 'Use your registered email, username, or mobile number to sign in.'}</p><form className="form-card flat-form" autoComplete="off" onSubmit={submit}>{register && <label>Full name<input autoComplete="off" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}{!register && !reset && <label>Email, username, or mobile number<input autoComplete="off" required value={form.identifier || ''} onChange={(e) => setForm({ ...form, identifier: e.target.value })} /></label>}{(register || reset) && <label>Email address<input autoComplete="off" required readOnly={reset} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>}{reset && <label>Six-digit OTP<input autoComplete="off" required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })} /></label>}<label className="password-field">{reset ? 'New password' : 'Password'}<div className="password-input-wrap"><input autoComplete="new-password" required minLength="8" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{reset && <label className="password-field">Confirm new password<div className="password-input-wrap"><input autoComplete="new-password" required minLength="8" type={showPassword ? 'text' : 'password'}   value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide confirmation password' : 'Show confirmation password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>}{error && <div className="form-alert error">{error}</div>}<button className="button" type="submit">{reset ? 'Update password' : register ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form>{!register && !reset && !admin && <><p className="auth-switch"><span>New to Anu Glamora?</span> <Link to="/register">Create an account</Link></p><p className="auth-switch auth-forgot"><Link to="/forgot-password">Forgot your password?</Link></p></>}{admin && <p className="auth-switch"><Link to="/login">Customer sign in</Link></p>}{reset && <p className="auth-switch">Remembered your password? <Link to="/login">Sign in</Link></p>}{register && <p className="auth-switch">Already a member? <Link to="/login">Sign in</Link></p>}</div></section>;
}

function ForgotPassword() {
  usePageTitle('Forgot password');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ message: '', error: '' });
  async function submit(event) {
    event.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await API.post('/auth/forgot-password', { email: normalizedEmail });
      navigate(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error) { setState({ message: '', error: error.response?.data?.error || 'Unable to send a reset code.' }); }
  }
  return <section className="auth-page page-section"><div className="auth-visual"><Image src={images.hair} alt="Styled hair in the studio" /><div><Eyebrow>We have got you</Eyebrow><h2>A fresh start<br /><em>is close.</em></h2></div></div><div className="auth-panel"><Eyebrow>Account recovery</Eyebrow><h1>Forgot your password?</h1><p>Enter your account email. We will verify it and send a secure six-digit OTP.</p><form className="form-card flat-form" autoComplete="off" onSubmit={submit}><label>Email address<input required autoComplete="off" inputMode="email" type="email" value={email} onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} /></label>{state.error && <div className="form-alert error">{state.error}</div>}<button className="button" type="submit">Continue <ArrowRight size={16} /></button></form><p className="auth-switch">Remembered your password? <Link to="/login">Sign in</Link></p></div></section>;
}

function About() {
  usePageTitle('Our story');
  return <><section className="page-hero about-hero page-section"><Eyebrow>Our story</Eyebrow><h1>Beauty with a little<br /><em>more feeling.</em></h1><p>We created Anu Glamora for the days you want to feel especially yourself.</p></section><section className="about-story content-section"><Image src={images.studio} alt="Anu Glamora beauty studio" /><div><Eyebrow>The philosophy</Eyebrow><h2>Soft, considered,<br /><em>entirely yours.</em></h2><p>Our studio is an invitation to slow down. We pair professional artistry with a warm, attentive approach — creating makeup, hair, and skincare experiences that never feel rushed or one-size-fits-all.</p><p>Whether you are preparing for a once-in-a-lifetime celebration or simply making an ordinary day feel special, we believe you deserve the same level of care.</p><div className="signature large-signature">AG <span>beauty begins with you</span></div></div></section><section className="values-band content-section"><SectionTitle eyebrow="What we stand for" title="The little things matter." align="center" /><div className="values-list"><Experience number="01" title="Personal, never prescriptive" copy="Your features and preferences are the starting point — not a trend or template." icon={<Heart />} /><Experience number="02" title="Beautifully responsible" copy="We choose quality products, maintain thoughtful hygiene, and respect your time." icon={<ShieldCheck />} /><Experience number="03" title="A place to exhale" copy="Come in for the service, stay for the feeling of being looked after." icon={<Sparkles />} /></div></section></>;
}

function Gallery() {
  usePageTitle('The gallery');
  const [items, setItems] = useState([]);
  useEffect(() => { API.get('/gallery').then((r) => setItems(r.data.data)).catch(() => { }); }, []);
  const fallback = [{ title: 'The bridal edit', category: 'Bridal', image_url: images.bride, alt_text: 'Bridal beauty look', caption: 'Luminous, timeless, entirely you.' }, { title: 'Soft movement', category: 'Hair', image_url: images.hair, alt_text: 'Softly styled hair', caption: 'Effortless occasion styling.' }, { title: 'The skin ritual', category: 'Skincare', image_url: images.ritual, alt_text: 'Skincare treatment', caption: 'A little time back to yourself.' }];
  const gallery = items.length ? items : fallback;
  return <section className="page-section gallery-page"><div className="page-hero"><Eyebrow>The gallery</Eyebrow><h1>Beauty in <em>every detail.</em></h1><p>A glimpse at the looks, rituals, and moments we love creating in the studio.</p></div><div className="gallery-grid">{gallery.map((item, index) => <figure className={`gallery-tile tile-${index + 1}`} key={item.id || item.title}><Image src={item.image_url} alt={item.alt_text || item.title} loading="lazy" /><figcaption><span>{item.category}</span><b>{item.title}</b><small>{item.caption}</small></figcaption></figure>)}</div></section>;
}

function VirtualMakeover() {
  usePageTitle('Virtual try-on');
  const [image, setImage] = useState(null);
  const [look, setLook] = useState('soft');
  const looks = { soft: { label: 'Soft rose', color: '#c98278' }, glow: { label: 'Golden glow', color: '#d9a95e' }, berry: { label: 'Berry stain', color: '#9e5266' } };
  return <section className="page-section makeover-page"><div className="page-hero"><Eyebrow>Virtual try-on</Eyebrow><h1>See your <em>next look.</em></h1><p>A playful preview to help you explore. This is a visual styling tool — not AI-generated makeup and not a substitute for an in-studio consultation.</p></div><div className="makeover-workspace"><div className={`makeover-preview look-${look}`}>{image ? <img src={image} alt="Your portrait preview" /> : <div className="upload-empty"><Sparkles size={30} /><b>Your portrait, your canvas.</b><span>Upload a well-lit photo to preview a look.</span></div>}<div className="makeup-overlay" style={{ backgroundColor: looks[look].color }} /></div><div className="makeover-controls"><div className="control-heading"><span>01</span><div><b>Upload your portrait</b><small>JPG, PNG or WebP · max 5 MB</small></div></div><label className="upload-button button button-outline">Choose image<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file && file.size <= 5 * 1024 * 1024) setImage(URL.createObjectURL(file)); }} /></label><div className="control-heading"><span>02</span><b>Explore a mood</b></div><div className="look-options">{Object.entries(looks).map(([key, value]) => <button className={look === key ? 'selected' : ''} onClick={() => setLook(key)} key={key}><i style={{ backgroundColor: value.color }} />{value.label}</button>)}</div><div className="makeover-note"><ShieldCheck size={16} /><span>Your image stays in your browser and is not uploaded or stored.</span></div>{image && <button className="under-link reset-button" onClick={() => setImage(null)}>Reset preview</button>}</div></div></section>;
}

function Contact() {
  usePageTitle('Contact');
  const [state, setState] = useState({ sent: false, error: '', loading: false });
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ sent: false, error: '', loading: true });
    try {
      await API.post('/contact', Object.fromEntries(form.entries()));
      form.append('access_key', WEB3FORMS_ACCESS_KEY);
      form.append('subject', `Anu Glamora contact message: ${form.get('topic')}`);
      const web3Response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: form });
      const web3Result = await web3Response.json();
      if (!web3Response.ok || !web3Result.success) throw new Error(web3Result.message || web3Result.body?.message || 'Web3Forms rejected the message. Check the access key and Web3Forms inbox settings.');
      event.currentTarget.reset();
      setState({ sent: true, error: '', loading: false });
    } catch (error) {
      const providerMessage = error.message && !error.response ? error.message : '';
      setState({ sent: false, error: error.response?.data?.error || providerMessage || 'We could not send your message. Please try again.', loading: false });
    }
  }
  return <section className="contact-page page-section"><div className="contact-intro"><Eyebrow>Come say hello</Eyebrow><h1>We would love to<br /><em>hear from you.</em></h1><p>Questions about a service, a wedding morning, or simply where to begin? Send us a note and our studio team will be in touch.</p><div className="contact-details"><a href={`mailto:${studio.email}`}><Mail size={17} /><b>{studio.email}</b></a><span><Clock3 size={17} /><b>Tuesday — Sunday · By appointment</b></span><a className="map-link" href={studio.mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={17} /><b>{studio.address}</b></a><a className="button button-small map-button" href={studio.mapUrl} target="_blank" rel="noopener noreferrer">Open Google Maps <ArrowRight size={14} /></a></div></div><form className="contact-form form-card" onSubmit={submit}><div className="form-row"><label>Your name<input name="name" required /></label><label>Email address<input name="email" required type="email" /></label></div><label>What can we help with?<select name="topic"><option>Tell me about a service</option><option>Plan a bridal appointment</option><option>Ask about availability</option><option>Something else</option></select></label><label>Your message<textarea name="message" required rows="6" placeholder="A few words about what you are looking for..." /></label>{state.error && <div className="form-alert error">{state.error}</div>}{state.sent && <div className="form-alert success"><Check size={16} /> Thank you — our studio team will be in touch.</div>}<button className="button" disabled={state.loading} type="submit">{state.loading ? 'Sending...' : 'Send message'} <ArrowRight size={16} /></button></form></section>;
}

function Profile() {
  usePageTitle('Your profile');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  useEffect(() => { Promise.all([API.get('/auth/me'), API.get('/appointments/my-bookings')]).then(([u, b]) => { setUser(u.data.data.user); setBookings(b.data.data); }).catch(() => { }); }, []);
  async function logout() { await API.post('/auth/logout'); window.location.href = '/'; }
  if (!user) return <section className="page-section"><EmptyState title="Sign in to see your studio" copy="Your appointments and personal details will appear here." action={{ to: '/login', label: 'Sign in' }} /></section>;
  return <section className="page-section profile-page"><div className="profile-header"><div className="profile-avatar">{user.name.slice(0, 1)}</div><div><Eyebrow>Your studio</Eyebrow><h1>Hello, <em>{user.name.split(' ')[0]}.</em></h1><p>{user.email}</p></div><div className="profile-actions"><Button to="/booking">Book again</Button><button className="button button-outline" type="button" onClick={logout}>Sign out</button></div></div><div className="profile-grid"><div className="dashboard-card"><div className="card-heading"><h3>Upcoming appointments</h3><CalendarCheck size={18} /></div>{bookings.length ? bookings.map((booking) => <div className="booking-row" key={booking.id}><div><b>{booking.service_name}</b><small>{booking.appointment_date} · {booking.start_time}</small></div><span className={`status ${booking.status}`}>{booking.status}</span></div>) : <div className="card-empty"><p>Your next beautiful moment is waiting.</p><Link className="under-link" to="/booking">Make an appointment <ArrowRight size={14} /></Link></div>}</div><div className="dashboard-card profile-details"><div className="card-heading"><h3>Your details</h3></div><p><span>Name</span><b>{user.name}</b></p><p><span>Email</span><b>{user.email}</b></p><p><span>Member since</span><b>{user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '—'}</b></p></div></div>{message && <div className="form-alert success">{message}</div>}</section>;
}

function Admin() {
  usePageTitle('Studio dashboard');
  const [stats, setStats] = useState(null);
  useEffect(() => { API.get('/admin/dashboard').then((r) => setStats(r.data.data)).catch(() => setStats(false)); }, []);
  const value = (key) => stats ? stats[key] : '—';
  return <section className="admin-page"><div className="admin-header"><div><Eyebrow>Studio management</Eyebrow><h1>Good morning, <em>admin.</em></h1><p>Monitor appointments, customers, and your studio content.</p></div></div><div className="admin-stats"><Stat label="Today's appointments" value={value('today')} icon={<CalendarCheck />} /><Stat label="Pending requests" value={value('pending')} icon={<Clock3 />} /><Stat label="Completed appointments" value={value('completed')} icon={<Check />} /><Stat label="Customers" value={value('customers')} icon={<Users />} /></div><div className="admin-content"><div className="dashboard-card"><div className="card-heading"><h3>Quick actions</h3></div><div className="admin-actions"><NavLink to="/admin/services"><Sparkles />Manage services</NavLink><NavLink to="/admin/gallery"><Award />Manage gallery</NavLink><NavLink to="/admin/bookings"><CalendarCheck />Manage bookings</NavLink><NavLink to="/admin/customers"><Users />Customer profiles</NavLink></div></div><div className="dashboard-card"><div className="card-heading"><h3>Studio checklist</h3></div><ul className="check-list"><li><Check /> Review pending requests</li><li><Check /> Update gallery content</li><li><Check /> Confirm completed appointments</li></ul></div></div></section>;
}
function Stat({ label, value, icon }) { return <div className="stat-card"><span>{icon}</span><b>{value}</b><small>{label}</small></div>; }

function AdminPlaceholder({ title, icon: Icon = Settings }) {
  usePageTitle(title);
  return <section className="admin-page"><div className="admin-subpage-heading"><Icon /><div><Eyebrow>Administration</Eyebrow><h1>{title}</h1><p>Manage this area of your studio from one secure workspace.</p></div></div><div className="dashboard-card admin-placeholder"><Icon /><h3>{title} workspace</h3><p>This management view is connected to the admin shell and ready for its operational tools.</p></div></section>;
}

function AdminServices() {
  const empty = { name: '', category_id: '', description: '', price: '', discounted_price: '', duration_minutes: '60', image_url: '', featured: false };
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const load = () => Promise.all([API.get('/services', { params: { limit: 50 } }), API.get('/admin/categories')]).then(([s, c]) => { setServices(s.data.data.items); setCategories(c.data.data); }).catch((e) => setError(e.response?.data?.error || 'Unable to load services.'));
  useEffect(load, []);
  async function save(event) {
    event.preventDefault();
    try { const payload = { ...form, category_id: Number(form.category_id), price: Number(form.price), discounted_price: form.discounted_price ? Number(form.discounted_price) : null, duration_minutes: Number(form.duration_minutes) }; if (file) { const data = new FormData(); Object.entries(payload).forEach(([key, value]) => data.append(key, value === null ? '' : String(value))); data.append('image', file); await API.request({ method: editing ? 'put' : 'post', url: `/services${editing ? `/${editing}` : ''}`, data, headers: { 'Content-Type': 'multipart/form-data' } }); } else if (editing) await API.put(`/services/${editing}`, payload); else await API.post('/services', payload); setForm(empty); setFile(null); setEditing(null); load(); } catch (e) { setError(e.response?.data?.error || 'Unable to save service.'); }
  }
  async function remove(id) { if (!window.confirm('Deactivate this service?')) return; await API.delete(`/services/${id}`); load(); }
  function edit(service) { setEditing(service.id); setFile(null); setForm({ name: service.name, category_id: categories.find((category) => category.slug === service.category_slug)?.id || '', description: service.description, price: service.price, discounted_price: service.discounted_price || '', duration_minutes: service.duration_minutes, image_url: service.image_url || '', featured: Boolean(service.featured) }); }
  return <section className="admin-page"><div className="admin-subpage-heading"><Sparkles /><div><Eyebrow>Administration</Eyebrow><h1>Services</h1><p>Add, edit, feature, or deactivate anything in the public service menu.</p></div></div><div className="admin-manager-grid"><form className="dashboard-card admin-editor" onSubmit={save}><div className="card-heading"><h3>{editing ? 'Edit service' : 'Add service'}</h3></div><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Category<select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><div className="form-row"><label>Price<input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>Discounted price<input type="number" min="0" value={form.discounted_price} onChange={(e) => setForm({ ...form, discounted_price: e.target.value })} /></label></div><label>Duration in minutes<input required type="number" min="1" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} /></label><label>Upload image<input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => setFile(e.target.files[0] || null)} /><small>JPG, JPEG, PNG, WebP, GIF, or AVIF up to 5 MB</small></label><label>Image URL<input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></label><label>Description<textarea required rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label className="checkbox-label"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured service</label>{error && <div className="form-alert error">{error}</div>}<div className="editor-actions"><button className="button" type="submit">{editing ? 'Save changes' : 'Add service'} <Check size={15} /></button>{editing && <button className="under-link" type="button" onClick={() => { setEditing(null); setFile(null); setForm(empty); }}>Cancel</button>}</div></form><div className="dashboard-card admin-list-card"><div className="card-heading"><h3>Live service menu</h3><span>{services.length} services</span></div>{services.map((service) => <div className="admin-list-row" key={service.id}><div><b>{service.name}</b><small>{service.category} · ₹{Number(service.price).toLocaleString('en-IN')}</small></div><div><button className="table-action" onClick={() => edit(service)}>Edit</button><button className="table-action danger" onClick={() => remove(service.id)}>Delete</button></div></div>)}</div></div></section>;
}

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const load = () => API.get('/appointments').then((r) => setBookings(r.data.data)).catch(() => {});
  useEffect(load, []);
  async function update(id, status) { await API.patch(`/appointments/${id}/status`, { status }); load(); }
  return <section className="admin-page"><div className="admin-subpage-heading"><CalendarCheck /><div><Eyebrow>Administration</Eyebrow><h1>Appointments</h1><p>Review and update every customer appointment.</p></div></div><div className="dashboard-card admin-table-card">{bookings.map((booking) => <div className="admin-list-row" key={booking.id}><div><b>{booking.service_name}</b><small>{booking.customer_name} · {booking.appointment_date} · {booking.start_time}</small></div><select className="status-select" value={booking.status} onChange={(e) => update(booking.id, e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No show</option></select></div>)}{!bookings.length && <EmptyState title="No appointments yet" copy="New customer bookings will appear here." />}</div></section>;
}

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { API.get('/admin/customers').then((r) => setCustomers(r.data.data)).catch(() => {}); }, []);
  return <section className="admin-page"><div className="admin-subpage-heading"><Users /><div><Eyebrow>Administration</Eyebrow><h1>Customers</h1><p>View customer accounts and signup history.</p></div></div><div className="dashboard-card admin-table-card">{customers.map((customer) => <div className="admin-list-row" key={customer.id}><div><b>{customer.name}</b><small>{customer.email} {customer.phone ? `· ${customer.phone}` : ''}</small></div><span className="admin-date">{new Date(customer.created_at).toLocaleDateString('en-IN')}</span></div>)}{!customers.length && <EmptyState title="No customers yet" copy="Customer registrations will appear here." />}</div></section>;
}

function AdminGallery() {
  const galleryCategories = ['Bridal', 'Hair', 'Skincare', 'Makeup', 'Studio'];
  const empty = { title: '', category: 'Bridal', image_url: '', alt_text: '', caption: '', is_published: true };
  const [items, setItems] = useState([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null); const [file, setFile] = useState(null); const [error, setError] = useState('');
  const load = () => API.get('/gallery/manage').then((r) => setItems(r.data.data)).catch((e) => setError(e.response?.data?.error || 'Unable to load gallery.'));
  useEffect(load, []);
  async function save(event) { event.preventDefault(); try { if (editing) await API.put(`/gallery/${editing}`, form); else if (file) { const data = new FormData(); Object.entries(form).forEach(([key, value]) => data.append(key, key === 'is_published' ? String(Boolean(value)) : value)); data.append('image', file); await API.post('/gallery/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }); } else await API.post('/gallery', form); setForm(empty); setFile(null); setEditing(null); load(); } catch (e) { setError(e.response?.data?.error || 'Unable to save gallery item.'); } }
  async function remove(id) { if (!window.confirm('Delete this gallery item?')) return; try { await API.delete(`/gallery/${id}`); load(); } catch (e) { setError(e.response?.data?.error || 'Unable to delete gallery item.'); } }
  return <section className="admin-page"><div className="admin-subpage-heading"><Award /><div><Eyebrow>Administration</Eyebrow><h1>Gallery</h1><p>Upload, edit, publish, or remove the images shown on the public gallery.</p></div></div><div className="admin-manager-grid"><form className="dashboard-card admin-editor" onSubmit={save}><div className="card-heading"><h3>{editing ? 'Edit gallery item' : 'Upload gallery image'}</h3></div><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Category<select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{galleryCategories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>{!editing && <label>Image file<input required type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => setFile(e.target.files[0] || null)} /><small>JPG, JPEG, PNG, WebP, GIF, or AVIF up to 5 MB</small></label>}<label>Alt text<input required value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })} /></label><label>Caption<textarea rows="3" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} /></label><label className="checkbox-label"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published on public site</label>{error && <div className="form-alert error">{error}</div>}<div className="editor-actions"><button className="button" type="submit">{editing ? 'Save changes' : 'Upload image'} <Check size={15} /></button>{editing && <button className="under-link" type="button" onClick={() => { setEditing(null); setForm(empty); setFile(null); }}>Cancel</button>}</div></form><div className="dashboard-card admin-list-card"><div className="card-heading"><h3>Gallery library</h3><span>{items.length} items</span></div>{items.map((item) => <div className="admin-list-row" key={item.id}><div><b>{item.title}</b><small>{item.category} · {item.is_published ? 'Published' : 'Hidden'}</small></div><div><button className="table-action" onClick={() => { setEditing(item.id); setForm({ ...item, is_published: Boolean(item.is_published) }); }}>Edit</button><button className="table-action danger" onClick={() => remove(item.id)}>Delete</button></div></div>)}{!items.length && <EmptyState title="No gallery items" copy="Upload your first studio image." />}</div></div></section>;
}

function AdminOffers() {
  const empty = { code: '', discount_type: 'percentage', discount_value: '', min_order: '0', starts_at: '', expires_at: '', usage_limit: '', is_active: true };
  const [items, setItems] = useState([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  const load = () => API.get('/admin/offers').then((r) => setItems(r.data.data)).catch((e) => setError(e.response?.data?.error || 'Unable to load offers.'));
  useEffect(load, []);
  async function save(event) { event.preventDefault(); try { if (editing) await API.put(`/admin/offers/${editing}`, form); else await API.post('/admin/offers', form); setForm(empty); setEditing(null); load(); } catch (e) { setError(e.response?.data?.error || 'Unable to save offer.'); } }
  async function remove(id) { if (!window.confirm('Delete this offer?')) return; try { await API.delete(`/admin/offers/${id}`); load(); } catch (e) { setError(e.response?.data?.error || 'Unable to delete offer.'); } }
  return <section className="admin-page"><div className="admin-subpage-heading"><Tags /><div><Eyebrow>Administration</Eyebrow><h1>Offers & coupons</h1><p>Create and manage promotional codes for customers.</p></div></div><div className="admin-manager-grid"><form className="dashboard-card admin-editor" onSubmit={save}><div className="card-heading"><h3>{editing ? 'Edit offer' : 'Create offer'}</h3></div><label>Code<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></label><div className="form-row"><label>Type<select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label><label>Discount<input required type="number" min="0" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></label></div><label>Minimum order<input type="number" min="0" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} /></label><div className="form-row"><label>Starts<input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></label><label>Expires<input required type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></label></div><label>Usage limit<input type="number" min="1" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} /></label><label className="checkbox-label"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active offer</label>{error && <div className="form-alert error">{error}</div>}<div className="editor-actions"><button className="button" type="submit">{editing ? 'Save changes' : 'Create offer'} <Check size={15} /></button>{editing && <button className="under-link" type="button" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}</div></form><div className="dashboard-card admin-list-card"><div className="card-heading"><h3>Promotion codes</h3><span>{items.length} offers</span></div>{items.map((item) => <div className="admin-list-row" key={item.id}><div><b>{item.code}</b><small>{item.discount_type === 'percentage' ? `${item.discount_value}% off` : `₹${item.discount_value} off`} · {item.is_active ? 'Active' : 'Inactive'}</small></div><div><button className="table-action" onClick={() => { setEditing(item.id); setForm({ ...item, starts_at: item.starts_at?.slice(0, 16), expires_at: item.expires_at?.slice(0, 16), is_active: Boolean(item.is_active) }); }}>Edit</button><button className="table-action danger" onClick={() => remove(item.id)}>Delete</button></div></div>)}{!items.length && <EmptyState title="No offers yet" copy="Create a promotion code for your next campaign." />}</div></div></section>;
}

function AdminReports() {
  const [report, setReport] = useState(null);
  useEffect(() => { API.get('/admin/reports').then((r) => setReport(r.data.data)).catch(() => setReport(false)); }, []);
  return <section className="admin-page"><div className="admin-subpage-heading"><BarChart3 /><div><Eyebrow>Administration</Eyebrow><h1>Reports</h1><p>Live performance for the last 30 days.</p></div></div>{report ? <><div className="admin-stats"><Stat label="Bookings" value={report.summary.bookings} icon={<CalendarCheck />} /><Stat label="Completed" value={report.summary.completed} icon={<Check />} /><Stat label="Revenue" value={`₹${Number(report.summary.revenue).toLocaleString('en-IN')}`} icon={<BarChart3 />} /></div><div className="dashboard-card admin-table-card"><div className="card-heading"><h3>Popular services</h3></div>{report.topServices.map((item) => <div className="admin-list-row" key={item.name}><b>{item.name}</b><span className="admin-date">{item.bookings} bookings</span></div>)}{!report.topServices.length && <EmptyState title="No report data yet" copy="Completed bookings will appear here." />}</div></> : <div className="dashboard-card admin-placeholder"><p>Loading report data...</p></div>}</section>;
}

function AdminSettings() {
  const [items, setItems] = useState([]); const [values, setValues] = useState({}); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { API.get('/admin/settings').then((r) => { setItems(r.data.data); setValues(Object.fromEntries(r.data.data.map((item) => [item.setting_key, item.setting_value]))); }).catch((e) => setError(e.response?.data?.error || 'Unable to load settings.')); }, []);
  async function save(key) { try { await API.put(`/admin/settings/${key}`, { value: values[key] }); setMessage('Settings saved.'); setTimeout(() => setMessage(''), 2500); } catch (e) { setError(e.response?.data?.error || 'Unable to save setting.'); } }
  return <section className="admin-page"><div className="admin-subpage-heading"><Settings /><div><Eyebrow>Administration</Eyebrow><h1>Studio settings</h1><p>Update the public studio information stored in your database.</p></div></div><div className="dashboard-card admin-editor">{items.map((item) => <div className="setting-row" key={item.setting_key}><label>{item.setting_key.replace(/_/g, ' ')}<input value={values[item.setting_key] || ''} onChange={(e) => setValues({ ...values, [item.setting_key]: e.target.value })} /></label><button className="table-action" onClick={() => save(item.setting_key)}>Save</button></div>)}{!items.length && <EmptyState title="No settings configured" copy="Add settings rows in the database to manage them here." />}{message && <div className="form-alert success">{message}</div>}{error && <div className="form-alert error">{error}</div>}</div></section>;
}

function Offers() {
  usePageTitle('Offers');
  const [offers, setOffers] = useState([]);
  useEffect(() => { API.get('/offers').then((r) => setOffers(r.data.data)).catch(() => setOffers([])); }, []);
  return <section className="page-section narrow-page simple-page"><SectionTitle eyebrow="A little extra" title="Offers made for you" copy="Enjoy a little more of your Anu Glamora experience." /><div className="public-offers">{offers.map((offer) => <article className="offer-card" key={offer.code}><div><Eyebrow>Limited-time offer</Eyebrow><h3>{offer.discount_type === 'percentage' ? `${offer.discount_value}% off` : `₹${Number(offer.discount_value).toLocaleString('en-IN')} off`}</h3><p>Use code <strong>{offer.code}</strong>{Number(offer.min_order) > 0 ? ` on orders above ₹${Number(offer.min_order).toLocaleString('en-IN')}.` : ' on your next booking.'}</p><small>Valid until {new Date(offer.expires_at).toLocaleDateString('en-IN')}</small></div><Sparkles size={28} /></article>)}{!offers.length && <EmptyState title="No active offers right now" copy="New seasonal offers will appear here when they are available." />}</div></section>;
}

function AdminShell() {
  const [user, setUser] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const navigate = useNavigate();
  useEffect(() => { API.get('/auth/me').then((response) => { const current = response.data.data.user; if (current?.role !== 'admin') navigate('/admin/login', { replace: true }); else setUser(current); }).catch(() => navigate('/admin/login', { replace: true })); }, [navigate]);
  async function logout() { await API.post('/auth/logout'); navigate('/admin/login'); }
  if (!user) return <div className="admin-loading"><Sparkles /><span>Opening studio control room...</span></div>;
  const links = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/services', label: 'Services', icon: Sparkles },
    { to: '/admin/bookings', label: 'Appointments', icon: CalendarCheck },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/gallery', label: 'Gallery', icon: Award },
    { to: '/admin/offers', label: 'Offers', icon: Tags },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><Link to="/admin"><span className="brand-monogram">AG</span><span><b>Anu Glamora</b><small>Studio control room</small></span></Link></div><div className="admin-user"><span>{user.name.slice(0, 1)}</span><div><b>{user.name}</b><small>Administrator</small></div></div><nav className="admin-nav">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end}><Icon size={17} />{label}</NavLink>)}</nav><div className="admin-sidebar-bottom"><Link to="/"><ArrowRight size={15} />View public site</Link><button onClick={logout}><X size={15} />Sign out</button></div></aside><div className="admin-main"><header className="admin-topbar"><div><span className="admin-topbar-label">ANU GLAMORA / ADMIN</span><b>Studio control room</b></div><div className="admin-topbar-actions"><button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'night' : 'day'} mode`}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}</button><span className="admin-status"><i /> System ready</span></div></header><main className="admin-content-area"><Routes><Route index element={<Admin />} />  <Route path="services" element={<AdminServices />} /><Route path="bookings" element={<AdminBookings />} /><Route path="customers" element={<AdminCustomers />} /><Route path="gallery" element={<AdminGallery />} /><Route path="offers" element={<AdminOffers />} /><Route path="reports" element={<AdminReports />} /><Route path="settings" element={<AdminSettings />} /></Routes></main><footer className="admin-footer">Anu Glamora Studio Control Room <span>Private administrator workspace</span></footer></div></div>;
}

function SimpleContent({ title, eyebrow, copy, children }) { usePageTitle(title); return <section className="page-section narrow-page simple-page"><SectionTitle eyebrow={eyebrow || 'Anu Glamora'} title={title} copy={copy} />{children || <EmptyState title="This space is yours" copy="Studio content can be added here as your business grows." />}</section>; }
function FAQ() { const faqs = ['How far ahead should I book?', 'Can I book makeup and hair together?', 'Do you travel for bridal bookings?', 'What should I bring to my appointment?']; const [open, setOpen] = useState(0); return <SimpleContent title="Frequently asked questions" eyebrow="Good to know" copy="A few helpful answers before your visit. If you do not see your question here, send us a note."><div className="faq-list">{faqs.map((faq, index) => <div className={`faq-item ${open === index ? 'open' : ''}`} key={faq}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{faq}</span><ChevronDown size={18} /></button>{open === index && <p>We will confirm the details personally after your request. Every appointment is planned around your service, timing, and comfort.</p>}</div>)}</div></SimpleContent>; }
function EmptyState({ title, copy, action }) { return <div className="empty-state"><Sparkles size={22} /><h3>{title}</h3><p>{copy}</p>{action && <Button to={action.to}>{action.label}</Button>}</div>; }
function LoadingPage() { return <div className="page-section"><div className="empty-state"><Sparkles /><h3>Preparing your experience...</h3></div></div>; }

function PublicRoutes() {
  return <Routes>
    <Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/services" element={<Services />} /><Route path="/services/:id" element={<ServiceDetail />} />
    <Route path="/booking" element={<Booking />} /><Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth register />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/reset-password" element={<Auth reset />} /><Route path="/profile" element={<Profile />} /><Route path="/my-bookings" element={<Profile />} />
    <Route path="/gallery" element={<Gallery />} /><Route path="/virtual-makeover" element={<VirtualMakeover />} /><Route path="/contact" element={<Contact />} /><Route path="/offers" element={<Offers />} /><Route path="/faq" element={<FAQ />} />
    <Route path="/privacy" element={<SimpleContent title="Privacy policy" />} /><Route path="/terms" element={<SimpleContent title="Terms & conditions" />} /><Route path="*" element={<SimpleContent title="Page not found" copy="The page you are looking for has moved or does not exist." />} />
  </Routes>;
}

function App() {
  return <Routes><Route path="/admin/login" element={<Auth admin />} /><Route path="/admin/*" element={<AdminShell />} /><Route path="*" element={<Layout><PublicRoutes /></Layout>} /></Routes>;
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
