# PromSketch Server – Setup and Testing Guide

This repository contains the implementation of **PromSketch**, a sketch-based time series processing server, along with supporting tools for **data ingestion**, **PromQL query testing**, **visualization**, and **performance benchmarking**.

---

## Components

### Main Server
- **Path:** `PromsketchServer/main.go`  
- Handles ingestion, sketch storage, and PromQL query execution.  
- **Runs on:** `localhost:7000` by default.

### Custom Ingester
- **Path:** `ExporterStarter/custom_ingester_noDB_test3_dynamic.py`  
- Forwards raw data into the PromSketch server through dynamically created multiport ingestion endpoints.

### Export Manager
- **Path:** `ExporterStarter/ExportManager.py`  
- Generates synthetic time series data for ingestion tests.

### Prometheus-Sketches
- **Path:** `PromsketchServer/prometheus/`  
- A modified Prometheus build integrated with PromSketch.

### PromTools
- **Path:** `promtools.go` (or `promtools.py`)  
- Issues PromQL queries to the PromSketch server at fixed intervals (default: every 15 seconds).

### Streamlit Demos
- **Path:** `PromsketchServer/demo/`  
- Interactive dashboards (`demo.py`, `demo_history.py`) for live and historical query visualization.

---

## Setup and Testing Steps

### 1. Activate Python Environment

From the repo root:
```bash
source .venv/bin/activate
```

---

### 2. Start the Fake Exporter

```bash
cd ExporterStarter/

python3 ExportManager.py \
  --config=num_samples_config.yml \
  --targets=8 \
  --timeseries=10000 \
  --max_windowsize=100000 \
  --querytype=entropy \
  --waiteval=60
```

---

### 3. Launch the PromSketch Server

```bash
cd PromsketchServer/

MAX_INGEST_GOROUTINES=50 go run .
```
- `MAX_INGEST_GOROUTINES` controls ingestion concurrency.

To use default settings:
```bash
go run .
```

---

### 4. Start the Custom Ingester

```bash
cd ExporterStarter/
python3 custom_ingester_noDB_test3_dynamic.py --config=num_samples_config.yml
```

---

### 5. Start Prometheus-Sketches

```bash
cd PromsketchServer/prometheus/
./prometheus --config.file=documentation/examples/prometheus.yml
```
> ⚠️ **Ensure `prometheus.yml` matches the configuration rewritten by the server.**

---

### 6. Run the Streamlit Demos

```bash
cd PromsketchServer/demo

streamlit run demo.py
streamlit run demo_history.py
```
- `demo.py` → Displays live query results.
- `demo_history.py` → Persists results in a database and reloads them on restart.

---

### 7. (Optional) Run PromTools

If implemented in Go:
```bash
go run promtools.go
```
If implemented in Python:
```bash
python3 promtools.py
```

---

## Example PromQL Queries

```
avg_over_time(fake_machine_metric{machineid="machine_0"}[10000s])
quantile_over_time(0.5, fake_machine_metric{machineid="machine_0"}[10000s])
quantile_over_time(0.9, fake_machine_metric{machineid="machine_0"}[10000s])
entropy_over_time(fake_machine_metric{machineid="machine_0"}[10000s])
count_over_time(fake_machine_metric{machineid="machine_0"}[10000s])
```

---

## Notes

- Configuration files and command-line arguments may need adjustment for your specific use case.
- Ensure all dependencies are installed for Python, Go, and Streamlit.
- For further details, see the documentation within each component’s directory or source file.

---