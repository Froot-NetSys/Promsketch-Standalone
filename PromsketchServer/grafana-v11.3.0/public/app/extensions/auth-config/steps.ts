import { SAMLStepKey } from '../types';

import SAMLStepAssertionMapping from './SAML/steps/AssertionMapping';
import SAMLStepConnectToIdP from './SAML/steps/ConnectToIdP';
import SAMLStepGeneral from './SAML/steps/General';
import SAMLStepKeyCert from './SAML/steps/KeyCert';
import SAMLStepSaveAndTest from './SAML/steps/SaveAndTest';

export const samlSteps = [
  { id: SAMLStepKey.General, name: 'General settings', component: SAMLStepGeneral },
  { id: SAMLStepKey.KeyCert, name: 'Sign requests', component: SAMLStepKeyCert },
  { id: SAMLStepKey.ConnectToIdP, name: 'Connect Grafana with Identity Provider', component: SAMLStepConnectToIdP },
  { id: SAMLStepKey.AssertionMapping, name: 'User mapping', component: SAMLStepAssertionMapping },
  { id: SAMLStepKey.SaveAndTest, name: 'Test and enable', component: SAMLStepSaveAndTest },
];
