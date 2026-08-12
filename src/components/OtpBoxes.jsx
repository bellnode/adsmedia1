import { useRef, useEffect } from 'react';

/** 6-box OTP input matching mobile app mockup */
export default function OtpBoxes({ value = '', onChange, length = 6 }) {
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const setAt = (idx, char) => {
    const arr = digits.map(d => (d === ' ' ? '' : d));
    arr[idx] = char;
    onChange(arr.join('').replace(/\s/g, '').slice(0, length));
  };

  const onKey = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx]?.trim() && idx > 0) {
      refs.current[idx - 1]?.focus();
      setAt(idx - 1, '');
    }
  };

  const onInput = (idx, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    setAt(idx, v);
    if (v && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="otp-boxes" onPaste={onPaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-box ${digits[i]?.trim() ? 'filled' : ''}`}
          value={digits[i]?.trim() || ''}
          onChange={e => onInput(i, e)}
          onKeyDown={e => onKey(i, e)}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
