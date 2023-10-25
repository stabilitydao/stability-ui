import { atom } from 'nanostores'
import type { PublicClient } from 'wagmi'
import type { PlatformData, UserBalance } from '../types'

export const account = atom<string|undefined>()
export const network = atom<string|undefined>()
export const publicClient = atom<PublicClient|undefined>()
export const platformData = atom<PlatformData|undefined>()
export const userBalance = atom<UserBalance|undefined>()
export const lastTx = atom<string|undefined>()
