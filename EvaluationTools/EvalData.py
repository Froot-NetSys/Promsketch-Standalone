"""
Example usage:
python EvalData.py --targets=1 --waiteval=5 --windowsize=10 --querytype=avg --timeseries=10
"""

import re
import requests
import argparse
import pandas as pd
import sys
import time

# df_ts = pd.read_csv("timeseries.csv")


pattern = r"(\d+)"
pattern2 = r'_([a-zA-Z]+)(\d+)_'


def make_requests(wait_eval):
    data = {}
    for i in range(10):
        response = requests.get("http://localhost:9090/api/v1/rules")
        res_json = response.json()
        res_json = res_json["data"]["groups"]
        for group in res_json:
            match = re.search(pattern2, group["name"])
            name = match[1]
            samples = match[2]
            full_name = str(name) + str(samples)
            rows = data.get(full_name, [])
            for rule in group["rules"]:
                row = {}
                eval_time = rule["evaluationTime"]
                row["Evaluation_Time"] = eval_time
                row["Sample_Size"] = int(samples)
            rows.append(row)
            data[full_name] = rows
        time.sleep(wait_eval)

    return data


if __name__ == "__main__":
    parse = argparse.ArgumentParser()
    parse.add_argument(
        "--waiteval", type=int, help="time to wait before next eval in seconds"
    )
    parse.add_argument("--targets", type=int, help="number of targets")
    parse.add_argument("--timeseries", type=int, help="total number of timeseries")
    args = parse.parse_args()
    if args.waiteval is None or args.targets is None:
        print("Missing argument --waiteval, --targets")
        sys.exit(0)

    wait_time = args.waiteval
    targets = args.targets
    num_timeseries = args.timeseries
    res = make_requests(wait_time)
    for name in res.keys():
        data = res[name]
        stats_df = pd.DataFrame(
            {
                "Sample_Size": [],
                "Evaluation_Time": [],
            }
        )
        stats_df = pd.concat([stats_df, pd.DataFrame(data)], ignore_index=True)
        agg_table = stats_df.groupby("Sample_Size").agg(["mean", "std"])
        agg_table.to_csv(
            f"samples_{name}_ts.csv",
            index=False,
        )
        stats_df.to_csv(
            f"raw_{name}_ts.csv",
            index=False,
        )

"""
    avg_row = {"Monitoring_Targets": targets}
    for col in mapping.values():
        avg_row[col] = avgs[col]
    print(avg_row)
    df_ts = pd.concat([df_ts, pd.DataFrame([avg_row])], ignore_index=True)
    stats_df.to_csv(f"targets_{targets}_data.csv", index=False)
    df_ts.to_csv("timeseries.csv", index=False)
"""
