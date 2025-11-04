import { NodeSdk } from "@effect/opentelemetry";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Layer } from "effect";

// If we deploy on Vercel, we can leverage their OpenTelemetry integration.
// Therefore, we don't set up our own OpenTelemetry SDK in that case.
const isOnVercel = Boolean(process.env.VERCEL);

// OpenTelemetry layer used across the app (traces + metrics)
export const nodeOtelLayer = isOnVercel
  ? Layer.empty
  : NodeSdk.layer(() => {
      const serviceName = process.env.OTEL_SERVICE_NAME ?? "scratchbook";
      const metricsEndpoint =
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ??
        "http://localhost:4318/v1/metrics";
      const exportInterval = Number(
        process.env.OTEL_METRICS_EXPORT_INTERVAL ?? 60000
      );

      return {
        resource: { serviceName },
        spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
        // Export app metrics via OTLP to your collector/agent
        metricReader: new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({ url: metricsEndpoint }),
          exportIntervalMillis: exportInterval,
        }),
      };
    });
