export type AssetRole = 'frame' | 'btn' | 'btn-pressed'

export type AssetSource = {
  readonly icn: string
  readonly index: number
  readonly slice?: number
}

export const ASSETS: Record<AssetRole, { readonly good: AssetSource; readonly evil: AssetSource }> =
  {
    frame: {
      good: { icn: 'SURDRBKG.ICN', index: 0, slice: 26 },
      evil: { icn: 'SURDRBKE.ICN', index: 0, slice: 26 },
    },
    btn: {
      good: { icn: 'SYSTEM.ICN', index: 11 },
      evil: { icn: 'SYSTEME.ICN', index: 11 },
    },
    'btn-pressed': {
      good: { icn: 'SYSTEM.ICN', index: 12 },
      evil: { icn: 'SYSTEME.ICN', index: 12 },
    },
  }

export const ASSET_THEMES = ['good', 'evil'] as const
