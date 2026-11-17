import { StyleSheet } from '@react-pdf/renderer'

export const essayPdfStyles = StyleSheet.create({
  page: { fontFamily: 'EssayNoto', fontSize: 11, lineHeight: 1.6, paddingTop: 48, paddingBottom: 54, paddingHorizontal: 48, color: '#27272a' },
  paragraph: { marginBottom: 10 },
  heading: { fontWeight: 700, fontSize: 14, marginTop: 14, marginBottom: 8 },
  title: { fontWeight: 700, fontSize: 19, marginBottom: 18 },
  quote: { paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: '#a1a1aa', marginVertical: 10 },
  list: { paddingLeft: 14, marginBottom: 10 },
  listItem: { flexDirection: 'row', marginBottom: 5 },
  marker: { width: 20 },
  itemContent: { flex: 1 },
  footer: { position: 'absolute', bottom: 25, left: 48, right: 48, fontSize: 9, color: '#71717a', textAlign: 'center' },
  source: { fontSize: 9, marginBottom: 5 },
})
