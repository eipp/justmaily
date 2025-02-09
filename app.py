from flask import Flask, request, jsonify
import logging

from packages.core.llm.ai_tooling import AITooling
from packages.core.agents.ai_orchestration import CrewAIOrchestrator
from packages.core.workflow.dynamic_workflow import DynamicWorkflowManager
from packages.core.data.data_infrastructure import DataInfrastructure
from app_components import start_app

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Initialize modules
ai_tooling = AITooling()
orchestrator = CrewAIOrchestrator()
workflow_manager = DynamicWorkflowManager()
data_infra = DataInfrastructure()


@app.route('/api/ai_tooling', methods=['POST'])
def ai_tooling_endpoint():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    result = ai_tooling.process_prompt(prompt)
    return jsonify({'result': result})


@app.route('/api/orchestrate', methods=['POST'])
def orchestrate_endpoint():
    data = request.get_json()
    goal = data.get('goal')
    if not goal:
        return jsonify({'error': 'No goal provided'}), 400
    tasks = orchestrator.decompose_goal(goal)
    assignments = orchestrator.assign_tasks(tasks)
    return jsonify({'tasks': tasks, 'assignments': assignments})


@app.route('/api/workflow', methods=['POST'])
def workflow_endpoint():
    data = request.get_json()
    tasks = data.get('tasks')
    if not tasks:
        return jsonify({'error': 'No tasks provided'}), 400
    results = workflow_manager.start_workflow(tasks)
    return jsonify({'results': results})


@app.route('/api/data', methods=['GET'])
def data_endpoint():
    snowflake_status = data_infra.connect_snowflake()
    redpanda_status = data_infra.connect_redpanda()
    placeholder_status = data_infra.connect_placeholder_services()
    return jsonify({
        'snowflake': snowflake_status,
        'redpanda': redpanda_status,
        'placeholder_services': placeholder_status
    })


if __name__ == '__main__':
    start_app() 