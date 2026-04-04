import { useState, useEffect } from 'react';

/**
 * 渡されたテキストを1文字ずつ表示するカスタムフック
 */
export function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsFinished(false);
    if (!text) return;

    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setIsFinished(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isFinished };
}
