import os
import re

# 📁 Path to your frontend folder (adjust this)
frontend_dir = "./"

# 📄 File extensions to scan
file_extensions = [".ts", ".tsx", ".js", ".jsx"]

# 🔍 Regex pattern to find "/api/..." in strings
pattern = re.compile(r'["\']\/api\/[^\s"\']+["\']')

# 🧠 Store found issues
matches = []

# 🔁 Walk through all frontend files
for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if any(file.endswith(ext) for ext in file_extensions):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    if pattern.search(line):
                        matches.append(f"{path} (line {i+1}): {line.strip()}")

# 🖨️ Output all matches
if matches:
    print("🚨 Hardcoded /api/ paths found:\n")
    for m in matches:
        print(m)
else:
    print("✅ No hardcoded /api/ paths found.")