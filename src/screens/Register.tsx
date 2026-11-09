import { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useGame } from '../state/GameContext.tsx';
import { Button, Screen } from '../components/UI.tsx';
import { Avatar, AVATARS } from '../components/Avatar.tsx';
import { Divider } from '../components/Decor.tsx';
import { NAME_MAX, isRegistrationValid, validateRegistration } from '../lib/storage.ts';

export function Register() {
  const { go, register, settings, session } = useGame();
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [touched, setTouched] = useState({ name: false, className: false });
  const errors = validateRegistration(name, className);
  const valid = isRegistrationValid(name, className);

  const submit = () => {
    setTouched({ name: true, className: true });
    if (!valid) return;
    register({ name, className, avatar });
    go({ name: 'tutorial' });
  };

  return (
    <Screen className="max-w-2xl pt-6">
      <button type="button" onClick={() => go({ name: 'landing' })} className="mb-4 inline-flex items-center gap-1 text-sm text-gold-300 hover:underline">
        <ArrowLeft size={16} /> Kembali
      </button>
      <form
        className="parchment ornate-frame rounded-3xl p-6 sm:p-9"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
        aria-labelledby="reg-title"
      >
        <p className="text-center text-xs font-extrabold uppercase tracking-[0.3em] text-emerald-700">Daftar Penjelajah</p>
        <h1 id="reg-title" className="mt-1 text-center font-display text-2xl font-extrabold text-brown-900 sm:text-3xl">
          Siapakah Penjaga Manuskrip?
        </h1>
        <Divider className="mt-2 text-gold-600" />

        {session && (
          <p className="mt-4 rounded-lg bg-gold-300/40 p-3 text-sm text-brown-900 ring-1 ring-gold-600/40" role="note">
            Mendaftar akan memulakan <strong>sesi baharu</strong>. Kemajuan {session.name} pada peranti ini akan ditutup supaya keputusan murid tidak bercampur.
          </p>
        )}

        <label className="mt-6 block">
          <span className="text-sm font-extrabold text-brown-900">Nama penuh murid <span className="text-red-700">*</span></span>
          <input
            value={name}
            maxLength={NAME_MAX + 10}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            autoComplete="name"
            placeholder="Contoh: Nur Aisyah binti Ahmad"
            aria-invalid={touched.name && !!errors.name}
            aria-describedby="name-err"
            data-testid="input-name"
            className="mt-1 w-full rounded-xl border-2 border-gold-600/50 bg-ivory-50 px-4 py-3 text-lg text-brown-900 outline-none placeholder:text-brown-700/40 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-600/20"
          />
          <span id="name-err" role="alert" className="mt-1 block min-h-5 text-sm font-bold text-red-700">
            {touched.name && errors.name}
          </span>
        </label>

        <label className="mt-2 block">
          <span className="text-sm font-extrabold text-brown-900">Kelas <span className="text-red-700">*</span></span>
          {settings.classes.length ? (
            <select
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                setTouched((t) => ({ ...t, className: true }));
              }}
              data-testid="input-class"
              aria-invalid={touched.className && !!errors.className}
              aria-describedby="class-err"
              className="mt-1 w-full rounded-xl border-2 border-gold-600/50 bg-ivory-50 px-4 py-3 text-lg text-brown-900 outline-none focus:border-emerald-700"
            >
              <option value="">— Pilih kelas —</option>
              {settings.classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={className}
              maxLength={30}
              onChange={(e) => setClassName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, className: true }))}
              placeholder="Contoh: 4 Bestari"
              data-testid="input-class"
              aria-invalid={touched.className && !!errors.className}
              aria-describedby="class-err"
              className="mt-1 w-full rounded-xl border-2 border-gold-600/50 bg-ivory-50 px-4 py-3 text-lg text-brown-900 outline-none placeholder:text-brown-700/40 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-600/20"
            />
          )}
          <span id="class-err" role="alert" className="mt-1 block min-h-5 text-sm font-bold text-red-700">
            {touched.className && errors.className}
          </span>
        </label>

        <fieldset className="mt-3">
          <legend className="text-sm font-extrabold text-brown-900">Pilih avatar anda</legend>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:gap-4">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAvatar(a.id)}
                aria-pressed={avatar === a.id}
                aria-label={a.label}
                className={`flex justify-center rounded-2xl p-1 transition sm:p-2 ${avatar === a.id ? 'scale-105 bg-emerald-800 ring-4 ring-gold-400' : 'bg-brown-800/10 hover:bg-brown-800/20'}`}
              >
                <Avatar id={a.id} size={68} />
              </button>
            ))}
          </div>
        </fieldset>

        <Button type="submit" disabled={!valid} className="mt-7 w-full text-lg" data-testid="btn-start">
          {valid ? <Sparkles size={20} /> : <Lock size={18} />} MULA MISI
        </Button>
        {!valid && <p className="mt-2 text-center text-xs text-brown-700">Isi nama penuh dan kelas untuk membuka butang MULA MISI.</p>}

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-brown-700">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
          Nama dan kelas disimpan dalam pelayar peranti ini sahaja (localStorage) dan tidak dihantar ke mana-mana pelayan.
        </p>
      </form>
    </Screen>
  );
}
