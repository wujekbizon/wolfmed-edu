import type { ComponentProps, ReactNode } from 'react'
import type { SignIn } from '@clerk/nextjs'
import type { LatheGeometry, Mesh, MeshPhysicalMaterial } from 'three'

export type AuthMode = 'sign-in' | 'sign-up'
export type AuthPageProps = { mode: AuthMode }
export type AuthSceneBoundaryState = { failed: boolean }
export type AuthAppearance = NonNullable<ComponentProps<typeof SignIn>['appearance']>
export type AuthChildrenProps = { children: ReactNode }
export type AuthSceneProps = { paused: boolean }
export type AuthCell = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: string
  phase: number
}

export type AuthCellMesh = Mesh<LatheGeometry, MeshPhysicalMaterial>
