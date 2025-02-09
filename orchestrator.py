from orchestrator_core import run_orchestration


def main_orchestrator():
    data = {}  # Retrieve or receive data as required.
    result = run_orchestration(data)
    print(result)


if __name__ == '__main__':
    main_orchestrator() 