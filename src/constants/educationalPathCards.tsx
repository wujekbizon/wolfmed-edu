import { StaticImageData } from 'next/image';
import React from 'react';
import img1 from '@/images/caregiver.jpg'
import img2 from '@/images/nurse.jpg'
import img3 from '@/images/studio.jpg'
import NurseIcon from '@/components/icons/NurseIcon';
import { IconAttributes } from '@/types/iconTypes';

export interface CardProps {
    description: string
    title: string
    titleBtn: string
    imgSrc: string | StaticImageData
    text: string
    url: string
    className?: string
    icon: string
  }
  
  const CAREGIVER: CardProps = {
    title: 'Opiekun Medyczny',
    titleBtn: 'Design without limits',
    description:
      'Zdobądź kompleksową wiedzę i praktyczne umiejętności potrzebne do pracy jako opiekun medyczny. Korzystaj z setek testów, procedur krok po kroku oraz wsparcia aktywnej społeczności. Nasza ścieżka edukacyjna została stworzona z myślą zarówno o osobach, które dopiero rozpoczynają swoją karierę i przygotowują się do egzaminu zawodowego, jak i o tych, którzy już pracują w zawodzie i chcą pogłębić swoją wiedzę, utrwalić procedury lub odświeżyć materiał przed kolejnym etapem kariery.',
    imgSrc: img1,
    text: 'Dołącz do naszej społeczności już dziś.',
    url: '/',
    icon: 'caregiver'
  }
  
  const NURSE: CardProps = {
    title: 'Pielęgniarka / Pielęgniarz',
    titleBtn: 'Design without limits',
    description:
      'Nowa ścieżka edukacyjna dla przyszłych pielęgniarek i pielęgniarzy. Program opracowany z myślą o wymaganiach nowoczesnej opieki zdrowotnej – oferuje zaawansowane materiały dydaktyczne, przygotowanie do egzaminów zawodowych oraz praktyczne wsparcie w zakresie codziennej pracy klinicznej. Idealny dla osób rozpoczynających naukę w kierunku pielęgniarstwa, jak i tych, którzy chcą ugruntować swoją wiedzę i dobrze przygotować się do wyzwań pracy w placówkach medycznych.',
    imgSrc: img2,
    text: 'Zarejestruj się już dzis.',
    url: '/',
    icon: "nurse"
  }
  
  const INFO: CardProps = {
    title: 'Studio',
    titleBtn: 'See what’s inside our studio',
    description:
      'Wesa Huefiy is like Photoshop, for maps. We give designers control over everything from colors and fonts, to 3D features and camera angles, to the pitch of the map as a car enters a turn.',
    imgSrc: img3,
    text: 'know more about design',
    url: '/',
    icon: "info"
  }
 
  
  export {CAREGIVER, NURSE, INFO }
  