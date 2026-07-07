// One place for the localStorage keys and the reset that wipes them.

export const SAVE_KEY = 'harborview.save.v1'
export const BOOTED_KEY = 'harborview.booted.v1'

/** Wipe all saved progress so the next load starts from a cold boot. */
export function resetAll() {
  try {
    localStorage.removeItem(SAVE_KEY)
    localStorage.removeItem(BOOTED_KEY)
  } catch {
    /* storage may be unavailable */
  }
}
