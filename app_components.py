def load_config():
    # Load and return application configuration
    return {"config_value": "example"}


def start_app():
    config = load_config()
    print("App started with config:", config) 