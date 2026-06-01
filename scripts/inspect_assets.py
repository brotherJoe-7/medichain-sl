from pathlib import Path

for file_name in [
    'assets/splash-icon.png',
    'assets/splash-icon1.png',
    'assets/icon.png',
    'assets/icon1.png',
]:
    path = Path(file_name)
    if path.exists():
        data = path.read_bytes()
        print(file_name, 'size=', len(data), 'contains Palms=', b'Palms' in data, 'contains Medichain=', b'Medichain' in data)
    else:
        print(file_name, 'missing')
