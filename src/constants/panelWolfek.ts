import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'

export const PANEL_WOLFEK_VERSION = 'panel-home-v1'
export const PANEL_WOLFEK_ONBOARDING_PREFIX = 'panel-wolfek:onboarding:'

export const PANEL_WOLFEK_TOPICS: Record<PanelWolfekTopic, {
  label: string
  criteria: string
}> = {
  first_steps: { label: 'Pierwsze kroki', criteria: 'Jak działa panel, od czego zacząć, pierwsze kroki i lista zadań onboardingowych.' },
  username: { label: 'Nazwa użytkownika', criteria: 'Jak zmienić lub sprawdzić nazwę użytkownika, nick, pseudonim.' },
  motto: { label: 'Motto', criteria: 'Jak zmienić lub sprawdzić własne motto nauki.' },
  courses: { label: 'Moje kursy', criteria: 'Jakie kursy posiadam, dostęp Basic/Premium, kontynuacja, zakup lub ulepszenie kursu.' },
  countdown: { label: 'Odliczanie', criteria: 'Co pokazuje licznik, data sesji egzaminacyjnej, ile czasu do egzaminu lub terminu planu.' },
  results: { label: 'Moje wyniki', criteria: 'Moje postępy, liczba pytań i prób testowych, wyniki, dokładność, wykres postępów.' },
  difficult_questions: { label: 'Problematyczne pytania', criteria: 'Które pytania sprawiają trudność, niska skuteczność, gdzie znaleźć błędne pytania.' },
  plan: { label: 'Plan nauki', criteria: 'Jak utworzyć plan nauki, co mam dziś zrobić, realizacja, tempo i zadania planu.' },
  billing: { label: 'Plan i płatności', criteria: 'Subskrypcja, anulowanie, dostęp na zawsze, płatności, status lub zaplanowana zmiana planu.' },
  storage: { label: 'Miejsce na dysku', criteria: 'Ile mam wolnego miejsca, limit dysku, wykorzystane miejsce, usuwanie plików.' },
  badges: { label: 'Odznaki', criteria: 'Zdobyte odznaki, jak je zdobyć, odznaki za wyzwania procedur.' },
  navigation: { label: 'Co oferuje platforma', criteria: 'Gdzie są testy, nauka, procedury, wykłady i inne sekcje aplikacji.' },
  forum: { label: 'Forum', criteria: 'Nowe posty, odpowiedzi, powiadomienia i dyskusje na forum.' },
  feedback: { label: 'Opinia', criteria: 'Gdzie wystawić ocenę, opinię lub przekazać informację zwrotną o aplikacji.' },
}

export const PANEL_WOLFEK_TOPIC_IDS = Object.keys(PANEL_WOLFEK_TOPICS) as PanelWolfekTopic[]

export const PANEL_WOLFEK_FEATURED_TOPICS: PanelWolfekTopic[] = [
  'first_steps', 'courses', 'results', 'billing', 'navigation',
]

export const PANEL_WOLFEK_MORE_TOPICS = PANEL_WOLFEK_TOPIC_IDS
  .filter((topic) => !PANEL_WOLFEK_FEATURED_TOPICS.includes(topic))

export const PANEL_WOLFEK_TARGETS: Record<PanelWolfekTopic, string> = {
  first_steps: 'panel-first-steps',
  username: 'panel-username-form',
  motto: 'panel-motto-form',
  courses: 'panel-courses',
  countdown: 'panel-countdown',
  results: 'panel-analytics',
  difficult_questions: 'panel-difficult-questions',
  plan: 'panel-countdown',
  billing: 'platnosci',
  storage: 'panel-storage',
  badges: 'panel-badges',
  navigation: 'panel-features',
  forum: 'panel-forum',
  feedback: 'panel-feedback',
}
