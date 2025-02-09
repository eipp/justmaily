import logging
import time
import random

class DynamicWorkflowManager:
    def __init__(self):
        self.logger = logging.getLogger("DynamicWorkflowManager")

    def start_workflow(self, tasks):
        self.logger.info(f"Starting dynamic workflow with tasks: {tasks}")
        results = {}
        for task in tasks:
            self.logger.info(f"Executing task: {task}")
            result = self.execute_task(task)
            results[task] = result
        self.logger.info(f"Workflow results: {results}")
        return results

    def execute_task(self, task):
        try:
            # Simulate task execution with a chance of failure
            if random.random() < 0.3:
                raise Exception("Simulated task failure")
            time.sleep(1)  # Simulate work
            return f"{task} completed"
        except Exception as e:
            self.logger.error(f"Error executing task {task}: {str(e)}. Attempting retry...")
            # Simple retry logic (could be extended with exponential backoff etc.)
            try:
                time.sleep(1)
                self.logger.info(f"Retrying task: {task}")
                # Simulate second attempt
                if random.random() < 0.3:
                    raise Exception("Simulated task failure on retry")
                return f"{task} completed after retry"
            except Exception as e:
                self.logger.error(f"Task {task} failed after retry: {str(e)}")
                return f"{task} failed"

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    workflow_manager = DynamicWorkflowManager()
    tasks = ["Task A", "Task B", "Task C"]
    workflow_manager.start_workflow(tasks) 