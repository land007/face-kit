#!/bin/bash
go tool pprof -inuse_space http://127.0.0.1:8899/debug/pprof/heap
