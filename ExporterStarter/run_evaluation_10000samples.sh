python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=1 --windowsize=10000 --querytype=sum --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=10 --windowsize=10000 --querytype=sum --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=100 --windowsize=10000 --querytype=sum --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=2 --timeseries=1000 --windowsize=10000 --querytype=sum --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=20 --timeseries=10000 --windowsize=10000 --querytype=sum --waiteval=100
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=100000 --windowsize=10000 --querytype=sum --waiteval=100
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=1 --windowsize=10000 --querytype=avg --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=10 --windowsize=10000 --querytype=avg --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=100 --windowsize=10000 --querytype=avg --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=2 --timeseries=1000 --windowsize=10000 --querytype=avg --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=20 --timeseries=10000 --windowsize=10000 --querytype=avg --waiteval=100
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=100000 --windowsize=10000 --querytype=avg --waiteval=100
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=1 --windowsize=10000 --querytype=quantile --waiteval=50
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=10 --windowsize=10000 --querytype=quantile --waiteval=100
python ExportManager.py --config=num_samples_config.yml --targets=1 --timeseries=100 --windowsize=10000 --querytype=quantile --waiteval=100
python ExportManager.py --config=num_samples_config.yml --targets=2 --timeseries=1000 --windowsize=10000 --querytype=quantile --waiteval=200
python ExportManager.py --config=num_samples_config.yml --targets=20 --timeseries=10000 --windowsize=10000 --querytype=quantile --waiteval=300
python ExportManager.py --config=num_samples_config.yml --targets=200 --timeseries=100000 --windowsize=10000 --querytype=quantile --waiteval=300

/bin/bash ./kill.sh