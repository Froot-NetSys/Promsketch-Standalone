import { JSX } from 'react';
import { useForm } from "react-hook-form";
import { connect, ConnectedProps } from 'react-redux';

import { Button, Drawer, Input, Field, HorizontalGroup } from '@grafana/ui';

import { KeyCertFormData } from "../../../types";

interface OwnProps {
  onClose: () => void;
  onGenerateCert: (data: KeyCertFormData) => void;
}

export type Props = OwnProps & ConnectedProps<typeof connector>;

const connector = connect(undefined, {});

export const KeyCertDrawerUnconnected = ({
                                        onClose,
                                        onGenerateCert,
                                      }: Props): JSX.Element => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      validityDays: 365,
      organization: '',
      country: '',
      state: '',
      city: '',
    },
  });

  const validateCountryCode = (value?: string) => {
    return !value || (value.length>=2 && value.length<=3) ? true : 'Country code must have a length of 2 or 3 characters.';
  };

  const validateValidityDays = (value?: number) => {
    if (value === undefined || isNaN(Number(value)) || value < 1 || value > 10000) {
      return 'Validity days must be a positive integer between 1 and 10000.';
    }
    return true;
  }

  const onSubmit = (data: KeyCertFormData) => {
    onGenerateCert(data);
  }

  return (
    <Drawer title="SAML key and certificate" subtitle={"The following data will be included in the generated certificate"} size="md" onClose={onClose}>
      <form onSubmit={e => {
        e.stopPropagation();
        return handleSubmit(onSubmit)(e);
      }}>
        <Field label="Your organization" htmlFor="organization">
          <Input
            {...register('organization')}
            width={48}
            id="organization"
          />
        </Field>
        <Field
          label="Country code"
          invalid={!!errors.country}
          error={errors.country?.message}
          htmlFor="country"
        >
          <Input
            {...register('country', { validate: validateCountryCode })}
            width={48}
            id="country"
          />
        </Field>
        <Field label="State" htmlFor="state">
          <Input
            {...register('state')}
            width={48}
            id="state"
          />
        </Field>
        <Field label="City" htmlFor="city">
          <Input
            {...register('city')}
            width={48}
            id="city"
          />
        </Field>
        <Field
          label="Validity days"
          description="Number of days the generated certificate is valid for."
          invalid={!!errors.validityDays}
          error={errors.validityDays?.message}
          htmlFor="validityDays"
        >
          <Input
            {...register('validityDays', { validate: validateValidityDays })}
            width={48}
            id="validityDays"
          />
        </Field>
        <HorizontalGroup>
          <Button
            type="submit"
            size="md"
            variant="primary"
            tooltip="Generate the certificate and private key"
          >
            Generate
          </Button>
          <Button
            type="button"
            size="md"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </HorizontalGroup>
      </form>
    </Drawer>
  );
};

export default connector(KeyCertDrawerUnconnected);
