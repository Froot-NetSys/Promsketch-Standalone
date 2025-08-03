import {
  BRAZILIAN_PORTUGUESE,
  CHINESE_SIMPLIFIED,
  ENGLISH_US,
  FRENCH_FRANCE,
  GERMAN_GERMANY,
  PSEUDO_LOCALE,
  SPANISH_SPAIN,
  LocaleFileLoader,
} from 'app/core/internationalization/constants';

export const ENTERPRISE_I18N_NAMESPACE = 'grafana-enterprise';

export const LOCALE_EXTENSIONS: Record<string, LocaleFileLoader | undefined> = {
  [ENGLISH_US]: () => import('./en-US/grafana-enterprise.json'),
  [FRENCH_FRANCE]: () => import('./fr-FR/grafana-enterprise.json'),
  [SPANISH_SPAIN]: () => import('./es-ES/grafana-enterprise.json'),
  [GERMAN_GERMANY]: () => import('./de-DE/grafana-enterprise.json'),
  [CHINESE_SIMPLIFIED]: () => import('./zh-Hans/grafana-enterprise.json'),
  [BRAZILIAN_PORTUGUESE]: () => import('./pt-BR/grafana-enterprise.json'),
};

if (process.env.NODE_ENV === 'development') {
  LOCALE_EXTENSIONS[PSEUDO_LOCALE] = () => import('./pseudo-LOCALE/grafana-enterprise.json');
}
