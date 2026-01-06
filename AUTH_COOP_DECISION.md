# Engineering Decision Record: OAuth COOP Policy & Browser Warnings

**Status:** Accepted  
**Date:** 2026-01-07  
**Context:** Firebase Google Authentication (Popup Flow)  
**Applies to:** Chrome, Edge, Safari, Firefox

## 1. Problem Summary
During the Google Sign-In flow, the browser console emits the following warning:
`Cross-Origin-Opener-Policy policy would block the window.close call`

## 2. Root Cause Analysis
This is **NOT** a bug in our application code. It is a result of browser security isolation standards:
1. Our application sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` to secure the main window while permitting popup references.
2. The Google Auth popup operates on `accounts.google.com` (Cross-Origin).
3. When the auth flow completes, the popup script calls `window.close()`.
4. The browser detects that a cross-origin window is attempting to modify window state that *might* be restricted under strict COOP, and logs a warning.
5. **Crucially:** The authentication token is exchanged *before* this closure attempt, meaning functionality is unaffected.

## 3. Chosen Solution
**Maintain `signInWithPopup` with `same-origin-allow-popups`.**

### Justification:
* **UX:** Popup flow prevents full page reloads, preserving application state (e.g., Music Player, Form Data).
* **Security:** `same-origin-allow-popups` provides significant protection against XS-Leaks and Specter-style attacks compared to `unsafe-none`.
* **Functionality:** The warning is benign. The auth flow succeeds 100% of the time.

## 4. Rejected Alternatives

### A. Weakening Security Headers
* **Option:** Set COOP to `unsafe-none`.
* **Result:** Eliminates warning.
* **Verdict:** **REJECTED.** Reduces security posture of the entire application. We do not compromise security to silence a console log.

### B. Switching to Redirect Flow (`signInWithRedirect`)
* **Option:** Use `signInWithRedirect(auth, provider)`.
* **Result:** Eliminates warning completely (no popup involved).
* **Verdict:** **DEFERRED.** While this solves the console warning, it triggers a full page reload, killing the background music player and React state. Migration is not worth the UX cost solely to remove a log.

## 5. Conclusion
**No further action required.** The warning is a known browser artifact.