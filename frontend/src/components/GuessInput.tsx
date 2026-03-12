import React, { useState, useRef, useEffect } from 'react';

interface GuessInputProps {
  onSubmit: (guess: string) => Promise<void>;
  disabled: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onSubmit, disabled }) => {
  const [value, setValue] = useState('');
  const isAnimating = false;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;

    await onSubmit(value.trim());
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="guess-form">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ENTER GUESS"
        disabled={disabled}
        className={isAnimating ? 'animate-shake' : ''}
      />
      <div className="form-actions">
        <button type="button" className="btn-skip" onClick={() => onSubmit('')} disabled={disabled}>
          Skip
        </button>
        <button type="submit" className="btn-submit" disabled={disabled || !value.trim()}>
          Submit
        </button>
      </div>
    </form>
  );
};
