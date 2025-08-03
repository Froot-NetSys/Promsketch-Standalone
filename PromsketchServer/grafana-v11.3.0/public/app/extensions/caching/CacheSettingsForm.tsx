import { Field, Switch, Input, Button, Stack, Tooltip, Icon, Label } from '@grafana/ui';
import { contextSrv } from 'app/core/core';

import { AccessControlAction } from '../types';

import { CacheSettingsDisable } from './CacheSettingsDisable';
import { Props } from './DataSourceCache';

interface CacheSettingsProps {
  loading: boolean;
  setUseDefaultTTL: (useDefaultTTL: boolean) => void;
  setTtlQueriesMs: (ttl: number) => void;
  setTtlResourcesMs: (ttl: number) => void;
}

export const CacheSettingsForm = (props: Props & CacheSettingsProps) => {
  const {
    updateDataSourceCache,
    pageId,
    useDefaultTTL,
    setUseDefaultTTL,
    defaultTTLMs,
    ttlQueriesMs,
    setTtlQueriesMs,
    ttlResourcesMs,
    setTtlResourcesMs,
    loading,
    enabled,
    dataSource,
    dataSourceID,
    dataSourceUID,
  } = props;
  const canWriteCache = contextSrv.hasPermissionInMetadata(AccessControlAction.DataSourcesCachingWrite, dataSource);

  return (
    <Stack direction={'column'} alignItems={'flex-start'}>
      <Field
        description={`Enable this to use the default TTL set in Grafana's configuration (${defaultTTLMs} ms)`}
        label="Use default TTL"
        disabled={loading || !canWriteCache}
      >
        <Switch
          value={useDefaultTTL}
          onChange={() => {
            setUseDefaultTTL(!useDefaultTTL);
          }}
        />
      </Field>
      <Field
        description="The time-to-live for a query cache item in milliseconds. Example: 5000"
        label="Query TTL"
        disabled={loading || useDefaultTTL || !canWriteCache}
      >
        <Input
          type="number"
          className="max-width-10"
          placeholder="1000"
          min={0}
          value={(useDefaultTTL ? defaultTTLMs : ttlQueriesMs) || 0}
          onChange={(el) => {
            setTtlQueriesMs(el.currentTarget.valueAsNumber);
          }}
        />
      </Field>
      <Field
        description="The time-to-live for resources cache items in milliseconds. Example: 5000"
        label={
          <Label>
            <span>Resource TTL</span>
            <Tooltip
              content={
                <div>
                  Resources are dynamic values that Grafana data source plugins retrieve from data sources for use in
                  the query editor. Examples are Splunk namespaces, Prometheus labels, and CloudWatch metric names.
                  Since these values update less frequently, you might prefer a longer cache TTL for Resources than
                  queries. See the <a href="https://grafana.com/docs/grafana/latest/enterprise/query-caching/">docs</a>{' '}
                  for more info.
                </div>
              }
            >
              <Icon name="question-circle" />
            </Tooltip>
          </Label>
        }
        disabled={loading || useDefaultTTL || !canWriteCache}
      >
        <Input
          type="number"
          className="max-width-10"
          placeholder="1000"
          min={0}
          value={(useDefaultTTL ? defaultTTLMs : ttlResourcesMs) || 0}
          onChange={(el) => {
            setTtlResourcesMs(el.currentTarget.valueAsNumber);
          }}
        />
      </Field>
      <Stack gap={2} alignItems="flex-start" justifyContent="flex-start">
        <CacheSettingsDisable {...props} />
        <Button
          disabled={loading || !canWriteCache}
          onClick={() =>
            updateDataSourceCache(pageId, {
              dataSourceID,
              dataSourceUID,
              enabled,
              defaultTTLMs,
              ttlQueriesMs,
              ttlResourcesMs,
              useDefaultTTL,
            })
          }
        >
          Save
        </Button>
      </Stack>
    </Stack>
  );
};
