echo "--windowsize=10 --querytype=avg"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=10 --querytype=avg --waiteval=100
echo "--windowsize=100 --querytype=avg"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=100 --querytype=avg --waiteval=100
echo "--windowsize=1000 --querytype=avg"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=1000 --querytype=avg --waiteval=100
echo "--windowsize=10000 --querytype=avg"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=10000 --querytype=avg --waiteval=100
echo "--windowsize=100000 --querytype=avg"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=100000 --querytype=avg --waiteval=100
echo "--windowsize=1000000 --querytype=avg"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=1000000 --querytype=avg --waiteval=300
echo "--windowsize=10000000 --querytype=avg"
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=10000 --windowsize=10000000 --querytype=avg --waiteval=300