import re
import logging

class EthicalGuardrails:
    def __init__(self):
        self.logger = logging.getLogger("EthicalGuardrails")
        # Pattern for US SSNs (e.g., 123-45-6789)
        self.ss_pattern = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
        # Basic pattern for emails
        self.email_pattern = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
        # List of banned terms for ethical compliance
        self.banned_terms = ["unethical", "discriminatory"]

    def redact_pii(self, text: str) -> str:
        redacted_text = self.ss_pattern.sub("[REDACTED_SSN]", text)
        redacted_text = self.email_pattern.sub("[REDACTED_EMAIL]", redacted_text)
        self.logger.info(f"After redaction: {redacted_text}")
        return redacted_text

    def validate_message(self, text: str) -> bool:
        lower_text = text.lower()
        for term in self.banned_terms:
            if term in lower_text:
                self.logger.error(f"Message contains banned term: {term}")
                return False
        return True

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    guardrails = EthicalGuardrails()
    sample = "Customer email: test@example.com and SSN: 123-45-6789. This is an unethical action."
    valid = guardrails.validate_message(sample)
    redacted = guardrails.redact_pii(sample)
    logging.info(f"Valid: {valid}\nRedacted: {redacted}") 