import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiUser,
    FiLogOut,
    FiLifeBuoy,
    FiGrid
} from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (user?.role === 'admin') return '/admin/dashboard';
        if (user?.role === 'agent') return '/agent/dashboard';
        return '/tickets';
    };

    const isDashboardActive = location.pathname === getDashboardLink();

    const roleLabel = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : '';

    return (
        <nav className="sticky top-0 z-40 border-b border-[#E5E9E6] bg-white/90 shadow-[0_4px_20px_rgba(47,62,70,0.06)] backdrop-blur-md">
            <div className="h-1 w-full bg-[#6B9080]" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-3">
                    <Link
                        to={getDashboardLink()}
                        aria-label="SupportFlow home"
                        className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                    >
                        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6B9080] text-white shadow-[0_6px_16px_rgba(107,144,128,0.35)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-[#5A7D6E]">
                            <FiLifeBuoy aria-hidden="true" className="text-xl" />
                            <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-[#E3EDE8]" />
                        </span>
                        <span className="flex min-w-0 flex-col leading-tight">
                            <span className="truncate text-lg font-bold tracking-tight text-[#2F3E46]">
                                Support<span className="text-[#6B9080]">Flow</span>
                            </span>
                            <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[#5B6B65] sm:block">
                                Customer Desk
                            </span>
                        </span>
                    </Link>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                        <Link
                            to={getDashboardLink()}
                            aria-current={isDashboardActive ? 'page' : undefined}
                            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2 ${isDashboardActive
                                ? 'bg-[#6B9080] text-white shadow-[0_6px_14px_rgba(107,144,128,0.3)] hover:bg-[#5A7D6E]'
                                : 'bg-[#E3EDE8] text-[#2F3E46] hover:-translate-y-0.5 hover:bg-[#6B9080] hover:text-white'
                                }`}
                        >
                            <FiGrid aria-hidden="true" className="text-base" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>

                        <div className="flex items-center gap-2 rounded-full border border-[#E5E9E6] bg-[#F6F8F6] p-1 pr-1 sm:gap-3 sm:pl-1">
                            <div className="flex min-w-0 items-center gap-2.5" title={user?.name}>
                                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6B9080] text-sm font-bold text-white ring-2 ring-white">
                                    {user?.name
                                        ? user.name.charAt(0).toUpperCase()
                                        : <FiUser aria-hidden="true" className="text-sm" />}
                                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#E3EDE8]" />
                                </span>
                                <span className="hidden min-w-0 flex-col leading-tight md:flex">
                                    <span className="max-w-36 truncate text-sm font-semibold capitalize text-[#2F3E46]">
                                        {user?.name}
                                    </span>
                                    {roleLabel && (
                                        <span className="text-xs font-medium text-[#6B9080]">
                                            {roleLabel}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                title="Logout"
                                aria-label="Logout"
                                className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-3 text-sm font-semibold text-[#5B6B65] shadow-sm transition-all duration-200 hover:bg-[#2F3E46] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B9080] focus-visible:ring-offset-2"
                            >
                                <FiLogOut aria-hidden="true" className="text-base" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
