# Read the file
with open('/home/ubuntu/fragransia-frontend/fragransia-website/lib/firebase-service.ts', 'r') as f:
    content = f.read()

# Simple replacements
replacements = [
    ('await updateDoc(doc(db,', 'if (!db) { console.warn("Firebase not available, skipping operation"); return; }\n      await updateDoc(doc(db,'),
    ('await setDoc(doc(db,', 'if (!db) { console.warn("Firebase not available, skipping operation"); return; }\n      await setDoc(doc(db,'),
    ('await getDoc(doc(db,', 'if (!db) { console.warn("Firebase not available, skipping operation"); return null; }\n      await getDoc(doc(db,'),
    ('await addDoc(collection(db,', 'if (!db) { console.warn("Firebase not available, skipping operation"); return "offline-" + Date.now(); }\n      await addDoc(collection(db,'),
    ('const q = query(collection(db,', 'if (!db) { console.warn("Firebase not available, skipping operation"); return null; }\n      const q = query(collection(db,'),
]

# Apply replacements only if not already present
for old, new in replacements:
    if old in content and 'if (!db)' not in content.split(old)[0].split('\n')[-1]:
        content = content.replace(old, new)

# Write back
with open('/home/ubuntu/fragransia-frontend/fragransia-website/lib/firebase-service.ts', 'w') as f:
    f.write(content)

print("Firebase service fixed!")
