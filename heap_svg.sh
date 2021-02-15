#!/bin/bash
go tool pprof -inuse_space -cum -svg http://127.0.0.1:8899/debug/pprof/heap > heap_inuse.svg
