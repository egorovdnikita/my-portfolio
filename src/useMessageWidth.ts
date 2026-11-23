import { useLayoutEffect } from 'react';

/** На телефоне убираем свободное место после самой длинной строки сообщения. */
export function useMessageWidth(caseId: string | null) {
  useLayoutEffect(() => {
    let disposed = false;
    const fit = () => {
      if (disposed) return;
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const messages = document.querySelectorAll<HTMLElement>(
        '.bubble:not(.bubble--job):not(.bubble--contrib):not(.bubble--links), .case-question, .case-answers li',
      );
      messages.forEach(message => {
        message.style.removeProperty('width');
        if (!mobile) return;
        const style = getComputedStyle(message);
        const left = message.getBoundingClientRect().left + parseFloat(style.paddingLeft);
        let right = left;
        const walker = document.createTreeWalker(message, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (!node.textContent?.trim() || node.parentElement?.closest('.reaction')) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) right = Math.max(right, rect.right);
        }
        message.querySelectorAll<HTMLElement>('img, .icon').forEach(image => {
          if (!image.closest('.reaction')) right = Math.max(right, image.getBoundingClientRect().right);
        });
        if (right > left) {
          message.style.width = `${Math.ceil(right - left + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight))}px`;
        }
      });
    };
    fit();
    void document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => {
      disposed = true;
      window.removeEventListener('resize', fit);
    };
  }, [caseId]);
}
