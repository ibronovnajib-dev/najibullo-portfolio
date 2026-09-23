interface Window {
  doNotTrack?: string;
  gtag?: (...args: any[]) => void;
  dataLayer?: any[];
  PORTFOLIO_METRICS?: Readonly<Record<string, number>>;
  PORTFOLIO_CONFIG?: any;
  PortfolioI18n?: any;
  trackPortfolioEvent?: (name: string, detail?: Record<string, unknown>) => void;
}
