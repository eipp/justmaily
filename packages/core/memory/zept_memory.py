import logging

class ZeptMemory:
    def __init__(self):
        self.memory = {}
        self.logger = logging.getLogger('ZeptMemory')

    def store_context(self, key: str, value: str):
        self.logger.info(f"Storing context: {key} -> {value}")
        self.memory[key] = value

    def retrieve_context(self, key: str):
        value = self.memory.get(key)
        self.logger.info(f"Retrieving context for {key}: {value}")
        return value

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    memory = ZeptMemory()
    memory.store_context('campaign', 'eco-friendly skincare campaign data')
    memory.retrieve_context('campaign') 