import React, { useState, useRef, useEffect } from 'react';

interface GuessInputProps {
  onSubmit: (guess: string) => Promise<void>;
  disabled: boolean;
  isAnimating: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onSubmit, disabled, isAnimating }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || isAnimating) return;

    // Save exactly what we are submitting to a local variable
    const guessToSubmit = value.trim();
    
    // Crucially: Clear the input text INSTANTLY before the async operation begins
    setValue('');

    await onSubmit(guessToSubmit);
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
        className={isAnimating ? 'locked-input' : ''}
      />
      <div className="form-actions">
        <button type="button" className="btn-skip" onClick={() => onSubmit('')} disabled={disabled || isAnimating}>
          Skip
        </button>
        <button type="submit" className="btn-submit" disabled={disabled || isAnimating || !value.trim()}>
          Submit
        </button>
      </div>
    </form>
  );
};
