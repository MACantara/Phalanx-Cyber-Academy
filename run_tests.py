#!/usr/bin/env python3
"""
Test runner script for Phalanx Cyber Academy automated testing.
This script provides convenient ways to run different test suites.
"""
import sys
import subprocess
import argparse


def run_tests(args):
    """Run pytest with specified arguments."""
    cmd = ["pytest"]
    
    # Add test path if specified
    if args.path:
        cmd.append(args.path)
    
    # Add markers if specified
    if args.marker:
        cmd.extend(["-m", args.marker])
    
    # Add verbosity
    if args.verbose:
        cmd.append("-vv")
    else:
        cmd.append("-v")
    
    # Add coverage if requested
    if args.coverage:
        cmd.extend(["--cov=app", "--cov-report=html"])
    
    # Add specific flags
    if args.failfast:
        cmd.append("-x")
    
    if args.last_failed:
        cmd.append("--lf")
    
    if args.keyword:
        cmd.extend(["-k", args.keyword])
    
    # Add parallel execution if requested
    if args.parallel:
        cmd.extend(["-n", str(args.parallel)])
    
    # Run the tests
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    return result.returncode


def main():
    parser = argparse.ArgumentParser(
        description="Run automated tests for Phalanx Cyber Academy"
    )
    
    parser.add_argument(
        "path",
        nargs="?",
        help="Path to test file or directory (default: all tests)"
    )
    
    parser.add_argument(
        "-m", "--marker",
        help="Run tests with specific marker (smoke, functional, ui, security, etc.)"
    )
    
    parser.add_argument(
        "-k", "--keyword",
        help="Run tests matching keyword expression"
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose output"
    )
    
    parser.add_argument(
        "-x", "--failfast",
        action="store_true",
        help="Stop on first failure"
    )
    
    parser.add_argument(
        "--lf", "--last-failed",
        dest="last_failed",
        action="store_true",
        help="Run only tests that failed last time"
    )
    
    parser.add_argument(
        "--cov", "--coverage",
        dest="coverage",
        action="store_true",
        help="Run with coverage report"
    )
    
    parser.add_argument(
        "-n", "--parallel",
        type=int,
        metavar="NUM",
        help="Run tests in parallel with NUM workers"
    )
    
    # Predefined test suites
    parser.add_argument(
        "--smoke",
        action="store_true",
        help="Run smoke tests only"
    )
    
    parser.add_argument(
        "--public",
        action="store_true",
        help="Run public pages tests only"
    )
    
    parser.add_argument(
        "--auth",
        action="store_true",
        help="Run authentication tests only"
    )
    
    parser.add_argument(
        "--admin",
        action="store_true",
        help="Run admin panel tests only"
    )
    
    parser.add_argument(
        "--levels",
        action="store_true",
        help="Run learning levels tests only"
    )
    
    args = parser.parse_args()
    
    # Handle predefined suites
    if args.smoke:
        args.marker = "smoke"
    elif args.public:
        args.path = "tests/public"
    elif args.auth:
        args.path = "tests/auth"
    elif args.admin:
        args.path = "tests/admin"
    elif args.levels:
        args.path = "tests/levels"
    
    return run_tests(args)


if __name__ == "__main__":
    sys.exit(main())
