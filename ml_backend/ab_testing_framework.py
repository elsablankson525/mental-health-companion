#!/usr/bin/env python3
"""
A/B Testing Framework for Mental Health Companion
Tests different recommendation strategies and measures their effectiveness
"""

import json
import numpy as np
import random
from datetime import datetime, timedelta
from collections import defaultdict
import sqlite3
import os
from dataclasses import dataclass
from typing import Dict, List, Any, Optional
import hashlib

@dataclass
class Experiment:
    """Represents an A/B test experiment"""
    experiment_id: str
    name: str
    description: str
    variants: List[Dict[str, Any]]
    start_date: datetime
    end_date: Optional[datetime]
    status: str  # 'active', 'paused', 'completed'
    success_metric: str
    minimum_sample_size: int
    confidence_level: float = 0.95

@dataclass
class ExperimentResult:
    """Results of an A/B test experiment"""
    experiment_id: str
    variant_a_metrics: Dict[str, float]
    variant_b_metrics: Dict[str, float]
    statistical_significance: bool
    p_value: float
    confidence_interval: tuple
    winner: Optional[str]
    recommendation: str

class ABTestingFramework:
    """A/B testing framework for recommendation strategies"""
    
    def __init__(self, db_path="ab_testing.db"):
        self.db_path = db_path
        self.init_database()
        self.active_experiments = {}
        self.experiment_results = {}
        
        # Statistical parameters
        self.minimum_sample_size = 100
        self.confidence_level = 0.95
        self.significance_threshold = 0.05
    
    def init_database(self):
        """Initialize A/B testing database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create experiments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS experiments (
                experiment_id TEXT PRIMARY KEY,
                name TEXT,
                description TEXT,
                variants TEXT,
                start_date DATETIME,
                end_date DATETIME,
                status TEXT,
                success_metric TEXT,
                minimum_sample_size INTEGER,
                confidence_level REAL
            )
        ''')
        
        # Create experiment assignments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS experiment_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                experiment_id TEXT,
                user_id TEXT,
                variant TEXT,
                assigned_date DATETIME,
                FOREIGN KEY (experiment_id) REFERENCES experiments (experiment_id)
            )
        ''')
        
        # Create experiment events table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS experiment_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                experiment_id TEXT,
                user_id TEXT,
                variant TEXT,
                event_type TEXT,
                event_value REAL,
                timestamp DATETIME,
                context TEXT,
                FOREIGN KEY (experiment_id) REFERENCES experiments (experiment_id)
            )
        ''')
        
        # Create experiment results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS experiment_results (
                experiment_id TEXT PRIMARY KEY,
                results TEXT,
                calculated_date DATETIME,
                FOREIGN KEY (experiment_id) REFERENCES experiments (experiment_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_experiment(self, name: str, description: str, variants: List[Dict], 
                         success_metric: str, duration_days: int = 14) -> str:
        """Create a new A/B test experiment"""
        experiment_id = self._generate_experiment_id(name)
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        
        experiment = Experiment(
            experiment_id=experiment_id,
            name=name,
            description=description,
            variants=variants,
            start_date=start_date,
            end_date=end_date,
            status='active',
            success_metric=success_metric,
            minimum_sample_size=self.minimum_sample_size,
            confidence_level=self.confidence_level
        )
        
        # Store in database
        self._store_experiment(experiment)
        
        # Add to active experiments
        self.active_experiments[experiment_id] = experiment
        
        print(f"🧪 Created experiment: {name} (ID: {experiment_id})")
        return experiment_id
    
    def _generate_experiment_id(self, name: str) -> str:
        """Generate unique experiment ID"""
        timestamp = datetime.now().isoformat()
        hash_input = f"{name}_{timestamp}".encode()
        return hashlib.md5(hash_input).hexdigest()[:8]
    
    def _store_experiment(self, experiment: Experiment):
        """Store experiment in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO experiments
            (experiment_id, name, description, variants, start_date, end_date, 
             status, success_metric, minimum_sample_size, confidence_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            experiment.experiment_id,
            experiment.name,
            experiment.description,
            json.dumps(experiment.variants),
            experiment.start_date.isoformat(),
            experiment.end_date.isoformat() if experiment.end_date else None,
            experiment.status,
            experiment.success_metric,
            experiment.minimum_sample_size,
            experiment.confidence_level
        ))
        
        conn.commit()
        conn.close()
    
    def assign_user_to_variant(self, experiment_id: str, user_id: str) -> str:
        """Assign user to a variant in an experiment"""
        if experiment_id not in self.active_experiments:
            raise ValueError(f"Experiment {experiment_id} not found or not active")
        
        experiment = self.active_experiments[experiment_id]
        
        # Check if user already assigned
        existing_assignment = self._get_user_assignment(experiment_id, user_id)
        if existing_assignment:
            return existing_assignment
        
        # Assign user to variant using consistent hashing
        variant = self._assign_variant_consistently(experiment_id, user_id, experiment.variants)
        
        # Store assignment
        self._store_user_assignment(experiment_id, user_id, variant)
        
        return variant
    
    def _assign_variant_consistently(self, experiment_id: str, user_id: str, variants: List[Dict]) -> str:
        """Assign user to variant using consistent hashing"""
        # Use consistent hashing to ensure same user gets same variant
        hash_input = f"{experiment_id}_{user_id}".encode()
        hash_value = int(hashlib.md5(hash_input).hexdigest(), 16)
        
        # Distribute users evenly across variants
        variant_index = hash_value % len(variants)
        return variants[variant_index]['name']
    
    def _get_user_assignment(self, experiment_id: str, user_id: str) -> Optional[str]:
        """Get user's assigned variant"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT variant FROM experiment_assignments
            WHERE experiment_id = ? AND user_id = ?
            ORDER BY assigned_date DESC
            LIMIT 1
        ''', (experiment_id, user_id))
        
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else None
    
    def _store_user_assignment(self, experiment_id: str, user_id: str, variant: str):
        """Store user assignment in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO experiment_assignments
            (experiment_id, user_id, variant, assigned_date)
            VALUES (?, ?, ?, ?)
        ''', (experiment_id, user_id, variant, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def record_event(self, experiment_id: str, user_id: str, event_type: str, 
                    event_value: float = 1.0, context: Dict = None):
        """Record an event for an experiment"""
        if experiment_id not in self.active_experiments:
            return
        
        # Get user's variant
        variant = self._get_user_assignment(experiment_id, user_id)
        if not variant:
            return
        
        # Store event
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO experiment_events
            (experiment_id, user_id, variant, event_type, event_value, timestamp, context)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            experiment_id, user_id, variant, event_type, event_value,
            datetime.now().isoformat(), json.dumps(context) if context else None
        ))
        
        conn.commit()
        conn.close()
    
    def calculate_experiment_results(self, experiment_id: str) -> ExperimentResult:
        """Calculate results for an experiment"""
        if experiment_id not in self.active_experiments:
            raise ValueError(f"Experiment {experiment_id} not found")
        
        experiment = self.active_experiments[experiment_id]
        
        # Get experiment data
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT variant, event_type, event_value, timestamp
            FROM experiment_events
            WHERE experiment_id = ? AND event_type = ?
            ORDER BY timestamp
        ''', (experiment_id, experiment.success_metric))
        
        events = cursor.fetchall()
        conn.close()
        
        if not events:
            return ExperimentResult(
                experiment_id=experiment_id,
                variant_a_metrics={},
                variant_b_metrics={},
                statistical_significance=False,
                p_value=1.0,
                confidence_interval=(0, 0),
                winner=None,
                recommendation="Insufficient data"
            )
        
        # Group events by variant
        variant_events = defaultdict(list)
        for variant, event_type, event_value, timestamp in events:
            variant_events[variant].append(event_value)
        
        # Calculate metrics for each variant
        variants = list(variant_events.keys())
        if len(variants) < 2:
            return ExperimentResult(
                experiment_id=experiment_id,
                variant_a_metrics={},
                variant_b_metrics={},
                statistical_significance=False,
                p_value=1.0,
                confidence_interval=(0, 0),
                winner=None,
                recommendation="Need at least 2 variants"
            )
        
        variant_a = variants[0]
        variant_b = variants[1]
        
        variant_a_values = variant_events[variant_a]
        variant_b_values = variant_events[variant_b]
        
        # Calculate basic metrics
        variant_a_metrics = self._calculate_metrics(variant_a_values)
        variant_b_metrics = self._calculate_metrics(variant_b_values)
        
        # Perform statistical test
        significance, p_value, confidence_interval = self._perform_statistical_test(
            variant_a_values, variant_b_values
        )
        
        # Determine winner
        winner = None
        if significance:
            if variant_a_metrics['mean'] > variant_b_metrics['mean']:
                winner = variant_a
            else:
                winner = variant_b
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            significance, p_value, variant_a_metrics, variant_b_metrics, winner
        )
        
        result = ExperimentResult(
            experiment_id=experiment_id,
            variant_a_metrics=variant_a_metrics,
            variant_b_metrics=variant_b_metrics,
            statistical_significance=significance,
            p_value=p_value,
            confidence_interval=confidence_interval,
            winner=winner,
            recommendation=recommendation
        )
        
        # Store results
        self._store_experiment_results(experiment_id, result)
        self.experiment_results[experiment_id] = result
        
        return result
    
    def _calculate_metrics(self, values: List[float]) -> Dict[str, float]:
        """Calculate metrics for a variant"""
        if not values:
            return {'mean': 0, 'std': 0, 'count': 0, 'conversion_rate': 0}
        
        return {
            'mean': np.mean(values),
            'std': np.std(values),
            'count': len(values),
            'conversion_rate': np.mean(values) if all(v in [0, 1] for v in values) else np.mean(values)
        }
    
    def _perform_statistical_test(self, values_a: List[float], values_b: List[float]) -> tuple:
        """Perform statistical significance test"""
        from scipy import stats
        
        if len(values_a) < 30 or len(values_b) < 30:
            # Use t-test for small samples
            t_stat, p_value = stats.ttest_ind(values_a, values_b)
        else:
            # Use z-test for large samples
            mean_a, mean_b = np.mean(values_a), np.mean(values_b)
            std_a, std_b = np.std(values_a), np.std(values_b)
            n_a, n_b = len(values_a), len(values_b)
            
            se = np.sqrt((std_a**2 / n_a) + (std_b**2 / n_b))
            z_stat = (mean_a - mean_b) / se
            p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
        
        significance = p_value < self.significance_threshold
        
        # Calculate confidence interval
        mean_diff = np.mean(values_a) - np.mean(values_b)
        se_diff = np.sqrt((np.var(values_a) / len(values_a)) + (np.var(values_b) / len(values_b)))
        margin_error = 1.96 * se_diff  # 95% confidence interval
        confidence_interval = (mean_diff - margin_error, mean_diff + margin_error)
        
        return significance, p_value, confidence_interval
    
    def _generate_recommendation(self, significance: bool, p_value: float, 
                               metrics_a: Dict, metrics_b: Dict, winner: str) -> str:
        """Generate recommendation based on results"""
        if not significance:
            return f"No significant difference found (p={p_value:.3f}). Continue testing or increase sample size."
        
        if winner:
            improvement = abs(metrics_a['mean'] - metrics_b['mean']) / max(metrics_a['mean'], metrics_b['mean'])
            return f"Variant {winner} is significantly better (p={p_value:.3f}, {improvement:.1%} improvement). Consider implementing this variant."
        else:
            return f"Significant difference found (p={p_value:.3f}) but no clear winner. Review variant implementations."
    
    def _store_experiment_results(self, experiment_id: str, result: ExperimentResult):
        """Store experiment results in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        results_data = {
            'variant_a_metrics': result.variant_a_metrics,
            'variant_b_metrics': result.variant_b_metrics,
            'statistical_significance': bool(result.statistical_significance),
            'p_value': float(result.p_value),
            'confidence_interval': [float(x) for x in result.confidence_interval],
            'winner': result.winner,
            'recommendation': result.recommendation
        }
        
        cursor.execute('''
            INSERT OR REPLACE INTO experiment_results
            (experiment_id, results, calculated_date)
            VALUES (?, ?, ?)
        ''', (experiment_id, json.dumps(results_data), datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def get_experiment_status(self, experiment_id: str) -> Dict:
        """Get current status of an experiment"""
        if experiment_id not in self.active_experiments:
            return {'status': 'not_found'}
        
        experiment = self.active_experiments[experiment_id]
        
        # Get current metrics
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT variant, COUNT(*) as event_count, AVG(event_value) as avg_value
            FROM experiment_events
            WHERE experiment_id = ? AND event_type = ?
            GROUP BY variant
        ''', (experiment_id, experiment.success_metric))
        
        variant_stats = cursor.fetchall()
        conn.close()
        
        return {
            'experiment_id': experiment_id,
            'name': experiment.name,
            'status': experiment.status,
            'start_date': experiment.start_date.isoformat(),
            'end_date': experiment.end_date.isoformat() if experiment.end_date else None,
            'variant_stats': {row[0]: {'count': row[1], 'avg_value': row[2]} for row in variant_stats},
            'has_results': experiment_id in self.experiment_results
        }
    
    def list_active_experiments(self) -> List[Dict]:
        """List all active experiments"""
        return [
            self.get_experiment_status(exp_id) 
            for exp_id in self.active_experiments.keys()
        ]

def test_ab_testing_framework():
    """Test the A/B testing framework"""
    print("🧪 Testing A/B Testing Framework")
    print("=" * 50)
    
    # Initialize framework
    ab_framework = ABTestingFramework("test_ab.db")
    
    # Create test experiment
    variants = [
        {'name': 'control', 'description': 'Current recommendation system'},
        {'name': 'enhanced', 'description': 'Enhanced with ML predictions'}
    ]
    
    experiment_id = ab_framework.create_experiment(
        name="Recommendation Strategy Test",
        description="Testing enhanced recommendation system vs current system",
        variants=variants,
        success_metric="recommendation_helpful",
        duration_days=7
    )
    
    print(f"✅ Created experiment: {experiment_id}")
    
    # Simulate user assignments and events
    test_users = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005']
    
    for user_id in test_users:
        variant = ab_framework.assign_user_to_variant(experiment_id, user_id)
        print(f"👤 User {user_id} assigned to variant: {variant}")
        
        # Simulate events (recommendation helpfulness)
        num_events = random.randint(5, 15)
        for _ in range(num_events):
            # Simulate different success rates for variants
            if variant == 'enhanced':
                helpful = random.random() < 0.7  # 70% helpful
            else:
                helpful = random.random() < 0.5  # 50% helpful
            
            ab_framework.record_event(
                experiment_id=experiment_id,
                user_id=user_id,
                event_type='recommendation_helpful',
                event_value=1.0 if helpful else 0.0,
                context={'mood': random.randint(1, 10)}
            )
    
    # Calculate results
    print(f"\n📊 Calculating experiment results...")
    results = ab_framework.calculate_experiment_results(experiment_id)
    
    print(f"✅ Experiment Results:")
    print(f"   Statistical significance: {results.statistical_significance}")
    print(f"   P-value: {results.p_value:.4f}")
    print(f"   Winner: {results.winner}")
    print(f"   Recommendation: {results.recommendation}")
    
    # Show experiment status
    print(f"\n📈 Experiment Status:")
    status = ab_framework.get_experiment_status(experiment_id)
    for variant, stats in status['variant_stats'].items():
        print(f"   {variant}: {stats['count']} events, avg value: {stats['avg_value']:.3f}")
    
    # Clean up test database
    if os.path.exists("test_ab.db"):
        os.remove("test_ab.db")
    
    print(f"\n🎉 A/B testing framework test completed!")
    
    return ab_framework

if __name__ == "__main__":
    ab_framework = test_ab_testing_framework()
