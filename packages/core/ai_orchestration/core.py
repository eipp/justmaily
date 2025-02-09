import logging
import random

from src.agents.ai_orchestration import CrewAIOrchestrator
from src.workflow.dynamic_workflow import DynamicWorkflowManager


class AIAgentOrchestrationCore:
    def __init__(self):
        self.logger = logging.getLogger("AIAgentOrchestrationCore")
        self.crew_ai = CrewAIOrchestrator()
        self.workflow_manager = DynamicWorkflowManager()
        self.zep_client = self.init_zep_client()  # For long-term memory storage
        self.guardrails = self.init_guardrails()   # For ethical oversight
        self.tasks = []  # List of task dicts { 'task': str, 'priority': int, 'agent': str, 'status': str }

    def init_zep_client(self):
        self.logger.info("Initializing Zep client for long-term memory storage.")
        # Placeholder implementation for Zep client initialization
        return "ZepClientStub"

    def init_guardrails(self):
        self.logger.info("Initializing NeMo Guardrails for ethical AI oversight.")
        # Placeholder implementation for guardrails initialization
        return "GuardrailsStub"

    def decompose_goal(self, goal: str):
        self.logger.info(f"Decomposing goal: {goal}")
        # Use CrewAIOrchestrator's decompose method
        tasks = self.crew_ai.decompose(goal)
        # Initialize tasks with a default priority (e.g., 5) and pending status
        self.tasks = [{ 'task': t, 'priority': 5, 'agent': None, 'status': 'pending' } for t in tasks]
        self.logger.info(f"Initial tasks: {self.tasks}")
        return self.tasks

    def assign_specialized_agents(self):
        self.logger.info("Assigning specialized agents to tasks...")
        for task in self.tasks:
            # Simple simulated assignment based on task content
            if "Understand" in task['task']:
                task['agent'] = "Campaign Strategist Agent"
            elif "Plan" in task['task']:
                task['agent'] = "Data Enricher Agent"
            elif "Execute" in task['task']:
                task['agent'] = "Compliance Guard Agent"
            else:
                task['agent'] = "Default Agent"
        self.logger.info(f"Tasks after agent assignment: {self.tasks}")
        return self.tasks

    def adjust_task_priority(self, task_identifier: str, new_priority: int):
        self.logger.info(f"Adjusting priority for task containing '{task_identifier}' to {new_priority}")
        for task in self.tasks:
            if task_identifier in task['task']:
                task['priority'] = new_priority
                self.logger.info(f"Updated task: {task}")
        return self.tasks

    def select_llm(self, task_text: str) -> str:
        self.logger.info(f"Selecting LLM for task: {task_text}")
        # Use DeepSeek R1 for shorter tasks, fallback to Azure AI for longer or complex tasks
        if len(task_text) < 50:
            return "DeepSeek R1 via Fireworks.ai"
        else:
            return "Azure AI (fallback)"

    def delegate_and_execute(self):
        self.logger.info("Delegating tasks to agents and executing workflow.")
        # Sort tasks by priority (lower number indicates higher priority)
        sorted_tasks = sorted(self.tasks, key=lambda x: x['priority'])
        results = {}
        for task in sorted_tasks:
            self.logger.info(f"Delegating task: {task}")
            llm = self.select_llm(task['task'])
            # Simulate processing of task with chosen LLM and assigned agent
            result = f"{task['task']} processed by {llm} via {task['agent']}"
            results[task['task']] = result
            task['status'] = 'completed'
        self.logger.info(f"Task execution results: {results}")
        # Execute additional dynamic workflow if needed
        dynamic_results = self.workflow_manager.start_workflow(list(results.values()))
        self.logger.info(f"Workflow execution finished with: {dynamic_results}")
        return results, dynamic_results

    def orchestrate(self, goal: str):
        self.logger.info(f"Starting orchestration for goal: {goal}")
        self.decompose_goal(goal)
        self.assign_specialized_agents()
        # Simulate dynamic priority adjustments
        for task in self.tasks:
            if random.choice([True, False]):
                self.adjust_task_priority(task['task'], 3)
        results, dynamic_results = self.delegate_and_execute()
        return {'static_results': results, 'dynamic_results': dynamic_results} 