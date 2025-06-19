📁 Folder Structure
EvaluationTools/
Contains utilities to run evaluation tests, store results in CSV format, and includes Jupyter notebooks for plotting and analysis.

ExporterStarter/
Contains tools to generate synthetic metrics data using multiple fake exporters.

Uses ExportManager.py to edit Prometheus-style configurations and launch fake exporters.

🚀 How to Run the Evaluation
Follow these steps to get the full evaluation environment running:

1. Start Your Fake Exporters
Navigate to the ExporterStarter/ directory and run the following command:

bash
Copy
Edit
python3 ExportManager.py --config=num_samples_config.yml --targets=10 --timeseries=10 --max_windowsize=100 --querytype=quantile --waiteval=30
This will launch 10 fake exporters (using fake_norm_exporter.py) starting from port 8000 and set them up to generate synthetic time series data.

The configuration parameters:

--targets: Number of fake exporters to run

--timeseries: Number of time series per exporter

--max_windowsize: Maximum sliding window size

--querytype: Type of sketch query to simulate (e.g., quantile)

--waiteval: Delay before the evaluation starts

2. Launch the PromSketch Go Server
Move into the PromsketchServer/ directory and start the Go-based ingestion and query server:

bash
Copy
Edit
go run .
Optional: You can specify the number of initialized time series with:

bash
Copy
Edit
NUM_TIMESERIES_INIT=1000 go run .
This Go server will expose endpoints for receiving ingested metrics and processing queries.

3. Start the Custom Data Ingester
Return to the ExporterStarter/ directory and run the custom data ingester to scrape and forward metrics from the fake exporters to the Go server:

bash
Copy
Edit
python3 custom_ingester_noDB.py --config=num_samples_config.yml
This component continuously scrapes metrics from the fake exporters and sends them to the PromSketch server for processing and benchmarking.
