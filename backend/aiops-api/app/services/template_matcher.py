import csv
import re
from pathlib import Path

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

TEMPLATE_FILE = BASE_DIR / "data" / "event_templates_drain3.csv"

class TemplateMatcher:

    def __init__(self, csv_path: str):
        self.csv_path = Path(csv_path)
        self.templates = []

        self._load_templates()

        print(f"[TemplateMatcher] {len(self.templates)} templates chargés")

    # ==========================================================
    # Chargement du CSV
    # ==========================================================

    def _load_templates(self):

        with open(
            self.csv_path,
            "r",
            encoding="utf-8",
            newline=""
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                event_id = row["EventId"]
                template = row["EventTemplate"]

                occurrences = int(
                    row.get("Occurrences", 0) or 0
                )

                regex = self._template_to_regex(template)

                self.templates.append({
                    "event_id": event_id,
                    "template": template,
                    "occurrences": occurrences,
                    "regex": re.compile(regex)
                })

        # Les templates les plus fréquents sont testés en premier.
        self.templates.sort(
            key=lambda x: x["occurrences"],
            reverse=True
        )

    # ==========================================================
    # Conversion EventTemplate → Regex
    # ==========================================================

    def _template_to_regex(self, template: str) -> str:

        # On protège les placeholders avant d'échapper
        # les caractères spéciaux du template.

        placeholders = {
            "<BLOCK_ID>":
                r"blk_[\w-]+",

            "<IP>":
                r"\d{1,3}(?:\.\d{1,3}){3}",

            "<PORT>":
                r"\d+",

            "<:PORT>":
                r":\d+",

            "<*>":
                r".+?",

            "<NUM>":
                r"\d+"
        }

        # Découper le template en placeholders / texte
        pattern = re.compile(
            r"(<BLOCK_ID>|<IP>|<:PORT>|<PORT>|<\*>|<NUM>)"
        )

        parts = pattern.split(template)

        regex = ""

        for part in parts:

            if not part:
                continue

            if part in placeholders:
                regex += placeholders[part]

            else:
                regex += re.escape(part)

        return "^" + regex + "$"

    # ==========================================================
    # Matching
    # ==========================================================

    def match(self, content: str):

        for item in self.templates:

            if item["regex"].match(content):

                return {
                    "event_id": item["event_id"],
                    "event_template": item["template"]
                }

        return None