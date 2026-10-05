import { WOLFEK_MAX_REVEAL, WOLFEK_WORD_FADE, WOLFEK_WORD_INTERVAL } from '@/constants/wolfekSpeech'

export function getWolfekSpeechTiming(text: string) {
  const gaps = Math.max(0, (text.match(/\S+/g)?.length ?? 0) - 1)
  const interval = Math.min(WOLFEK_WORD_INTERVAL, WOLFEK_MAX_REVEAL / Math.max(1, gaps))
  return { interval, duration: Math.max(.65, gaps * interval + WOLFEK_WORD_FADE) }
}
