import re

# Read the file
with open('/home/ubuntu/fragransia-frontend/fragransia-website/lib/firebase-service.ts', 'r') as f:
    content = f.read()

# Pattern to find methods that use db without checking if it's null
patterns = [
    (r'(await updateDoc\(doc\(db,)', r'if (!db) { console.warn("Firebase not available, skipping operation"); return; }\n      \1'),
    (r'(await setDoc\(doc\(db,)', r'if (!db) { console.warn("Firebase not available, skipping operation"); return; }\n      \1'),
    (r'(await getDoc\(doc\(db,)', r'if (!db) { console.warn("Firebase not available, skipping operation"); return null; }\n      \1'),
    (r'(await addDoc\(collection\(db,)', r'if (!db) { console.warn("Firebase not available, skipping operation"); return "offline-" + Date.now(); }\n      \1'),
    (r'(await getDocs\(query\(collection\(db,)', r'if (!db) { console.warn("Firebase not available, skipping operation"); return null; }\n      \1'),
    (r'(const q = query\(collection\(db,)', r'if (!db) { console.warn("Firebase not available, skipping operation"); return null; }\n      \1'),
]

# Apply fixes only where not already present
for pattern, replacement in patterns:
    # Only replace if there's no "if (!db)" check before the pattern
    content = re.sub(
        r'(?<!if \(!db\) \{[^}]*\}\s*\n\s*)' + pattern,
        replacement,
        content
    )

# Write back
with open('/home/ubuntu/fragransia-frontend/fragransia-website/lib/firebase-service.ts', 'w') as f:
    f.write(content)

print("Firebase service fixed!")
