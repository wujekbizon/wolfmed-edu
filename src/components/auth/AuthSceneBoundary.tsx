'use client'

import { Component } from 'react'
import AuthCellIllustration from './AuthCellIllustration'
import type { AuthChildrenProps, AuthSceneBoundaryState } from '@/types/authTypes'

export default class AuthSceneBoundary extends Component<AuthChildrenProps, AuthSceneBoundaryState> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <AuthCellIllustration /> : this.props.children
  }
}
