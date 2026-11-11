import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    FiLifeBuoy,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight
} from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/tickets');
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-[#F6F8F6] px-4 py-12 sm:px-6">
            {/* Soft decorative background glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-[#E3EDE8]/60 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Brand Header */}
                <header className="mb-8 text-center">
                    <Link
                        to="/"
                        aria-label="SupportFlow Home"
                        className="inline-flex items-center gap-3 transition-transform duration-200 hover:scale-105"
                    >
                        <span className="relative flex size-12 items-center justify-center rounded-2xl bg-[#6B9080] text-white shadow-[0_8px_20px_rgba(107,144,128,0.35)]">
                            <FiLifeBuoy aria-hidden="true" className="text-2xl" />
                            <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-[#E3EDE8]" />
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-[#2F3E46]">
                            Support<span className="text-[#6B9080]">Flow</span>
                        </span>
                    </Link>

                    <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#2F3E46] sm:text-3xl">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-[#5B6B65]">
                        Sign in to access your customer support desk.
                    </p>
                </header>

                {/* Main Card */}
                <section className="overflow-hidden rounded-2xl border border-[#E5E9E6] bg-white p-7 shadow-[0_12px_32px_rgba(47,62,70,0.06)] sm:p-9">
                    <div className="-mx-7 -mt-7 mb-7 h-1 bg-gradient-to-r from-[#6B9080] via-[#85A899] to-[#E3EDE8] sm:-mx-9 sm:-mt-9" />

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#2F3E46]"
                            >
                                Email address
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5B6B65]">
                                    <FiMail className="text-base" />
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="block w-full rounded-xl border border-[#E5E9E6] bg-[#F6F8F6]/60 py-3 pl-10 pr-3.5 text-sm text-[#2F3E46] transition placeholder:text-[#5B6B65]/50 focus:border-[#6B9080] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6B9080]/15"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#2F3E46]"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5B6B65]">
                                    <FiLock className="text-base" />
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="block w-full rounded-xl border border-[#E5E9E6] bg-[#F6F8F6]/60 py-3 pl-10 pr-11 text-sm text-[#2F3E46] transition placeholder:text-[#5B6B65]/50 focus:border-[#6B9080] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6B9080]/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5B6B65] transition hover:text-[#2F3E46]"
                                >
                                    {showPassword ? (
                                        <FiEyeOff className="text-base" />
                                    ) : (
                                        <FiEye className="text-base" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B9080] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(107,144,128,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#5A7D6E] hover:shadow-[0_8px_20px_rgba(90,125,110,0.35)] focus:outline-none focus:ring-4 focus:ring-[#6B9080]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        aria-hidden="true"
                                        className="size-4 animate-spin text-white"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="9"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <path
                                            className="opacity-80"
                                            fill="currentColor"
                                            d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3Z"
                                        />
                                    </svg>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <FiArrowRight className="text-base transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* Footer Switch */}
                <p className="mt-6 text-center text-sm text-[#5B6B65]">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-semibold text-[#6B9080] underline-offset-4 transition-colors hover:text-[#5A7D6E] hover:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default Login;
