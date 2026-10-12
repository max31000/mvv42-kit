import type { ReactNode } from 'react';
import { ActionIcon, Popover, type PopoverProps } from '@mantine/core';

export interface HelpHintProps {
  /** Explanation shown in the popover. */
  children: ReactNode;
  /** Accessible name of the «?» button. Default «Пояснение». */
  label?: string;
  /** Popover width. Default 300. */
  width?: number;
  position?: PopoverProps['position'];
  'data-testid'?: string;
}

/** Small «?» button with a popover explanation — next to Metric labels, Section/Chart titles, table headers. */
export function HelpHint({ children, label = 'Пояснение', width = 300, position = 'bottom-start', ...rest }: HelpHintProps) {
  return (
    <Popover width={width} position={position} withArrow>
      <Popover.Target>
        <ActionIcon variant="subtle" color="gray" size="xs" radius="xl" aria-label={label} data-testid={rest['data-testid']} className="mvv-help-hint">
          <span className="mvv-chart-help" aria-hidden="true">
            ?
          </span>
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="mvv-chart-explanation">{children}</div>
      </Popover.Dropdown>
    </Popover>
  );
}
