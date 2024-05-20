import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import matplotlib.ticker as mtick
from matplotlib.ticker import ScalarFormatter
import re
import json
import argparse

# when number of timeseries = 1, we tune the number of samples in a query window and plot the query latency (10 times)

plt.rcParams['font.family'] = 'Times New Roman'
plt.rcParams['pdf.fonttype'] = 42
'''
plt.rcParams['font.size'] = 36  # 48
plt.rcParams['axes.labelsize'] = 36  # 48
plt.rcParams['legend.fontsize'] = 36  # 55
plt.rcParams["figure.figsize"] = (12, 5)
'''


num_samples = [10000] # 16min
num_ts = [1, 10, 100, 1000, 10000, 100000]

querytype = ["avg", "sum", "quantile"]
mapping = {"avg": "Average", "sum": "Sum", "quantile": "Quantile"}

y = {"avg": [], "sum": [], "quantile": []}
std_array = {"avg": [], "sum": [], "quantile": []}

for samples in num_samples:
    for ts in num_ts:
        for query in querytype:
            filename = f"{str(samples)}_samples_{query}_{str(ts)}_ts.csv"
            df = pd.read_csv(filename)
            mean = float(df[mapping[query]][1]) * 1000
            std = float(df[mapping[query]+".1"][1]) * 1000
            y[query].append(mean)
            std_array[query].append(std)


plt.xlabel("Number of Timeseries")
plt.ylabel("Latency (ms)")
plt.plot(num_ts, y["avg"], label="avg_over_time")
plt.plot(num_ts, y["sum"], label="sum_over_time")
plt.plot(num_ts, y["quantile"], label="quantile_over_time")
ax = plt.gca()
ax.set_xscale('log')
plt.legend()
plt.savefig('10000_ts_num_latency.pdf',bbox_inches='tight')