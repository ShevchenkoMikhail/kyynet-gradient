import { useCallback } from 'react'
import { copyToClipboard } from '../utils/clipboard'
import { toastBus, fireFromRect } from '../components/feedback/bus'
import { counterService } from '../utils/counterService'
import { useT } from '../i18n'

export function useCopyFeedback() {
  const { t } = useT()

  return useCallback(
    async (text: string, sourceEl?: HTMLElement | null) => {
      const ok = await copyToClipboard(text)
      if (ok) {
        toastBus.push(t('output.copied'), 'success')
        if (sourceEl) {
          fireFromRect(sourceEl.getBoundingClientRect())
        }
        // Global-usage metric — fire and forget
        void counterService.hit('copies')
      } else {
        toastBus.push(t('output.copyFailed'), 'error')
      }
      return ok
    },
    [t],
  )
}
