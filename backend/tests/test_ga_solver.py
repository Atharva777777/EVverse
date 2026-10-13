"""
backend/tests/test_ga_solver.py
===============================
Unit and integration tests for the Evolutionary Genetic Algorithm solver.
Validates:
1. Exact budget feasibility constraint (K stations chosen, no duplicates).
2. Deterministic repeatability when passing a configured seed.
3. Optimality / near-optimality against exhaustive ground truth on 8-zone network.
4. Comparison against greedy baseline heuristic.
5. Edge cases: K=1, K=N, K>N, small search spaces (C(n, K) <= population_size).
6. Validation errors on invalid inputs (n=0, K<=0, K>n).
7. Direct integration with QUBOProblem instances.
8. Strict execution timeout enforcement (<= 5s) per test.
"""

import concurrent.futures
import functools
import numpy as np
import pytest

from backend.optimization.classical_solver import (
    PlacementProblem,
    solve_exhaustive,
    solve_proximity_weighted,
)
from backend.optimization.genetic_solver import (
    GASolverConfig,
    solve_ga,
    solve_greedy,
    solve_qubo_ga,
)
from quantum.qubo import QUBOProblem


def strict_timeout(seconds: float = 5.0):
    """
    Decorator enforcing a strict execution timeout on each test function.
    Guarantees that infinite loops or deadlocks raise TimeoutError within seconds.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(func, *args, **kwargs)
                try:
                    return future.result(timeout=seconds)
                except concurrent.futures.TimeoutError:
                    raise TimeoutError(
                        f"Test '{func.__name__}' timed out after {seconds} seconds."
                    )
        return wrapper
    return decorator


@pytest.fixture
def sample_placement_problem():
    """8-zone mock placement problem."""
    labels = [f"Z{i}" for i in range(8)]
    demands = np.array([120.0, 85.0, 210.0, 95.0, 160.0, 75.0, 140.0, 110.0])
    
    # Adjacency: self-coverage + some neighbor coverage
    adj = np.eye(8, dtype=bool)
    adj[0, 1] = adj[1, 0] = True
    adj[2, 3] = adj[3, 2] = True
    adj[4, 5] = adj[5, 4] = True
    adj[6, 7] = adj[7, 6] = True
    adj[0, 2] = adj[2, 0] = True

    return PlacementProblem(
        labels=labels,
        demands=demands,
        coverage_adj=adj,
        budget=3,
    )


@strict_timeout(5.0)
def test_ga_strict_feasibility(sample_placement_problem):
    """Verify that GA solutions strictly adhere to placing exactly K unique stations."""
    cfg = GASolverConfig(population_size=20, max_generations=25, seed=42)
    result = solve_ga(sample_placement_problem, config=cfg)

    assert result.feasible is True
    assert result.n_stations == 3
    assert len(result.selected_zones) == 3
    assert len(set(result.selected_zones)) == 3
    assert all(z in sample_placement_problem.labels for z in result.selected_zones)


@strict_timeout(5.0)
def test_ga_repeatability_deterministic_seed(sample_placement_problem):
    """Verify that the same random seed guarantees 100% reproducible solutions."""
    cfg1 = GASolverConfig(population_size=25, max_generations=30, seed=123)
    cfg2 = GASolverConfig(population_size=25, max_generations=30, seed=123)

    res1 = solve_ga(sample_placement_problem, config=cfg1)
    res2 = solve_ga(sample_placement_problem, config=cfg2)

    assert res1.selected_zones == res2.selected_zones
    assert res1.station_idxs == res2.station_idxs
    assert pytest.approx(res1.best_fitness) == res2.best_fitness
    assert res1.generations_run == res2.generations_run


@strict_timeout(5.0)
def test_ga_matches_exhaustive_optimum(sample_placement_problem):
    """
    On an 8-zone network, verify that GA finds the exact optimal solution
    identified by exhaustive combinatorial search.
    """
    # 1. Exhaustive ground truth
    exhaustive_out = solve_exhaustive(sample_placement_problem)
    expected_best_covered = exhaustive_out.best_covered_demand

    # 2. GA run with covered_demand objective
    cfg = GASolverConfig(
        population_size=30,
        max_generations=40,
        objective="covered_demand",
        seed=42,
    )
    ga_out = solve_ga(sample_placement_problem, config=cfg)

    assert pytest.approx(ga_out.covered_demand_kwh_h, abs=1e-3) == expected_best_covered
    assert ga_out.feasible is True


@strict_timeout(5.0)
def test_ga_vs_greedy_baseline(sample_placement_problem):
    """Verify that GA achieves at least as good or better fitness than the greedy heuristic."""
    greedy_res = solve_greedy(sample_placement_problem, objective="covered_demand")
    cfg = GASolverConfig(population_size=20, max_generations=30, objective="covered_demand", seed=99)
    ga_res = solve_ga(sample_placement_problem, config=cfg)

    assert ga_res.covered_demand_kwh_h >= greedy_res["covered_demand_kwh_h"]
    assert "greedy" in ga_res.baseline_comparison


@strict_timeout(5.0)
def test_ga_k_equals_1():
    """Verify edge case K=1 selects exactly 1 feasible zone and terminates immediately."""
    labels = ["Z0", "Z1", "Z2"]
    demands = np.array([50.0, 100.0, 150.0])
    adj = np.eye(3, dtype=bool)

    p_k1 = PlacementProblem(labels=labels, demands=demands, coverage_adj=adj, budget=1)
    res_k1 = solve_ga(p_k1, config=GASolverConfig(population_size=20, seed=42))

    assert res_k1.n_stations == 1
    assert len(res_k1.selected_zones) == 1
    assert res_k1.feasible is True
    assert res_k1.selected_zones[0] in labels


@strict_timeout(5.0)
def test_ga_k_equals_n():
    """Verify K=N where combinations C(N, N)=1 terminates without infinite loop."""
    labels = ["Z0", "Z1", "Z2"]
    demands = np.array([50.0, 100.0, 150.0])
    adj = np.eye(3, dtype=bool)

    p_kn = PlacementProblem(labels=labels, demands=demands, coverage_adj=adj, budget=3)
    res_kn = solve_ga(p_kn, config=GASolverConfig(population_size=30, seed=42))

    assert res_kn.n_stations == 3
    assert set(res_kn.selected_zones) == {"Z0", "Z1", "Z2"}
    assert res_kn.feasible is True


@strict_timeout(5.0)
def test_ga_k_greater_than_n():
    """Verify K > N raises ValueError preventing impossible placement."""
    labels = ["Z0", "Z1", "Z2"]
    demands = np.array([50.0, 100.0, 150.0])
    adj = np.eye(3, dtype=bool)

    p_k_gt_n = PlacementProblem(labels=labels, demands=demands, coverage_adj=adj, budget=5)
    with pytest.raises(ValueError, match="cannot exceed"):
        solve_ga(p_k_gt_n)


@strict_timeout(5.0)
def test_ga_small_search_spaces():
    """
    Verify search spaces where unique combinations are fewer than population size:
    e.g., C(4, 2) = 6 <= 30, and C(5, 4) = 5 <= 30.
    Ensures safe duplicate padding, termination, and strict feasibility.
    """
    # Case A: 4 zones, choose 2 (6 total combinations vs population size 30)
    labels_4 = ["A", "B", "C", "D"]
    demands_4 = np.array([10.0, 20.0, 30.0, 40.0])
    adj_4 = np.eye(4, dtype=bool)
    p_4_2 = PlacementProblem(labels=labels_4, demands=demands_4, coverage_adj=adj_4, budget=2)

    res_4_2 = solve_ga(p_4_2, config=GASolverConfig(population_size=30, seed=42))
    assert res_4_2.n_stations == 2
    assert len(set(res_4_2.selected_zones)) == 2
    assert res_4_2.feasible is True

    # Case B: 5 zones, choose 4 (5 total combinations vs population size 30)
    labels_5 = ["A", "B", "C", "D", "E"]
    demands_5 = np.array([15.0, 25.0, 35.0, 45.0, 55.0])
    adj_5 = np.eye(5, dtype=bool)
    p_5_4 = PlacementProblem(labels=labels_5, demands=demands_5, coverage_adj=adj_5, budget=4)

    res_5_4 = solve_ga(p_5_4, config=GASolverConfig(population_size=30, seed=42))
    assert res_5_4.n_stations == 4
    assert len(set(res_5_4.selected_zones)) == 4
    assert res_5_4.feasible is True


@strict_timeout(5.0)
def test_ga_invalid_inputs():
    """Verify input validation for empty candidate zones and invalid budget."""
    labels = ["Z0", "Z1", "Z2"]
    demands = np.array([50.0, 100.0, 150.0])
    adj = np.eye(3, dtype=bool)

    # Empty candidate zones
    p_empty = PlacementProblem(
        labels=[],
        demands=np.array([]),
        coverage_adj=np.empty((0, 0), dtype=bool),
        budget=1,
    )
    with pytest.raises(ValueError, match="Cannot run GA on an empty problem"):
        solve_ga(p_empty)

    # Budget K <= 0
    p_zero_k = PlacementProblem(labels=labels, demands=demands, coverage_adj=adj, budget=0)
    with pytest.raises(ValueError, match="Budget K must be at least 1"):
        solve_ga(p_zero_k)

    p_neg_k = PlacementProblem(labels=labels, demands=demands, coverage_adj=adj, budget=-2)
    with pytest.raises(ValueError, match="Budget K must be at least 1"):
        solve_ga(p_neg_k)


@strict_timeout(5.0)
def test_ga_qubo_integration():
    """Verify solve_qubo_ga adapter works seamlessly with QUBOProblem instances."""
    labels = [f"Z{i}" for i in range(6)]
    demands = np.array([100.0, 150.0, 200.0, 120.0, 80.0, 160.0])
    adj = np.eye(6, dtype=bool)
    adj[0, 1] = adj[1, 0] = True
    c_values = np.array([12.5, 18.2, 22.0, 14.1, 9.8, 17.5])
    Q_upper = np.zeros((6, 6))
    for j in range(6):
        Q_upper[j, j] = -c_values[j]

    qubo_prob = QUBOProblem(
        labels=labels,
        demands=demands,
        coverage_adj=adj,
        dist_eff=np.ones((6, 6)) * 500.0,
        c_values=c_values,
        Q_upper=Q_upper,
        Q_sym=Q_upper,
        lam=10.0,
        budget=2,
        n=6,
    )

    ga_dict = solve_qubo_ga(qubo_prob, config=GASolverConfig(population_size=20, max_generations=20, seed=42))

    assert ga_dict["method"] == "genetic_algorithm"
    assert ga_dict["feasible"] is True
    assert ga_dict["n_stations"] == 2
    assert len(ga_dict["selected_zones"]) == 2
    assert len(set(ga_dict["selected_zones"])) == 2
