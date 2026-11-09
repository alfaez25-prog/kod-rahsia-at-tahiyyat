import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { guardScreen } from '../App.tsx';
import { newProgress } from '../lib/storage.ts';

async function openRegister() {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: /MULA PENGEMBARAAN/i }));
  return screen.findByTestId('btn-start');
}

describe('Skrin pendaftaran (UI)', () => {
  it('butang MULA MISI disabled apabila nama kosong', async () => {
    const btn = await openRegister();
    expect(btn).toBeDisabled();
    await userEvent.type(screen.getByTestId('input-class'), '4 Bestari');
    expect(btn).toBeDisabled();
    await userEvent.type(screen.getByTestId('input-name'), '   ');
    expect(btn).toBeDisabled();
  });
  it('butang MULA MISI disabled apabila kelas kosong', async () => {
    const btn = await openRegister();
    await userEvent.type(screen.getByTestId('input-name'), 'Nur Aisyah binti Ahmad');
    expect(btn).toBeDisabled();
  });
  it('memaparkan mesej validasi mesra & membolehkan mula apabila sah', async () => {
    const btn = await openRegister();
    const name = screen.getByTestId('input-name');
    await userEvent.click(name);
    await userEvent.tab();
    expect(await screen.findByText(/Sila tulis nama penuh/i)).toBeInTheDocument();
    await userEvent.type(name, 'Nur Aisyah binti Ahmad');
    await userEvent.type(screen.getByTestId('input-class'), '4 Bestari');
    expect(btn).toBeEnabled();
    await userEvent.click(btn);
    expect(await screen.findByText(/Panduan Penjelajah/i)).toBeInTheDocument();
    expect(screen.getByTestId('hud-name')).toHaveTextContent('Nur Aisyah binti Ahmad');
    expect(JSON.parse(localStorage.getItem('krat:session')!).className).toBe('4 Bestari');
  });
});

describe('Kawalan laluan skrin', () => {
  const p = newProgress('s', 'k');
  it('sijil/keputusan/susunan tidak boleh diakses sebelum tamat', () => {
    expect(guardScreen({ name: 'results' }, true, p).name).toBe('map');
    expect(guardScreen({ name: 'order' }, true, p).name).toBe('map');
    expect(guardScreen({ name: 'lafaz', unitId: 3 }, true, p).name).toBe('map');
    expect(guardScreen({ name: 'map' }, false, null).name).toBe('register');
  });
});
