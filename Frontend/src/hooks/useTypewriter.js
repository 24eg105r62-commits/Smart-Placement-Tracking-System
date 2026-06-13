import { useEffect, useState } from 'react';

const TYPE_SPEED = 70;
const DELETE_SPEED = 35;
const PAUSE_AFTER_TYPE = 1600;
const PAUSE_AFTER_DELETE = 300;

export const useTypewriter = (phrases) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length];

    if (!isDeleting && text === current) {
      const timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && text === '') {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, PAUSE_AFTER_DELETE);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(
      () => setText(current.slice(0, text.length + (isDeleting ? -1 : 1))),
      isDeleting ? DELETE_SPEED : TYPE_SPEED
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases]);

  return text;
};
