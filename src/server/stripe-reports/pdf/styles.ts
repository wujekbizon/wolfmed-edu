import { StyleSheet } from '@react-pdf/renderer'

export const reportPdfStyles = StyleSheet.create({
  page: { paddingTop: 119, paddingBottom: 42, paddingHorizontal: 26, fontFamily: 'ReportNoto', fontSize: 8, color: '#18181b' },
  heading: { position: 'absolute', top: 22, left: 26, right: 26 },
  title: { textAlign: 'center', fontSize: 19, fontWeight: 700, marginBottom: 10 },
  period: { fontSize: 11, fontWeight: 700 },
  note: { fontSize: 7, color: '#52525b', marginTop: 5 },
  header: { position: 'absolute', top: 94, left: 26, right: 26, flexDirection: 'row', backgroundColor: '#e8edf5', fontWeight: 700 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#a1a1aa', paddingVertical: 5 },
  cell: { paddingHorizontal: 4, paddingVertical: 4, fontSize: 7 },
  link: { color: '#1d4ed8', textDecoration: 'underline', marginBottom: 2 },
  summary: { marginTop: 12, fontSize: 10 },
  footer: { position: 'absolute', bottom: 16, left: 26, right: 26, fontSize: 7, color: '#52525b', textAlign: 'right' },
})

export const reportPdfColumns = [
  { title: 'Lp.', width: 22 },
  { title: 'Kwota brutto', width: 66 },
  { title: 'Wpływ', width: 88 },
  { title: 'Metoda / status', width: 76 },
  { title: 'E-mail', width: 112 },
  { title: 'Klient', width: 98 },
  { title: 'Adres / NIP', width: 180 },
  { title: 'Faktura', width: 147 },
]
