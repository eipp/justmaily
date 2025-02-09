import logging

from src.inference.model_inference import ModelInference
from src.memory.zept_memory import ZeptMemory
from src.guardrails.ethical_guardrails import EthicalGuardrails


class AITooling:
    def __init__(self):
        self.logger = logging.getLogger("AITooling")
        self.inference_engine = ModelInference()
        self.memory = ZeptMemory()
        self.guardrails = EthicalGuardrails()

    def process_prompt(self, prompt: str) -> str:
        self.logger.info(f"Processing prompt: {prompt}")
        # Validate the prompt via ethical guardrails
        if not self.guardrails.validate_message(prompt):
            self.logger.error("Prompt failed ethical validation. Aborting processing.")
            return "Prompt failed ethical validation."
        # Perform inference using the active LLM or fallback
        result = self.inference_engine.infer(prompt)
        # Store the result in memory for context
        self.memory.store_context("last_inference", result)
        # Redact any PII in the inference result
        redacted_result = self.guardrails.redact_pii(result)
        self.logger.info(f"Final processed result: {redacted_result}")
        return redacted_result


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    ai_tooling = AITooling()
    output = ai_tooling.process_prompt("Boost eco-friendly skincare email conversions")
    print(output) 