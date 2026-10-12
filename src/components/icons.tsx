import type { SVGProps } from 'react';

/** Minimal inline icons (Tabler-style, 24×24 grid, stroke) so the kit carries no icon dependency. */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  size?: number;
  stroke?: number;
}

function make(name: string, paths: string[]) {
  function Icon({ size = 18, stroke = 1.75, ...rest }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

export const IconSun = make('IconSun', [
  'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
  'M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7',
]);
export const IconMoon = make('IconMoon', ['M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z']);
export const IconDeviceDesktop = make('IconDeviceDesktop', [
  'M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z',
  'M7 20h10',
  'M9 16v4',
  'M15 16v4',
]);
export const IconLogout = make('IconLogout', [
  'M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2',
  'M9 12h12l-3 -3',
  'M18 15l3 -3',
]);
export const IconLock = make('IconLock', [
  'M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z',
  'M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0',
  'M8 11v-4a4 4 0 1 1 8 0v4',
]);
export const IconAlertTriangle = make('IconAlertTriangle', [
  'M12 9v4',
  'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z',
  'M12 16h.01',
]);
export const IconRefresh = make('IconRefresh', [
  'M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4',
  'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4',
]);
export const IconInbox = make('IconInbox', [
  'M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
  'M4 13h3l3 3h4l3 -3h3',
]);
export const IconArrowUpRight = make('IconArrowUpRight', ['M17 7l-10 10', 'M8 7l9 0l0 9']);
export const IconArrowDownRight = make('IconArrowDownRight', ['M7 7l10 10', 'M17 8l0 9l-9 0']);
export const IconMinus = make('IconMinus', ['M5 12l14 0']);
export const IconBan = make('IconBan', ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M5.7 5.7l12.6 12.6']);
export const IconBrandTelegram = make('IconBrandTelegram', ['M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4']);
export const IconChevronDown = make('IconChevronDown', ['M6 9l6 6l6 -6']);
export const IconDots = make('IconDots', [
  'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
]);
