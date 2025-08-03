import { SelectableValue } from '@grafana/data';
import { Field, Select } from '@grafana/ui';

type TSProps = {
  label: string;
  description: string;
  value: number;
  onChange: (s: number) => void;
};

export const timeIntervals: Array<SelectableValue<number>> = [
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '12 hours', value: 43200 },
  { label: '24 hours', value: 86400 },
  { label: '1 week', value: 604800 },
  { label: '1 month', value: 2592000 },
];

export const TimeSelect = ({ label, description, value, onChange }: TSProps) => {
  return (
    <div>
      <Field label={label} description={description} required={true}>
        <Select
          options={timeIntervals}
          onChange={(v: SelectableValue<number>) => {
            onChange(v.value!);
          }}
          value={value}
          aria-label={`${label}-select`}
          menuShouldPortal
        />
      </Field>
    </div>
  );
};
