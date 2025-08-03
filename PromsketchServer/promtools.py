import yaml
import requests
import urllib.parse
import time

RULES_FILE = "/mnt/78D8516BD8512920/GARUDA_ACE/FROOT-LAB/promsketch-standalone/PromsketchServer/prometheus/documentation/examples/prometheus-rules.yml"
SERVER_URL = "http://localhost:7000/parse?q="

def load_rules(path):
    with open(path, "r") as f:
        data = yaml.safe_load(f)
    return data.get("rules", [])

def run_query(query_str):
    encoded = urllib.parse.quote(query_str)
    url = SERVER_URL + encoded
    print(f"\n[→] Sending query: {query_str}")
    try:
        start_time = time.time()
        response = requests.get(url)
        latency = time.time() - start_time

        print(f"[⏱] Query latency: {latency:.3f} seconds")

        if response.status_code == 200:
            print("[✓] Result:", response.json())
        elif response.status_code == 202:
            print("[⏳] Sketch belum tersedia. Pesan:", response.json().get("message"))
        else:
            print("[✗] Error:", response.text)
    except Exception as e:
        print(f"[!] Failed to send query: {e}")

def main():
    rules = load_rules(RULES_FILE)
    if not rules:
        print("⚠️ No rules found in rules.yml")
        return

    for rule in rules:
        name = rule.get("name", "Unnamed")
        query = rule.get("query")
        if not query:
            print(f"⚠️ Skipping rule '{name}': No query specified")
            continue
        print(f"\n=== Running Rule: {name} ===")
        run_query(query)
        time.sleep(1)  # optional delay

if __name__ == "__main__":
    main()
