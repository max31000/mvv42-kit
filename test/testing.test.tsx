import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { notifications } from '@mantine/notifications';
import { Button } from '@mantine/core';
import { kitWrapper, renderWithKit, resetKitState, resetNotifications } from '../src/testing';
import { useMvv42Context } from '../src';

afterEach(() => {
  resetNotifications();
  resetKitState();
});

describe('@mvv42/kit/testing', () => {
  it('renderWithKit renders inside the provider (standalone, test env)', () => {
    renderWithKit(<Button>Go</Button>, { serviceId: 'bonds', accent: 'violet' });
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('mvv-button');
  });

  it('kitWrapper works with renderHook', () => {
    const { result } = renderHook(() => useMvv42Context(), { wrapper: kitWrapper({ serviceId: 'cashpulse', accent: 'blue' }) });
    expect(result.current).toEqual({ serviceId: 'cashpulse', insideShell: false, accent: 'blue' });
  });

  it('resetNotifications clears shown notifications', async () => {
    renderWithKit(<div />, { notifications: { position: 'bottom-left' } });
    act(() => {
      notifications.show({ message: 'Сохранено' });
    });
    expect(await screen.findByText('Сохранено')).toBeInTheDocument();
    act(() => resetNotifications());
    await waitFor(() => expect(screen.queryByText('Сохранено')).toBeNull());
  });

  it('Mvv42Provider passes notifications props through', async () => {
    renderWithKit(<div />, { notifications: { position: 'bottom-left' } });
    act(() => {
      notifications.show({ message: 'Позиция' });
    });
    const text = await screen.findByText('Позиция');
    expect(text.closest('[data-position]')).toHaveAttribute('data-position', 'bottom-left');
  });
});
