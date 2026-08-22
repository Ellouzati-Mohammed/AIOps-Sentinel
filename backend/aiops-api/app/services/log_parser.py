import re
from datetime import datetime


# Même regex que celle utilisée dans ton traitement historique
LOG_PATTERN = (
    r"(\d{6})\s+"
    r"(\d{6})\s+"
    r"(\d+)\s+"
    r"(\w+)\s+"
    r"([\w\.$]+):\s+"
    r"(.*)"
)


class LogParser:

    def parse(self, log_line: str):

        match = re.match(
            LOG_PATTERN,
            log_line.strip()
        )

        if not match:
            return None

        # Même extraction que ton code historique
        date_str, time_str, pid, level, component, content = match.groups()

        # Même extraction du BlockId
        block_match = re.search(
            r"blk_[-\d]+",
            content
        )

        block_id = (
            block_match.group(0)
            if block_match
            else None
        )

        # Même conversion temporelle que ton code historique
        timestamp = datetime.strptime(
            f"{date_str} {time_str}",
            "%m%d%y %H%M%S"
        )

        return {
            "date": date_str,
            "time": time_str,
            "timestamp": timestamp,
            "pid": pid,
            "level": level,
            "component": component,
            "content": content,
            "block_id": block_id
        }