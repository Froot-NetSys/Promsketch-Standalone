import asyncio
import os
import sys
import time
from collections import defaultdict
from io import StringIO
from urllib.parse import urlparse

import aiohttp
import yaml
from prometheus_client.parser import text_fd_to_metric_families

def _parse_port_blocklist(raw: str) -> set[int]:
    """Parse comma-separated port numbers into a skip list for multi-port ingest."""
    ports: set[int] = set()
    for token in raw.split(","):
        token = token.strip()
        if not token:
            continue
        try:
            ports.add(int(token))
        except ValueError:
            print(f"[WARN] Ignoring invalid port in PROMSKETCH_PORT_BLOCKLIST: {token}")
    return ports


PROMSKETCH_CONTROL_URL = os.environ.get("PROMSKETCH_CONTROL_URL", "http://localhost:7000")
PROMSKETCH_BASE_PORT = int(os.environ.get("PROMSKETCH_BASE_PORT", "7100"))
MACHINES_PER_PORT = int(os.environ.get("PROMSKETCH_MACHINES_PER_PORT", "200"))
METRICS_PER_TARGET_HINT = int(os.environ.get("PROMSKETCH_METRICS_PER_TARGET", "1250"))
PORT_BLOCKLIST = _parse_port_blocklist(os.environ.get("PROMSKETCH_PORT_BLOCKLIST", "7000"))
BATCH_SEND_INTERVAL_SECONDS = float(os.environ.get("PROMSKETCH_BATCH_INTERVAL_SECONDS", "1"))
POST_TIMEOUT_SECONDS = float(os.environ.get("PROMSKETCH_POST_TIMEOUT_SECONDS", "8"))
REGISTER_SLEEP_SECONDS = float(os.environ.get("PROMSKETCH_REGISTER_SLEEP_SECONDS", "1"))
SCRAPE_TIMEOUT_SECONDS = float(os.environ.get("PROMSKETCH_SCRAPE_TIMEOUT_SECONDS", "5"))
MACHINE_ID_OFFSET = int(os.environ.get("PROMSKETCH_MACHINE_ID_OFFSET", "0"))
THROUGHPUT_AVG_WINDOW = max(1, int(float(os.environ.get("PROMSKETCH_THROUGHPUT_AVG_WINDOW", "5"))))

_CONTROL_HOST = urlparse(PROMSKETCH_CONTROL_URL).hostname or "localhost"

total_sent = 0
start_time = time.time()

# Map machineid → port using MACHINES_PER_PORT ranges
def machine_to_port(machineid: str) -> int:
    """Map a machine id (machine_N) into the ingest port responsible for that shard."""
    # machineid format: "machine_0", "machine_1", ..., "machine_199"
    try:
        idx = int(str(machineid).split("_")[1])
    except Exception:
        idx = 0
    port_index = idx // MACHINES_PER_PORT
    return PROMSKETCH_BASE_PORT + port_index

# Read num_samples_config.yml, estimate total time series, then register with the main server at :7000/register_config
async def register_capacity(config_data):
    """Announce target capacity to the control plane so it spins up enough ingest ports."""
    targets = config_data["scrape_configs"][0]["static_configs"][0]["targets"]
    num_targets = len(targets)
    total_ts_est = num_targets * METRICS_PER_TARGET_HINT
    payload = {
        "num_targets": num_targets,
        "estimated_timeseries": total_ts_est,
        "machines_per_port": MACHINES_PER_PORT,
        "start_port": PROMSKETCH_BASE_PORT,
    }
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(f"{PROMSKETCH_CONTROL_URL}/register_config",
                                    json=payload, timeout=5) as resp:
                print("[REGISTER_CONFIG]", resp.status)
        except Exception as e:
            print("[REGISTER_CONFIG ERROR]", e)

# Fetch metrics from targets listed in num_samples_config.yml via HTTP and parse Prometheus text format into sample lists
async def fetch_metrics(session, target, fallback_machineid=None):
    """Scrape a Prometheus exporter and convert its text exposition into metric dicts."""
    metrics = []
    try:
        async with session.get(f"http://{target}/metrics", timeout=SCRAPE_TIMEOUT_SECONDS) as response:
            if response.status != 200:
                print(f"[ERROR] Failed to scrape {target}: {response.status}")
                return metrics
            text = await response.text()
            for family in text_fd_to_metric_families(StringIO(text)):
                for sample in family.samples:
                    labels_dict = dict(sample.labels)
                    if "machineid" not in labels_dict and fallback_machineid:
                        labels_dict["machineid"] = fallback_machineid
                    metrics.append({
                        "Name": sample.name,
                        "Labels": labels_dict,
                        "Value": float(sample.value),
                    })
    except Exception as e:
        print(f"[ERROR] Scraping {target} failed: {e}")
    return metrics

async def fetch_server_stats(session):
    """Query the control server for aggregated ingest statistics (rate, totals)."""
    url = f"{PROMSKETCH_CONTROL_URL}/ingest_stats"
    try:
        async with session.get(url, timeout=POST_TIMEOUT_SECONDS) as response:
            if response.status != 200:
                return None
            return await response.json()
    except Exception as e:
        print(f"[INGEST SPEED] server stats fetch failed: {e}")
        return None


async def log_speed(session):
    """Continuously log local send rate and remote ingest stats for observability."""
    global total_sent

    last_total = 0
    last_time = start_time
    rate_window = []

    while True:
        await asyncio.sleep(1)
        now = time.time()
        elapsed = now - start_time
        delta_time = now - last_time
        current_total = total_sent
        delta_samples = current_total - last_total

        instantaneous_rate = 0.0
        if delta_time > 0:
            instantaneous_rate = delta_samples / delta_time
        rate_window.append(instantaneous_rate)
        if len(rate_window) > THROUGHPUT_AVG_WINDOW:
            rate_window.pop(0)
        smoothed_rate = sum(rate_window) / len(rate_window)

        average_rate = 0.0
        if elapsed > 0:
            average_rate = current_total / elapsed

        server_stats = await fetch_server_stats(session)
        if server_stats:
            interval = server_stats.get("interval_seconds")
            samples = server_stats.get("samples_in_interval")
            rate = server_stats.get("rate_per_sec")
            total_ingested = server_stats.get("total_ingested")

            try:
                interval_str = f"{float(interval):.2f}"
            except (TypeError, ValueError):
                interval_str = "n/a"
            try:
                samples_str = f"{int(samples)}"
            except (TypeError, ValueError):
                samples_str = "n/a"
            try:
                rate_str = f"{float(rate):.2f}"
            except (TypeError, ValueError):
                rate_str = "n/a"
            avg_rate_str = rate_str
            avg_rate = server_stats.get("avg_rate_per_sec")
            if avg_rate is not None:
                try:
                    avg_rate_str = f"{float(avg_rate):.2f}"
                except (TypeError, ValueError):
                    avg_rate_str = rate_str
            try:
                total_str = f"{int(total_ingested)}"
            except (TypeError, ValueError):
                total_str = "n/a"

            print(
                "[INGEST STATS] "
                f"interval={interval_str}s rate={avg_rate_str}/sec "
            )
        else:
            print(
                "[INGEST STATS] server stats unavailable "
                f"local_rate={instantaneous_rate:.2f}/sec local_avg={smoothed_rate:.2f}/sec total={current_total}"
            )

        last_total = current_total
        last_time = now

def parse_duration(duration_str):
    """Parse Prometheus-style duration strings (ms/s/m/h) into seconds."""
    if duration_str.endswith('ms'):
        return int(duration_str[:-2]) / 1000
    if duration_str.endswith('s'):
        return int(duration_str[:-1])
    if duration_str.endswith('m'):
        return int(duration_str[:-1]) * 60
    if duration_str.endswith('h'):
        return int(duration_str[:-1]) * 3600
    raise ValueError(f"Unsupported duration format: {duration_str}")

async def post_with_retry(session, url, payload, retries=2):
    """POST payload with simple exponential backoff to tolerate transient port failures."""
    last_err = None
    for attempt in range(retries + 1):
        try:
            async with session.post(url, json=payload, timeout=POST_TIMEOUT_SECONDS) as resp:
                text = await resp.text()
                return resp.status, text
        except Exception as e:
            last_err = e
            await asyncio.sleep(0.2 * (attempt + 1))
    raise last_err

# ... remainder of the earlier code stays the same ...

async def ingest_loop(config_file):
    """Main scrape → bucket → forward loop that keeps PromSketch fed."""
    global total_sent

    try:
        with open(config_file, "r") as f:
            config_data = yaml.safe_load(f)
        await register_capacity(config_data)
        await asyncio.sleep(REGISTER_SLEEP_SECONDS)  # <— NEW: give 71xx ports time to start
    except Exception as e:
        print(f"Error loading config file: {e}")
        sys.exit(1)

    targets = config_data["scrape_configs"][0]["static_configs"][0]["targets"]
    target_machine_ids = {
        target: f"machine_{MACHINE_ID_OFFSET + idx}"
        for idx, target in enumerate(targets)
    }
    num_targets = len(targets)
    # MAX_BATCH_SIZE = num_targets * METRICS_PER_TARGET_HINT

    print(f"[CONFIG] metrics_per_target_hint = {METRICS_PER_TARGET_HINT}")
    print(f"[ROUTING] BASE_PORT={PROMSKETCH_BASE_PORT} MACHINES_PER_PORT={MACHINES_PER_PORT}")

    scrape_interval_str = config_data["scrape_configs"][0].get("scrape_interval", "10s")
    try:
        interval_seconds = parse_duration(scrape_interval_str)
        print(f"[CONFIG] scrape_interval={scrape_interval_str} parsed={interval_seconds}s")
        if interval_seconds <= 0:
            interval_seconds = 1
    except Exception as e:
        print(f"Invalid scrape_interval: {e}")
        interval_seconds = 1

    async with aiohttp.ClientSession() as session:
        log_task = asyncio.create_task(log_speed(session))
        try:
            while True:
                current_scrape_time = int(time.time() * 1000)
                tasks = [
                    fetch_metrics(session, target, target_machine_ids.get(target))
                    for target in targets
                ]
                results = await asyncio.gather(*tasks)

                metrics_buffer = []
                for metric_list in results:
                    metrics_buffer.extend(metric_list)

                # DEBUG: how many metrics did we scrape this interval?
                print(
                    f"[LOOP] scraped={len(metrics_buffer)} "
                    f"targets={len(targets)} "
                    f"interval={interval_seconds}s"
                )

                # Immediately send every metric fetched during this interval
                if metrics_buffer:
                    buckets = defaultdict(list)
                    for m in metrics_buffer:
                        mid = m["Labels"].get("machineid", "machine_0")
                        port = machine_to_port(mid)
                        buckets[port].append(m)
                    # DEBUG: how many per port are we about to send?
                    debug_bucket = {port: len(items) for port, items in buckets.items()}
                    print(f"[LOOP] buckets={debug_bucket}")

                    for port, items in sorted(buckets.items()):
                        url = f"http://{_CONTROL_HOST}:{port}/ingest"
                        payload = {"Timestamp": current_scrape_time, "Metrics": items}
                        try:
                            status, body = await post_with_retry(session, url, payload, retries=2)
                            if status == 200:
                                total_sent += len(items)
                                # print(f"[SEND OK] {len(items)} → {url}")
                            else:
                                print(f"[SEND ERR {status}] {url} → {body[:200]}")
                        except Exception as e:
                            print(f"[SEND EXC] {url}: {e}")

                await asyncio.sleep(interval_seconds)
        finally:
            log_task.cancel()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to Prometheus config file")
    args = parser.parse_args()
    asyncio.run(ingest_loop(args.config))
