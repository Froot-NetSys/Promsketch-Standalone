echo "--windowsize=10 --querytype=quantile"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=10 --querytype=quantile --waiteval=300
echo "--windowsize=100 --querytype=quantile"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=100 --querytype=quantile --waiteval=300
echo "--windowsize=1000 --querytype=quantile"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=1000 --querytype=quantile --waiteval=300
echo "--windowsize=10000 --querytype=quantile"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=10000 --querytype=quantile --waiteval=300
echo "--windowsize=100000 --querytype=quantile"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=100000 --querytype=quantile --waiteval=300
echo "--windowsize=1000000 --querytype=quantile"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=1000000 --querytype=quantile --waiteval=400
echo "--windowsize=10000000 --querytype=quantile"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=10000000 --querytype=quantile --waiteval=400