function InfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="group flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-zinc-900 border border-white/15 group-hover:border-white/30 flex items-center justify-center transition-all duration-300">
                <div className="text-[#f58a8a] group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

export default function AboutCookies() {
    return (
        <div className="space-y-5">
            <div className="space-y-4">
                <InfoCard
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    title="Czym są pliki cookie?"
                    description="Pliki cookie to małe pliki tekstowe, które są umieszczane na Twoim komputerze przez odwiedzane strony internetowe. Pomagają stronom w sprawnej nawigacji i wykonywaniu określonych funkcji."
                />

                <InfoCard
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    }
                    title="Twoje prawa"
                    description="Pliki cookie, które są wymagane do prawidłowego działania strony, mogą być ustawiane bez Twojej zgody. Wszystkie inne pliki cookie muszą zostać zatwierdzone przed ich ustawieniem w przeglądarce."
                />

                <InfoCard
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                    title="Zarządzanie preferencjami"
                    description="Możesz zmieniać swoją zgodę na wykorzystanie plików cookie w dowolnym momencie na naszej stronie Polityka Prywatności."
                />

                <InfoCard
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                    title="Analityka i personalizacja"
                    description="Używamy również plików cookie do zbierania danych w celu personalizacji i mierzenia skuteczności naszych działań."
                />
            </div>

            <div className="rounded-xl bg-zinc-900 border-white/15 p-5">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-zinc-900 border border-white/15 hover:border-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#f58a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white mb-2">Więcej informacji</h3>
                        <p className="text-sm text-zinc-400 mb-3">
                            Więcej szczegółów znajdziesz w Polityce Prywatności Google.
                        </p>
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#f58a8a] hover:text-[#f9a7a7] transition-colors group"
                        >
                            Przejdź do polityki Google
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}