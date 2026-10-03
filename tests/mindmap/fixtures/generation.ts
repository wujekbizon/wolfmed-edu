export function mapResponse() {
  return {
    status: 'map',
    topicType: 'physiology',
    nodes: [
      { label: 'Krew', parentIndex: null as number | null, notes: 'Skład i funkcje krwi.', tags: ['krew'], category: 'physiology' },
      { label: 'Osocze', parentIndex: 0, notes: 'Płynna część krwi.', tags: ['osocze'], category: 'physiology' },
      { label: 'Erytrocyty', parentIndex: 0, notes: 'Transportują tlen.', tags: ['erytrocyty'], category: 'physiology' },
      { label: 'Leukocyty', parentIndex: 0, notes: 'Uczestniczą w odporności.', tags: ['leukocyty'], category: 'physiology' },
    ],
  }
}

export const NO_SOURCE = JSON.stringify({ status: 'no_source', topicType: null, nodes: [] })
