#!/bin/bash

kill -9  $(ps aux | grep './prometheus' | awk '{print $2}')
kill -9 $(ps aux | grep  -i '[p]ython fake_norm_exporter.py' | awk '{print $2}')
kill -9 $(ps aux | grep -i '[p]ython ../EvaluationTools/EvalData.py' | awk '{print $2}')

rm -r data/
