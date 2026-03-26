import os
import re

directories = ["mobile/screens", "mobile/components", "mobile/navigation"]
root_dir = "c:/Users/alper.ozer/Desktop/War Asset 3D"

patterns = [
    re.compile(r">([^<{]+)<"),  # Text in JSX
    re.compile(r"title=['\"]([^'\"]+)['\"]"),
    re.compile(r"placeholder=['\"]([^'\"]+)['\"]"),
    re.compile(r"label=['\"]([^'\"]+)['\"]"),
    re.compile(r"headerTitle=['\"]([^'\"]+)['\"]"),
    re.compile(r"accessibilityLabel=['\"]([^'\"]+)['\"]"),
    re.compile(r"value=['\"]([^'\"]+)['\"]"),
]

hardcoded_strings = {}


def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Skip files that already use useTranslation or t extensively if it's too noisy,
    # but the goal is to find remaining ones.

    for pattern in patterns:
        for match in pattern.finditer(content):
            string = match.group(1).strip()
            if not string or string == " " or string.isdigit() or len(string) < 3:
                continue
            # Ignore some common non-string things
            if string.startswith("{") and string.endswith("}"):
                continue
            if string.startswith(".") or string.endswith("."):
                # might be a variable or path
                if "/" in string or "\\" in string:
                    continue

            if string not in hardcoded_strings:
                hardcoded_strings[string] = []
            hardcoded_strings[string].append(filepath)


for d in directories:
    dir_path = os.path.join(root_dir, d)
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith(".tsx"):
                process_file(os.path.join(root, file))

for s, paths in sorted(hardcoded_strings.items()):
    print(f"String: {s}")
    for p in set(paths):
        print(f"  - {p.replace(root_dir, '')}")
