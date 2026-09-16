# backend/config/views.py
import os
from django.conf import settings
from django.http import FileResponse, Http404
from django.views.static import serve


def spa_or_static(request, path=''):
    print(f"[VIEW] spa_or_static called! path='{path}'")
    rel_path = path.lstrip('/')

    if rel_path:
        file_path = os.path.join(settings.STATIC_ROOT, rel_path)
        print(f"[VIEW] checking file: {file_path}, exists={os.path.isfile(file_path)}")
        if os.path.isfile(file_path):
            return serve(request, rel_path, document_root=settings.STATIC_ROOT)

    index_path = os.path.join(settings.STATIC_ROOT, 'index.html')
    print(f"[VIEW] serving index.html from: {index_path}")
    if not os.path.exists(index_path):
        raise Http404(f'index.html не найден: {index_path}')
    return FileResponse(open(index_path, 'rb'), content_type='text/html')