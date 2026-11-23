import { router, type Href } from 'expo-router';

/** Переход с очисткой истории (после входа/выхода кнопка «назад» не нужна). */
export function resetTo(href: Href) {
  try {
    if (router.canDismiss()) router.dismissAll();
  } catch {}
  router.replace(href);
}
