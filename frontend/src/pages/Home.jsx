import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const MISSION_ITEMS = [
    {
        icon: '🌱',
        title: 'Empower Communities',
        desc: 'We provide sustainable support to underserved communities through education, health, and livelihood programs.',
    },
    {
        icon: '🤝',
        title: 'Build Connections',
        desc: 'Volunteers and beneficiaries come together to create lasting bonds of trust and mutual growth.',
    },
    {
        icon: '💡',
        title: 'Drive Change',
        desc: 'Data-driven initiatives ensure every rupee and every volunteer hour creates measurable social impact.',
    },
];

const STATS = [
    { label: 'Volunteers', value: 1240, suffix: '+' },
    { label: 'Events Hosted', value: 320, suffix: '+' },
    { label: 'Volunteer Hours', value: 48000, suffix: '+' },
    { label: 'Lives Touched', value: 25000, suffix: '+' },
];

const GALLERY_COLORS = [
    'from-emerald-400 to-teal-600',
    'from-violet-400 to-purple-600',
    'from-amber-400 to-orange-600',
    'from-sky-400 to-blue-600',
    'from-rose-400 to-pink-600',
    'from-lime-400 to-green-600',
];

const GALLERY_LABELS = [
    'Tree Plantation Drive', 'Health Camp', 'Education Workshop',
    'Food Distribution', 'Coastal Cleanup', 'Sports Day',
];

const DONATION_TIERS = [
    { amount: '₹500', label: 'Supporter', perks: 'Certificate of appreciation + Newsletter' },
    { amount: '₹2,000', label: 'Contributor', perks: 'Everything above + Name on website' },
    { amount: '₹5,000', label: 'Champion', perks: 'Everything above + Special shoutout at events' },
];

// ---------------------------------------------------------------------------
// AnimatedCounter component
// ---------------------------------------------------------------------------
function AnimatedCounter({ value, suffix }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const step = Math.ceil(value / 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= value) { setCount(value); clearInterval(timer); }
            else setCount(start);
        }, 24);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>{count.toLocaleString('en-IN')}{suffix}</span>
    );
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <span className={`font-black text-2xl tracking-tight ${scrolled ? 'text-emerald-700' : 'text-white'}`}>
                    🌿 HopeNGO
                </span>
                <div className="hidden md:flex items-center gap-8">
                    {['Mission', 'Events', 'Impact', 'Gallery', 'Donate'].map(link => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            className={`text-sm font-semibold hover:text-emerald-400 transition-colors ${scrolled ? 'text-gray-700' : 'text-white/90'}`}
                        >
                            {link}
                        </a>
                    ))}
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/login"
                        className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-white transition-all"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow"
                    >
                        Join Us
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// ---------------------------------------------------------------------------
// Main HomePage
// ---------------------------------------------------------------------------
export default function Home() {
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [statsVisible, setStatsVisible] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/events?upcoming=true&limit=3`)
            .then(r => r.json())
            .then(d => setEvents(d.events || []))
            .catch(() => setEvents([]))
            .finally(() => setEventsLoading(false));
    }, []);

    // Trigger counter animation only when stats section enters viewport
    useEffect(() => {
        const el = document.getElementById('impact');
        if (!el) return;
        const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="font-sans antialiased overflow-x-hidden">
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section
                id="hero"
                className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #10b981 100%)' }}
            >
                {/* Decorative blobs */}
                <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }} />
                <div className="absolute bottom-[-60px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a7f3d0, transparent)' }} />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-8 animate-pulse">
                        🌍 Making a Difference — One Volunteer at a Time
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                        Transform Lives.<br />
                        <span className="text-emerald-300">Be the Change.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                        Join thousands of passionate volunteers building healthier, happier communities across India.
                        Every hour you give creates ripples that last a lifetime.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-full text-lg shadow-2xl hover:shadow-emerald-400/40 transform hover:-translate-y-1 transition-all duration-200"
                        >
                            Volunteer Now →
                        </Link>
                        <a
                            href="#events"
                            className="px-8 py-4 border-2 border-white/50 hover:border-white text-white font-bold rounded-full text-lg backdrop-blur hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-200"
                        >
                            View Events
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs flex flex-col items-center gap-1">
                    <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
                    Scroll to explore
                </div>
            </section>

            {/* ── MISSION ──────────────────────────────────────────────── */}
            <section id="mission" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-emerald-600 font-semibold uppercase tracking-widest text-sm">Our Purpose</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2">Why We Exist</h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                            Driven by compassion and guided by data, we bridge the gap between those who want to help and communities that need it most.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {MISSION_ITEMS.map((item) => (
                            <div
                                key={item.title}
                                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                            >
                                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── UPCOMING EVENTS ──────────────────────────────────────── */}
            <section id="events" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-emerald-600 font-semibold uppercase tracking-widest text-sm">What's Happening</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2">Upcoming Events</h2>
                    </div>

                    {eventsLoading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">No upcoming events right now. Check back soon!</div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/login" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">
                            View all events & register →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── IMPACT STATS ─────────────────────────────────────────── */}
            <section
                id="impact"
                className="py-24 text-white"
                style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)' }}
            >
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <span className="text-emerald-300 font-semibold uppercase tracking-widest text-sm">By The Numbers</span>
                    <h2 className="text-4xl md:text-5xl font-black mt-2 mb-16">Our Collective Impact</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/10 hover:bg-white/15 transition-all">
                                <div className="text-4xl md:text-5xl font-black text-emerald-300 mb-2">
                                    {statsVisible ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : '0'}
                                </div>
                                <div className="text-white/70 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── GALLERY ──────────────────────────────────────────────── */}
            <section id="gallery" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-emerald-600 font-semibold uppercase tracking-widest text-sm">Memories</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2">Our Gallery</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {GALLERY_COLORS.map((gradient, i) => (
                            <div
                                key={i}
                                className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${gradient} aspect-[4/3] flex items-end p-5 cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg`}
                            >
                                <div className="absolute inset-0 bg-black/20" />
                                <span className="relative z-10 text-white font-bold text-sm drop-shadow">{GALLERY_LABELS[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── JOIN CTA ─────────────────────────────────────────────── */}
            <section id="join" className="py-24 bg-emerald-600 text-white text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-6xl mb-6">🙌</div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Make a Difference?</h2>
                    <p className="text-emerald-100 text-lg mb-10">
                        It costs nothing but your time. Join our growing community of change-makers today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-full text-lg hover:bg-emerald-50 transform hover:-translate-y-1 shadow-xl transition-all"
                        >
                            Register as Volunteer
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 border-2 border-white text-white font-bold rounded-full text-lg hover:bg-white/10 transition-all"
                        >
                            Already a member? Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── DONATION (UI only) ───────────────────────────────────── */}
            <section id="donate" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-emerald-600 font-semibold uppercase tracking-widest text-sm">Support Us</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2">Make a Donation</h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                            Your contribution funds grassroots programs that create real, lasting change. Every amount counts.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {DONATION_TIERS.map((tier, i) => (
                            <div
                                key={tier.label}
                                className={`rounded-3xl p-8 border-2 transition-all hover:-translate-y-2 duration-300 ${i === 1 ? 'border-emerald-500 bg-emerald-50 shadow-xl' : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-lg'}`}
                            >
                                {i === 1 && (
                                    <div className="text-xs font-bold text-emerald-600 bg-emerald-100 rounded-full px-3 py-1 inline-block mb-4">Most Popular</div>
                                )}
                                <div className="text-4xl font-black text-gray-900 mb-1">{tier.amount}</div>
                                <div className="text-lg font-bold text-emerald-700 mb-4">{tier.label}</div>
                                <p className="text-gray-500 text-sm mb-6">{tier.perks}</p>
                                <button
                                    disabled
                                    title="Payment integration coming soon"
                                    className={`w-full py-3 rounded-full font-bold text-sm transition-all cursor-not-allowed opacity-70 ${i === 1 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Donate {tier.amount} (Coming Soon)
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────── */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="text-2xl font-black text-emerald-400 mb-2">🌿 HopeNGO</div>
                    <p className="text-gray-400 text-sm mb-6">Making a Difference — One Volunteer at a Time</p>
                    <div className="flex justify-center gap-6 text-sm text-gray-400 mb-8">
                        <Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
                        <Link to="/register" className="hover:text-emerald-400 transition-colors">Register</Link>
                        <a href="#mission" className="hover:text-emerald-400 transition-colors">Mission</a>
                        <a href="#donate" className="hover:text-emerald-400 transition-colors">Donate</a>
                    </div>
                    <p className="text-gray-600 text-xs">© {new Date().getFullYear()} HopeNGO. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

// ---------------------------------------------------------------------------
// EventCard sub-component
// ---------------------------------------------------------------------------
function EventCard({ event }) {
    const isFull = event.is_full;
    const dateStr = event.event_date
        ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    const typeColors = {
        education: 'bg-blue-100 text-blue-700',
        health: 'bg-rose-100 text-rose-700',
        environment: 'bg-emerald-100 text-emerald-700',
        community: 'bg-amber-100 text-amber-700',
    };
    const typeClass = typeColors[event.event_type?.toLowerCase()] || 'bg-gray-100 text-gray-700';

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Poster / gradient header */}
            {event.poster_url ? (
                <img src={event.poster_url} alt={event.title} className="w-full h-44 object-cover" />
            ) : (
                <div className="w-full h-44 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-5xl">
                    📅
                </div>
            )}

            <div className="p-6">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {event.event_type && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeClass}`}>
                            {event.event_type}
                        </span>
                    )}
                    {isFull && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600">
                            Event Full
                        </span>
                    )}
                    {event.recurring_type === 'weekly' && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                            Weekly
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{event.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <span>📅 {dateStr}</span>
                    {event.venue && <span className="truncate">• 📍 {event.venue}</span>}
                </div>

                {event.duration_hours && (
                    <div className="text-xs text-gray-400 mb-4">⏱ {event.duration_hours} hour(s)</div>
                )}

                <Link
                    to="/login"
                    className={`block w-full py-3 rounded-full font-bold text-sm text-center transition-all ${isFull
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg'
                        }`}
                    aria-disabled={isFull}
                >
                    {isFull ? 'Event Full' : 'Register Now →'}
                </Link>
            </div>
        </div>
    );
}
