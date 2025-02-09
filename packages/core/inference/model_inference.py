import logging
import random
import yaml


def load_model_config(config_path="config/models.yaml"):
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
    return config


class ModelInference:
    def __init__(self):
        self.logger = logging.getLogger("ModelInference")
        self.config = load_model_config()
        self.active_model = self.config.get("active_model")
        self.fallback_models = self.config.get("fallback_models", [])

    def infer(self, prompt: str) -> str:
        self.logger.info(f"Attempting inference with active model: {self.active_model}")
        # Simulate a potential failure with the active model
        if random.random() < 0.5:
            self.logger.error("Active model inference failed. Attempting fallback models.")
            for model in self.fallback_models:
                self.logger.info(f"Attempting inference with fallback model: {model}")
                if random.random() < 0.8:
                    result = f"Inference result from {model} for prompt: {prompt}"
                    self.logger.info(result)
                    return result
            self.logger.error("All fallback models failed.")
            return "Inference failed: All models unavailable."
        else:
            result = f"Inference result from {self.active_model} for prompt: {prompt}"
            self.logger.info(result)
            return result


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    inference_engine = ModelInference()
    result = inference_engine.infer("Sample prompt")
    print(result) 