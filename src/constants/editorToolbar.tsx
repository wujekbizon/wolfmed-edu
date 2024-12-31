import BoldIcon from '@/components/icons/BoldIcon'
import HeadingFiveIcon from '@/components/icons/HeadingFiveIcon'
import HeadingOneIcon from '@/components/icons/HeadingOneIcon'
import HeadingThreeIcon from '@/components/icons/HeadingThreeIcon'
import ItalicIcon from '@/components/icons/ItalicIcon'
import RedoIcon from '@/components/icons/RedoIcon'
import StrikeIcon from '@/components/icons/StrikeIcon'
import UnderlineIcon from '@/components/icons/UnderlineIcon'
import UndoIcon from '@/components/icons/UndoIcon'

type ToolbarButton = {
  id: string
  title: string
  action: 'format' | 'heading' | 'command'
  value?: string
  command?: string
  Icon: React.ComponentType
}

export const TOOLBAR_BUTTONS = [
  {
    id: 'undo',
    title: 'Cofnij',
    action: 'command',
    command: 'UNDO_COMMAND',
    Icon: <UndoIcon color="#d6a9a9" width={20} height={20} />,
  },
  {
    id: 'redo',
    title: 'Ponów',
    action: 'command',
    command: 'REDO_COMMAND',
    Icon: <RedoIcon color="#d6a9a9" width={20} height={20} />,
  },
  { id: 'divider1', type: 'divider' },
  {
    id: 'h1',
    title: 'Nagłówek 1',
    action: 'heading',
    value: 'h1',
    Icon: <HeadingOneIcon color="#d6a9a9" width={20} height={20} />,
  },
  {
    id: 'h3',
    title: 'Nagłówek 3',
    action: 'heading',
    value: 'h3',
    Icon: <HeadingThreeIcon color="#d6a9a9" width={20} height={20} />,
  },
  {
    id: 'h5',
    title: 'Nagłówek 5',
    action: 'heading',
    value: 'h5',
    Icon: <HeadingFiveIcon color="#d6a9a9" width={20} height={20} />,
  },
  { id: 'divider2', type: 'divider' },
  {
    id: 'bold',
    title: 'Pogrubienie',
    action: 'format',
    value: 'bold',
    Icon: <BoldIcon color="#d6a9a9" width={20} height={20} />,
  },
  {
    id: 'italic',
    title: 'Kursywa',
    action: 'format',
    value: 'italic',
    Icon: <ItalicIcon color="#d6a9a9" width={20} height={20} />,
  },
  {
    id: 'underline',
    title: 'Podkreślenie',
    action: 'format',
    value: 'underline',
    Icon: <UnderlineIcon color="#d6a9a9" width={20} height={20} />,
  },
  {
    id: 'strikethrough',
    title: 'Przekreślenie',
    action: 'format',
    value: 'strikethrough',
    Icon: <StrikeIcon color="#d6a9a9" width={20} height={20} />,
  },
]
