import yaml
import requests
import urllib.parse
import time
import signal
import sys

RULES_FILE = "/mnt/78D8516BD8512920/GARUDA_ACE/FROOT-LAB/promsketch-standalone/PromsketchServer/promsketch-rules.yml"
SERVER_URL = "http://localhost:7000/parse?q="

def load_rules(path):
    with open(path, "r") as f:
        data = yaml.safe_load(f)
    return data.get("rules", [])
    
def run_query(query_str):
    encoded = urllib.parse.quote(query_str)
    url = SERVER_URL + encoded
    print(f"\nSending query: {query_str}")
    try:
        # client-side timing
        start_time = time.perf_counter()
        response = requests.get(url)
        local_latency_ms = (time.perf_counter() - start_time) * 1000.0

        if response.status_code == 200:
            json_data = response.json()
            server_latency_ms = json_data.get("query_latency_ms", None)
            results = json_data.get("data", [])

            print(f"[LOCAL ] Query latency : {local_latency_ms:.2f} ms")
            if server_latency_ms is not None:
                print(f"[SERVER] Query latency : {server_latency_ms:.2f} ms")

            # ambil hasil pertama untuk machine_0
            if results:
                first = results[0]
                val = first.get("value")
                ts = first.get("timestamp")
                print(f"[RESULT] fake_machine_metric{{machineid=\"machine_0\"}} = {val} @ {ts}")

                func = query_str.split("(")[0]
                metric = query_str.split("(")[1].split("{")[0]
                machineid = "machine_0"  # dipaksa ambil machine_0
                quantile = "0.00"

                push_result_to_server(
                    func, metric, machineid, quantile,
                    val, ts,
                    client_latency_ms=local_latency_ms,
                    server_latency_ms=server_latency_ms
                )

        elif response.status_code == 202:
            print("[PENDING] Sketch not ready yet.", response.json().get("message"))
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Failed to send query: {e}")


def push_result_to_server(func, metric, machineid, quantile, value, timestamp,
                          client_latency_ms, server_latency_ms):
    body = {
        "function": func,
        "original_metric": metric,
        "machineid": machineid,
        "quantile": quantile,
        "value": value,
        "timestamp": timestamp,
        "client_latency_ms": client_latency_ms,
        "server_latency_ms": server_latency_ms,
    }
    try:
        res = requests.post("http://localhost:7000/ingest-query-result", json=body)
        if res.status_code == 200:
            print("[SUCCESS] Pushed result to server")
        else:
            print("[FAIL] Failed to push result:", res.text)
    except Exception as e:
        print(f"[FAIL] Exception while pushing result: {e}")


def push_result_to_server(func, metric, machineid, quantile, value, timestamp, client_latency_ms):
    body = {
        "function": func,
        "original_metric": metric,
        "machineid": machineid,
        "quantile": quantile,
        "value": value,
        "timestamp": timestamp,
        "client_latency_ms": client_latency_ms,  # <— tambahan
    }
    try:
        res = requests.post("http://localhost:7000/ingest-query-result", json=body)
        if res.status_code == 200:
            print("[SUCCESS] Pushed result to server")
        else:
            print("[FAIL] Failed to push result:", res.text)
    except Exception as e:
        print(f"[FAIL] Exception while pushing result: {e}")

def push_result_to_server(func, metric, machineid, quantile, value, timestamp):
    body = {
        "function": func,
        "original_metric": metric,
        "machineid": machineid,
        "quantile": quantile,
        "value": value,
        "timestamp": timestamp,
    }
    try:
        res = requests.post("http://localhost:7000/ingest-query-result", json=body)
        if res.status_code == 200:
            print("[SUCCESS] Pushed result to server")
        else:
            print("[FAIL] Failed to push result:", res.text)
    except Exception as e:
        print(f"[FAIL] Exception while pushing result: {e}")

def signal_handler(sig, frame):
    print("\n[INFO] Program dihentikan oleh user.")
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, signal_handler)

    rules = load_rules(RULES_FILE)
    if not rules:
        print("No rules found in rules.yml")
        return

    while True:
        for rule in rules:
            name = rule.get("name", "Unnamed")
            query = rule.get("query")
            if not query:
                print(f"Skipping rule '{name}': No query specified")
                continue
            print(f"\n=== Running Rule: {name} ===")
            run_query(query)
        time.sleep(60)  # update setiap 5 detik

if __name__ == "__main__":
    main()
