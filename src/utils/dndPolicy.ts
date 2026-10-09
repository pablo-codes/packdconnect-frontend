export interface DNDCheckResult {
  shouldRing: boolean;
  bypassed: boolean;
}

export function evaluateDNDPolicy(callerId: string, callHistoryMap: Map<string, number[]>): DNDCheckResult {
  const dndEnabled = localStorage.getItem('packdconnect_settings_dnd') === 'true';
  const allowRepeat = localStorage.getItem('packdconnect_settings_dnd_repeat') === 'true';

  if (!dndEnabled) {
    return { shouldRing: true, bypassed: false };
  }

  const now = Date.now();
  const callerHistory = callHistoryMap.get(callerId) || [];
  const threeMinutes = 3 * 60 * 1000;
  const recentCalls = callerHistory.filter((t) => now - t <= threeMinutes);

  if (allowRepeat && recentCalls.length > 0) {
    return { shouldRing: true, bypassed: true };
  }

  return { shouldRing: false, bypassed: false };
}
