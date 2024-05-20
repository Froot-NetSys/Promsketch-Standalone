pkill -9 prometheus
kill $(ps aux | grep '[p]ython WarmUpPrometheus.py' | awk '{print $2}')
kill $(ps aux | grep '[p]ython fake_norm_exporter.py' | awk '{print $2}')
kill $(ps aux | grep '[p]ython ../EvaluationTools/EvalData.py' | awk '{print $2}')
