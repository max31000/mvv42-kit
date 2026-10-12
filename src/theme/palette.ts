import type { MantineColorsTuple } from '@mantine/core';

/**
 * Accent tuples. Index 6 of each coloured accent equals the tile colour of the service in the shell
 * registry (blue #228be6 — cashpulse, green #40c057 — credit_calc, violet #7048e8 — bonds), so a service
 * reads as the same object on the launcher and inside.
 */
export const MVV42_ACCENTS = ['zinc', 'blue', 'green', 'violet', 'teal', 'orange', 'red'] as const;
export type Mvv42Accent = (typeof MVV42_ACCENTS)[number];

/** Neutral zinc scale — the shell accent and the kit's `gray`. */
export const zinc: MantineColorsTuple = [
  '#fafafa',
  '#f4f4f5',
  '#e4e4e7',
  '#d4d4d8',
  '#a1a1aa',
  '#71717a',
  '#52525b',
  '#3f3f46',
  '#27272a',
  '#18181b',
];

/** Dark surfaces aligned with the tokens (#0b0b0c bg, #161618 surface, #1d1d20 surface-2). */
export const dark: MantineColorsTuple = [
  '#e4e4e7',
  '#a1a1aa',
  '#8b8b94',
  '#5f5f68',
  '#2e2e33',
  '#26262a',
  '#1d1d20',
  '#161618',
  '#0f0f10',
  '#0b0b0c',
];

export const blue: MantineColorsTuple = [
  '#e7f5ff',
  '#d0ebff',
  '#a5d8ff',
  '#74c0fc',
  '#4dabf7',
  '#339af0',
  '#228be6',
  '#1c7ed6',
  '#1971c2',
  '#1864ab',
];

export const green: MantineColorsTuple = [
  '#ebfbee',
  '#d3f9d8',
  '#b2f2bb',
  '#8ce99a',
  '#69db7c',
  '#51cf66',
  '#40c057',
  '#37b24d',
  '#2f9e44',
  '#2b8a3e',
];

export const violet: MantineColorsTuple = [
  '#f3f0ff',
  '#e5dbff',
  '#d0bfff',
  '#b197fc',
  '#9775fa',
  '#845ef7',
  '#7048e8',
  '#6741d9',
  '#5f3dc4',
  '#4c2fa6',
];

export const teal: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#20c997',
  '#12b886',
  '#0ca678',
  '#099268',
  '#087f5b',
];

export const orange: MantineColorsTuple = [
  '#fff4e6',
  '#ffe8cc',
  '#ffd8a8',
  '#ffc078',
  '#ffa94d',
  '#ff922b',
  '#fd7e14',
  '#f76707',
  '#e8590c',
  '#d9480f',
];

export const red: MantineColorsTuple = [
  '#fff5f5',
  '#ffe3e3',
  '#ffc9c9',
  '#ffa8a8',
  '#ff8787',
  '#ff6b6b',
  '#fa5252',
  '#f03e3e',
  '#e03131',
  '#c92a2a',
];

export const accentTuples: Record<Mvv42Accent, MantineColorsTuple> = {
  zinc,
  blue,
  green,
  violet,
  teal,
  orange,
  red,
};

export function isMvv42Accent(value: unknown): value is Mvv42Accent {
  return typeof value === 'string' && (MVV42_ACCENTS as readonly string[]).includes(value);
}
