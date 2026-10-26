"""
Script to generate benchmark synthetic datasets for CanteenIQ.
Produces clean and dirty datasets, product catalog, ground truth events,
inventory scenario data, and dataset manifests.
"""

import sys
import os

# Ensure backend app is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.generator import generate_all_datasets

if __name__ == "__main__":
    target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "synthetic"))
    print(f"Generating CanteenIQ synthetic datasets into: {target_dir}")
    generate_all_datasets(target_dir, seed=42)
    print("Done! All datasets and manifests generated successfully.")
