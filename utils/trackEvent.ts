export function trackEvent(event: DataLayerEvent) {
  const g = globalThis as typeof globalThis & { dataLayer: DataLayerEvent[] };
  g.dataLayer = g.dataLayer || [];
  console.log("trackEvent", event);
  g.dataLayer.push(event);
}
