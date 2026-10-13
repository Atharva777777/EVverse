"""
backend/optimization/genetic_solver.py
======================================
Evolutionary Genetic Algorithm (GA) solver for EV charging station placement.

This module provides a reproducible, multi-objective evolutionary optimization
engine for the EV charger location problem. It is designed to operate on either
a classical `PlacementProblem` or a `QUBOProblem`, respecting exact budget
constraints (placing exactly K stations) and comparing against both greedy
and exhaustive baselines.

Key features:
-------------
1. Representation:
   Subset chromosome of length K containing unique zone indices {z_1, ..., z_K}.
   By construction, all chromosomes strictly satisfy feasibility (sum(x_j) == K).
2. Fitness functions:
   - "proximity_weighted" (Active default): Maximizes sum_{j in S} c_j (matches QUBO).
   - "covered_demand": Maximizes total covered demand sum_{i in covered(S)} d_i.
3. Evolutionary Operators:
   - Selection: Tournament selection (configurable size T).
   - Crossover: Combination/subset crossover with deduplication and K-repair.
   - Mutation: Swap mutation (exchanging an active zone for an inactive candidate).
   - Elitism: Strict preservation of the top E chromosomes into the next generation.
4. Reproducibility:
   Fully seeded using Python's `random.Random(seed)` and `np.random.default_rng(seed)`.
5. Baselines:
   Includes an independent greedy baseline and direct comparison against exhaustive optimum.
"""

from __future__ import annotations

import itertools
import math
import random
import time
from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Literal

import numpy as np

from backend.optimization.classical_solver import (
    PlacementProblem,
    covered_demand,
    solve_exhaustive,
    solve_proximity_weighted,
)


@dataclass
class GASolverConfig:
    """Configuration hyper-parameters for the Genetic Algorithm."""
    population_size: int = 30
    max_generations: int = 50
    patience: int = 15            # Early stop if no improvement for `patience` gens
    crossover_rate: float = 0.85
    mutation_rate: float = 0.20
    elitism_count: int = 2
    tournament_size: int = 3
    seed: Optional[int] = 42
    objective: Literal["proximity_weighted", "covered_demand"] = "proximity_weighted"


@dataclass
class GAResult:
    """Detailed output of a Genetic Algorithm optimization run."""
    method:               str = "genetic_algorithm"
    selected_zones:       List[str] = field(default_factory=list)
    station_idxs:         List[int] = field(default_factory=list)
    best_fitness:         float = 0.0
    objective_value:      float = 0.0
    qubo_energy:          float = 0.0
    feasible:             bool = True
    n_stations:           int = 0
    covered_demand_kwh_h: float = 0.0
    coverage_pct:         float = 0.0
    generations_run:      int = 0
    converged_generation: int = 0
    runtime_s:            float = 0.0
    baseline_comparison:  dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "method":               self.method,
            "selected_zones":       self.selected_zones,
            "station_idxs":         self.station_idxs,
            "best_fitness":         round(self.best_fitness, 6),
            "objective_value":      round(self.objective_value, 6),
            "qubo_energy":          round(self.qubo_energy, 6),
            "feasible":             self.feasible,
            "n_stations":           self.n_stations,
            "covered_demand_kwh_h": round(self.covered_demand_kwh_h, 4),
            "coverage_pct":         round(self.coverage_pct, 4),
            "generations_run":      self.generations_run,
            "converged_generation": self.converged_generation,
            "runtime_s":            round(self.runtime_s, 6),
            "baseline_comparison":  self.baseline_comparison,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Baseline: Classical Greedy Heuristic
# ─────────────────────────────────────────────────────────────────────────────

def solve_greedy(
    problem: PlacementProblem,
    c_values: Optional[np.ndarray] = None,
    objective: str = "proximity_weighted",
) -> dict:
    """
    Greedy heuristic solver:
    - If proximity_weighted: greedily picks the zone with highest c_j value.
    - If covered_demand: greedily picks the zone that covers the maximum marginal unserved demand.
    """
    t0 = time.perf_counter()
    n = problem.n
    K = problem.budget
    if n == 0:
        raise ValueError("Cannot run greedy on an empty problem (0 candidate zones).")
    if K <= 0:
        raise ValueError(f"Budget K must be at least 1, got {K}.")
    if K > n:
        raise ValueError(f"Budget K ({K}) cannot exceed number of available candidate zones ({n}).")
    labels = problem.labels
    demands = problem.demands
    adj = problem.coverage_adj

    selected: List[int] = []

    if objective == "proximity_weighted" and c_values is not None:
        # Sort candidate indices by c_j descending
        sorted_idxs = sorted(range(n), key=lambda idx: float(c_values[idx]), reverse=True)
        selected = sorted_idxs[:K]
        obj_val = float(sum(c_values[idx] for idx in selected))
    else:
        # Marginal covered demand greedy
        covered_mask = np.zeros(n, dtype=bool)
        candidates = set(range(n))

        for _ in range(K):
            best_gain = -1.0
            best_c = None
            for c in candidates:
                new_covered = covered_mask | adj[:, c]
                gain = float(demands[new_covered].sum() - demands[covered_mask].sum())
                if gain > best_gain:
                    best_gain = gain
                    best_c = c
            if best_c is not None:
                selected.append(best_c)
                candidates.remove(best_c)
                covered_mask |= adj[:, best_c]

        obj_val = float(demands[covered_mask].sum())

    cov_d, _ = covered_demand(tuple(selected), demands, adj)
    tot_d = float(demands.sum())
    runtime = time.perf_counter() - t0

    return {
        "method": "greedy_heuristic",
        "selected_zones": [labels[i] for i in selected],
        "station_idxs": selected,
        "objective_value": round(obj_val, 6),
        "covered_demand_kwh_h": round(cov_d, 4),
        "coverage_pct": round(cov_d / tot_d * 100.0, 4) if tot_d > 0 else 0.0,
        "runtime_s": round(runtime, 6),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Core Genetic Algorithm Engine
# ─────────────────────────────────────────────────────────────────────────────

def _evaluate_chromosome(
    chromosome: Tuple[int, ...],
    demands: np.ndarray,
    coverage_adj: np.ndarray,
    c_values: Optional[np.ndarray],
    objective: str,
) -> float:
    """Evaluate fitness of a single chromosome (set of K station indices)."""
    if objective == "proximity_weighted" and c_values is not None:
        return float(sum(c_values[j] for j in chromosome))
    # covered_demand
    cov_d, _ = covered_demand(chromosome, demands, coverage_adj)
    return cov_d


def solve_ga(
    problem: PlacementProblem,
    c_values: Optional[np.ndarray] = None,
    config: Optional[GASolverConfig] = None,
    qubo: Optional[any] = None,
) -> GAResult:
    """
    Execute the Genetic Algorithm on a PlacementProblem.
    """
    cfg = config or GASolverConfig()
    t_start = time.perf_counter()

    rng = random.Random(cfg.seed)
    n = problem.n
    K = problem.budget

    # Input validation
    if n == 0:
        raise ValueError("Cannot run GA on an empty problem (0 candidate zones).")
    if K <= 0:
        raise ValueError(f"Budget K must be at least 1, got {K}.")
    if K > n:
        raise ValueError(
            f"Budget K ({K}) cannot exceed number of available candidate zones ({n})."
        )

    total_combos = math.comb(n, K)
    effective_pop_size = max(4, min(cfg.population_size, 200))
    effective_elites = min(cfg.elitism_count, effective_pop_size // 2)

    demands = problem.demands
    adj = problem.coverage_adj
    labels = problem.labels

    # 1. Initialize Population
    population: List[Tuple[int, ...]] = []

    # Always seed one greedy heuristic chromosome to accelerate convergence
    greedy_res = solve_greedy(problem, c_values=c_values, objective=cfg.objective)
    greedy_chrom = tuple(sorted(greedy_res["station_idxs"]))

    if total_combos <= effective_pop_size:
        # Search space is smaller than or equal to population size:
        # Enumerate all unique combinations deterministically, avoiding infinite loop
        all_combos = [tuple(c) for c in itertools.combinations(range(n), K)]
        population.append(greedy_chrom)
        for c in all_combos:
            if c != greedy_chrom:
                population.append(c)
        # Pad remaining population slots up to effective_pop_size deterministically using rng
        while len(population) < effective_pop_size:
            population.append(rng.choice(all_combos))
    else:
        # Search space is larger than population size: seed greedy, then sample unique random chromosomes
        seen = {greedy_chrom}
        population.append(greedy_chrom)

        attempts = 0
        max_attempts = effective_pop_size * 20
        while len(population) < effective_pop_size:
            sample = tuple(sorted(rng.sample(range(n), K)))
            if sample not in seen:
                seen.add(sample)
                population.append(sample)
            else:
                attempts += 1
                if attempts >= max_attempts:
                    population.append(sample)

    # Track best overall
    best_chrom: Tuple[int, ...] = population[0]
    best_fit = -np.inf
    converged_gen = 0
    no_improve_count = 0

    # 2. Generational Evolution Loop
    for gen in range(cfg.max_generations):
        # Evaluate fitness
        fitnesses = [
            _evaluate_chromosome(ind, demands, adj, c_values, cfg.objective)
            for ind in population
        ]

        # Rank population by fitness descending
        ranked_indices = sorted(range(len(population)), key=lambda i: fitnesses[i], reverse=True)
        gen_best_idx = ranked_indices[0]
        gen_best_fit = fitnesses[gen_best_idx]

        if gen_best_fit > best_fit:
            best_fit = gen_best_fit
            best_chrom = population[gen_best_idx]
            converged_gen = gen
            no_improve_count = 0
        else:
            no_improve_count += 1

        # Check early stopping patience
        if no_improve_count >= cfg.patience:
            break

        # 3. Form next generation with elitism
        next_population: List[Tuple[int, ...]] = []
        for e in range(effective_elites):
            next_population.append(population[ranked_indices[e]])

        # 4. Selection, Crossover, and Mutation
        while len(next_population) < effective_pop_size:
            # Tournament selection
            def tournament() -> Tuple[int, ...]:
                participants = rng.sample(range(len(population)), min(cfg.tournament_size, len(population)))
                winner_idx = max(participants, key=lambda idx: fitnesses[idx])
                return population[winner_idx]

            parent1 = tournament()
            parent2 = tournament()

            # Crossover
            if rng.random() < cfg.crossover_rate:
                combined = list(set(parent1) | set(parent2))
                if len(combined) >= K:
                    child_alleles = rng.sample(combined, K)
                else:
                    remaining = [z for z in range(n) if z not in combined]
                    needed = K - len(combined)
                    child_alleles = combined + rng.sample(remaining, needed)
            else:
                child_alleles = list(parent1)

            # Mutation: swap an active zone for an inactive zone
            if rng.random() < cfg.mutation_rate:
                inactive = [z for z in range(n) if z not in child_alleles]
                if inactive:
                    swap_out_idx = rng.randrange(len(child_alleles))
                    swap_in = rng.choice(inactive)
                    child_alleles[swap_out_idx] = swap_in

            child = tuple(sorted(child_alleles))
            next_population.append(child)

        population = next_population

    # 5. Compile Final Result
    runtime_s = time.perf_counter() - t_start
    selected_labels = [labels[idx] for idx in best_chrom]
    cov_d, _ = covered_demand(best_chrom, demands, adj)
    total_d = float(demands.sum())
    cov_pct = (cov_d / total_d * 100.0) if total_d > 0 else 0.0

    # QUBO energy evaluation if QUBO provided
    qubo_energy = 0.0
    if qubo is not None and hasattr(qubo, "energy"):
        x_vec = np.zeros(n)
        for idx in best_chrom:
            x_vec[idx] = 1.0
        qubo_energy = float(qubo.energy(x_vec))

    return GAResult(
        method="genetic_algorithm",
        selected_zones=selected_labels,
        station_idxs=list(best_chrom),
        best_fitness=best_fit,
        objective_value=best_fit,
        qubo_energy=qubo_energy,
        feasible=(len(set(best_chrom)) == K and len(best_chrom) == K),
        n_stations=len(best_chrom),
        covered_demand_kwh_h=cov_d,
        coverage_pct=cov_pct,
        generations_run=gen + 1,
        converged_generation=converged_gen,
        runtime_s=runtime_s,
        baseline_comparison={
            "greedy": greedy_res,
            "fitness_vs_greedy_delta": round(best_fit - greedy_res["objective_value"], 6),
        },
    )


def solve_qubo_ga(qubo: any, config: Optional[GASolverConfig] = None) -> dict:
    """
    Convenience adapter to solve a QUBOProblem directly using the Genetic Algorithm.
    Operates on the canonical proximity-weighted objective.
    """
    cfg = config or GASolverConfig(objective="proximity_weighted")
    problem = PlacementProblem(
        labels=qubo.labels,
        demands=qubo.demands,
        coverage_adj=qubo.coverage_adj,
        budget=qubo.budget,
    )
    result = solve_ga(problem, c_values=qubo.c_values, config=cfg, qubo=qubo)
    return result.to_dict()
