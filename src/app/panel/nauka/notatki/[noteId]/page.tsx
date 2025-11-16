import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getNoteById } from '@/server/queries'
import StudyViewer from '@/components/StudyViewer'
import { formatDate } from '@/helpers/formatDate'
import Link from 'next/link'
import { ChevronLeft, Calendar, Clock, Tag, FolderOpen, BookOpen } from 'lucide-react'

type Props = {
    params: Promise<{
        noteId: string
    }>
}

export default async function NotePage({ params }: Props) {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const { noteId } = await params
    const note = await getNoteById(userId, noteId)
    
    if (!note) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fadeInUp opacity-0">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-rose-50 to-fuchsia-100/40 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <BookOpen className="w-10 h-10 text-[#ff9898]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
                        Notatka nie została znaleziona
                    </h2>
                    <p className="text-zinc-600 mb-8 leading-relaxed">
                        Ta notatka nie istnieje lub nie masz do niej dostępu
                    </p>
                    <Link
                        href="/panel/nauka"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Powrót do notatek
                    </Link>
                </div>
            </div>
        )
    }

    const tags = Array.isArray(note.tags) ? note.tags : []

    return (
        <section className="relative min-h-screen p-3 sm:p-6 md:p-8 overflow-hidden bg-linear-to-br from-rose-50/30 via-white/60 to-fuchsia-100/40">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-linear-to-br from-[#ff9898]/5 to-[#ffc5c5]/5 rounded-full blur-3xl animate-[radialPulse_60s_ease-in-out_infinite]"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-linear-to-tr from-fuchsia-100/10 to-rose-50/10 rounded-full blur-3xl animate-radialPulse" style={{ '--slidein-delay': '2s' } as React.CSSProperties}></div>
            </div>

            <div className="relative max-w-4xl mx-auto">
              
                <Link
                    href="/panel/nauka"
                    className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#ff9898] transition-all duration-200 mb-6 text-sm group animate-fadeInUp opacity-0"
                    style={{ '--slidein-delay': '0.2s' } as React.CSSProperties}
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Powrót do listy notatek
                </Link>

                {/* Metadata Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-xl overflow-hidden animate-[scaleIn_0.5s_ease-out_forwards] opacity-0 hover:shadow-2xl transition-shadow duration-300 mb-6" style={{ '--slidein-delay': '0.3s' } as React.CSSProperties}>
                    <div className="p-6 sm:p-8 bg-linear-to-br from-white/60 to-rose-50/20">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 flex-1 leading-tight">
                                {note.title}
                            </h1>
                            {note.pinned && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-amber-50 to-amber-100/50 text-amber-700 border border-amber-200/60 rounded-full text-xs font-semibold shadow-sm">
                                    <span className="text-base">📌</span>
                                    Przypięta
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#ff9898]/10 to-[#ffc5c5]/10 flex items-center justify-center">
                                <FolderOpen className="w-4 h-4 text-[#ff9898]" />
                            </div>
                            <span className="inline-flex items-center px-4 py-2 bg-linear-to-r from-[#ff9898]/10 to-[#ffc5c5]/10 text-[#ff9898] border border-[#ff9898]/20 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow duration-200">
                                {note.category}
                            </span>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex items-start gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100/80 flex items-center justify-center shrink-0">
                                    <Tag className="w-4 h-4 text-zinc-600" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium border border-zinc-200/60 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                                        >
                                            {String(tag)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                            <div className="flex items-center gap-2 group">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100/80 flex items-center justify-center group-hover:bg-zinc-200/80 transition-colors duration-200">
                                    <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <span>Utworzono: <span className="font-medium text-zinc-700">{formatDate(note.createdAt)}</span></span>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100/80 flex items-center justify-center group-hover:bg-zinc-200/80 transition-colors duration-200">
                                    <Clock className="w-3.5 h-3.5" />
                                </div>
                                <span>Zaktualizowano: <span className="font-medium text-zinc-700">{formatDate(note.updatedAt)}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Study Content */}
                <StudyViewer
                    content={note.content}
                    plainTextFallback={note.plainText}
                />
                <div className="h-8"></div>
            </div>
        </section>
    )
}
