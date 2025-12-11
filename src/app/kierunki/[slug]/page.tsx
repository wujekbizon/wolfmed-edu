import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SimplePathLayout from '@/app/_components/SimplePathLayout';
import RichPathLayout from '@/app/_components/RichPathLayout';
import { careerPathsData } from '@/constants/careerPathsData';


export const metadata = {
    title: 'Kierunki Edukacji Medycznej | Wolfmed',
    description: 'Programy edukacyjne dla kierunków medycznych',
}

async function PathContent(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const data = careerPathsData[slug];
  if (!data) notFound();

  switch (data.templateType) {
    case 'simple':
      return <SimplePathLayout {...data} />;
    case 'rich':
      return <RichPathLayout {...data} />;
    default:
      return notFound();
  }
}

export default function PathPage(props: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Ładowanie...</div>}>
      <PathContent params={props.params} />
    </Suspense>
  )
}