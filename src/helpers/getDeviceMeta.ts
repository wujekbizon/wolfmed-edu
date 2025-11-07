"use client";

interface DeviceMeta {
  browser: {
    userAgent: string;
    language: string;
    cookiesEnabled: boolean;
    doNotTrack: string | null;
    platform: string;
    maxTouchPoints: number;
    deviceMemory?: number;
    hardwareConcurrency: number;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    orientation: string;
    scaling: number;
  };
  network: {
    type?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  system: {
    timezone: string;
    timestamp: number;
    standalone: boolean;
    online: boolean;
  };
  performance: {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
    navigation?: {
      type: number;
      redirectCount: number;
    };
  };
}

export default function getDeviceMeta(): DeviceMeta {
  const nav = navigator as any; // for experimental properties

  const meta: DeviceMeta = {
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: nav.deviceMemory,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      orientation: screen.orientation?.type || '',
      scaling: window.devicePixelRatio,
    },
    network: {},
    system: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now(),
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      online: navigator.onLine,
    },
    performance: {},
  };

  // Network information (if available)
  if ('connection' in nav) {
    const conn = nav.connection;
    meta.network = {
      type: conn?.effectiveType,
      downlink: conn?.downlink,
      rtt: conn?.rtt,
      saveData: conn?.saveData,
    };
  }

  // Performance data (if available)
  if (window.performance) {
    const perf = window.performance as any;
    if (perf && perf.memory) {
      meta.performance.memory = {
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        usedJSHeapSize: perf.memory.usedJSHeapSize,
      };
    }
    
    if (perf && perf.navigation) {
      meta.performance.navigation = {
        type: perf.navigation.type,
        redirectCount: perf.navigation.redirectCount,
      };
    }
  }

  return meta;
}
