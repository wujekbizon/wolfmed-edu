import { notFound } from 'next/navigation';
import SimplePathLayout from '@/app/_components/SimplePathLayout';
import RichPathLayout from '@/app/_components/RichPathLayout';
import { careerPathsData } from '@/constants/careerPathsData';


export const dynamic = 'force-static'
export async function generateStaticParams() {
  return Object.keys(careerPathsData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const {slug} = await params
  const data = careerPathsData[slug];
  if (!data) return { title: 'Program nie znaleziony' };

  return {
    title: `${data.title} | Edukacja Medyczna`,
    description: data.description,
  };
}

export default async function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const {slug} = await params
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