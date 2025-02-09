#!/usr/bin/env python3
"""
Orchestrator for JustMaily Sprint 3 Enhancements

This module ties together the ETL pipeline, self-healing mechanism, backup/restore simulation,
and GPT-based remediation script generator. It provides a command-line interface to run the
various components developed for data pipeline resilience, observability, and disaster recovery.
"""

import argparse


def run_etl():
    from src import etl_pipeline
    etl_pipeline.run_etl_pipeline()


def run_self_healing():
    import self_healing
    self_healing.main()


def run_backup_restore():
    from scripts import backup_restore
    backup_restore.main()


def run_remediation():
    from remediation import gpt_remediator
    # Test remediation generation with a sample error condition
    script = gpt_remediator.generate_remediation_script("SampleErrorCondition")
    print(script)


def main():
    parser = argparse.ArgumentParser(description='Orchestrator for JustMaily Sprint 3 Enhancements')
    subparsers = parser.add_subparsers(dest='command', help='Sub-command to run')

    subparsers.add_parser('etl', help='Run the ETL pipeline')
    subparsers.add_parser('self-healing', help='Run the self-healing mechanism')
    subparsers.add_parser('backup', help='Run the backup and restore simulation')
    subparsers.add_parser('remediation', help='Run the GPT remediation script generator simulation')

    args = parser.parse_args()

    if args.command == 'etl':
        run_etl()
    elif args.command == 'self-healing':
        run_self_healing()
    elif args.command == 'backup':
        run_backup_restore()
    elif args.command == 'remediation':
        run_remediation()
    else:
        parser.print_help()


if __name__ == '__main__':
    main() 