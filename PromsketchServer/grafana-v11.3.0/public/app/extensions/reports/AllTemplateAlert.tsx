import {Alert} from "@grafana/ui";

export const AllTemplateAlert = () => (
  <Alert severity="warning" title="Not supported">
    The value All in template variables used in repeating rows or panels is not supported in PDF
  </Alert>
)
