#!/usr/bin/env python3
"""Autoresearch experiment analyzer — MAD-based confidence scoring."""

import json
import sys
from pathlib import Path
from statistics import median


def load_experiments(jsonl_path: Path) -> list[dict]:
    experiments = []
    with open(jsonl_path) as f:
        for line in f:
            line = line.strip()
            if line:
                experiments.append(json.loads(line))
    return experiments


def compute_mad(values: list[float]) -> float:
    med = median(values)
    deviations = [abs(v - med) for v in values]
    return median(deviations) if deviations else 0.0


def analyze(jsonl_path: Path) -> None:
    experiments = load_experiments(jsonl_path)
    if not experiments:
        print("No experiments found.")
        return

    total = len(experiments)
    by_status = {}
    for exp in experiments:
        s = exp.get("status", "unknown")
        by_status[s] = by_status.get(s, 0) + 1

    # Extract primary metric values from all experiments (not just keep)
    metric_values = []
    keep_values = []
    for exp in experiments:
        m = exp.get("metric", {})
        val = m.get("value")
        if val is not None:
            metric_values.append(val)
            if exp.get("status") == "keep":
                keep_values.append(val)

    if not metric_values:
        print(f"Experiments: {total} | No metric values recorded.")
        return

    direction = experiments[0].get("metric", {}).get("direction", "lower")
    baseline = metric_values[0]

    if direction == "lower":
        best_val = min(metric_values)
        best_idx = metric_values.index(best_val)
    else:
        best_val = max(metric_values)
        best_idx = metric_values.index(best_val)

    improvement = abs(best_val - baseline)
    improvement_pct = (improvement / abs(baseline) * 100) if baseline != 0 else 0

    # Status summary
    status_parts = []
    for s in ["keep", "discard", "crash", "checks_failed"]:
        if s in by_status:
            status_parts.append(f"{s}: {by_status[s]}")
    status_str = ", ".join(status_parts)

    print(f"=== Autoresearch Analysis ===")
    print(f"Experiments: {total} ({status_str})")
    print(f"Best: {best_val} (iteration {best_idx + 1}) | Baseline: {baseline}")
    print(f"Improvement: {improvement:.6g} ({improvement_pct:.1f}%)")

    # Confidence scoring (need 3+ data points)
    if len(metric_values) >= 3:
        mad = compute_mad(metric_values)
        if mad > 0:
            confidence = improvement / mad
            if confidence >= 2.0:
                level = "likely real"
            elif confidence >= 1.0:
                level = "marginal"
            else:
                level = "within noise"
            print(f"MAD: {mad:.6g} | Confidence: {confidence:.1f}x ({level})")
        else:
            print(f"MAD: 0 (all values identical)")
    else:
        print(f"Confidence: need 3+ experiments")

    # Trend (last 3)
    if len(metric_values) >= 3:
        last3 = metric_values[-3:]
        trend_str = " -> ".join(f"{v:.6g}" for v in last3)
        if direction == "lower":
            trend = "improving" if last3[-1] < last3[0] else "worsening"
        else:
            trend = "improving" if last3[-1] > last3[0] else "worsening"
        print(f"Trend: {trend} (last 3: {trend_str})")


if __name__ == "__main__":
    default_path = Path(".autoresearch/experiments.jsonl")
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else default_path
    if not path.exists():
        print(f"File not found: {path}")
        sys.exit(1)
    analyze(path)
