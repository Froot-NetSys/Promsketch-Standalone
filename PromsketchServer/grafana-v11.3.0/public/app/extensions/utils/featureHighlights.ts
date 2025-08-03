export enum ExperimentGroup {
  Test = 'test',
  Control = 'control',
}

export const buildExperimentID = (feature?: string) => {
  return 'feature-highlights' + (feature ? `-${feature}` : '');
};
