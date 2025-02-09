import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import logging
from src.ai_orchestration.core_framework import AIAgentOrchestrator

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    orchestrator = AIAgentOrchestrator()
    goal = "Test goal for orchestrating AI tasks"
    result = orchestrator.orchestrate(goal)
    print("Orchestration result:", result) 