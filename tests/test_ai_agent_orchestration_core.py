import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import logging
from src.ai_orchestration.core import AIAgentOrchestrationCore

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    core = AIAgentOrchestrationCore()
    goal = "Improve customer engagement with targeted campaigns"
    result = core.orchestrate(goal)
    print("Orchestration core result:", result) 