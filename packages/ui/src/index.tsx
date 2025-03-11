export * from './components/Button'
export * from './components/Card'
export { config as default } from './tamagui.config'

import { TamaguiProvider as TamaguiProviderOG } from 'tamagui'
import { config } from './tamagui.config'

export const TamaguiProvider = ({ children, ...props }: any) => {
  return (
    <TamaguiProviderOG config={config} {...props}>
      {children}
    </TamaguiProviderOG>
  )
} 