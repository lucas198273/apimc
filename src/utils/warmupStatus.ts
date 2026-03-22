// src/utils/warmupStatus.ts
let warmupComplete = false;

export function isWarmupComplete() {
  return warmupComplete;
}

export function setWarmupComplete(status: boolean) {
  warmupComplete = status;
}