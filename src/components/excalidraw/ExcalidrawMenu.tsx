import { MainMenu } from '@excalidraw/excalidraw'
import DarkModeIcon from '../icons/DarkModeIcon'
import LightModeIcon from '../icons/LightModeIcon'

interface ExcalidrawMenuProps {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

export default function ExcalidrawMenu({ theme, onThemeChange }: ExcalidrawMenuProps) {
  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      <MainMenu.DefaultItems.SaveAsImage />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.DefaultItems.Help />
      <MainMenu.Separator />
      <MainMenu.ItemCustom>
        {theme === 'light' ? (
          <div
            className="w-full h-8 flex items-center mt-0 p-0 gap-2"
            onClick={() => onThemeChange('dark')}
          >
            <DarkModeIcon color="black" width={16} height={16} />
            Dark mode
          </div>
        ) : (
          <div
            className="w-full h-8 flex items-center mt-0 p-0 gap-2 hover:bg-inherit"
            onClick={() => onThemeChange('light')}
          >
            <LightModeIcon color="white" width={16} height={16} />
            Light mode
          </div>
        )}
      </MainMenu.ItemCustom>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  )
}
