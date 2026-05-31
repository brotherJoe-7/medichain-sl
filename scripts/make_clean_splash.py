import base64
from pathlib import Path

path = Path('assets/splash-icon-clean.png')
encoded = b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAOqM16oAAAAASUVORK5CYII='
path.write_bytes(base64.b64decode(encoded))
print('created', path, 'size', path.stat().st_size)
