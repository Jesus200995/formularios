import asyncio
from sqlalchemy import select
from app.database import async_session
from app.models import Form

async def check_forms():
    async with async_session() as db:
        result = await db.execute(select(Form))
        forms = result.scalars().all()
        print(f'Total formularios: {len(forms)}')
        print('-' * 80)
        for f in forms:
            print(f'ID:{f.id} | Titulo:{f.title[:35]:<35} | Status:{f.status.value:<10} | is_public:{f.is_public}')
        print('-' * 80)
        # Contar publicados y públicos
        published = [f for f in forms if f.status.value == 'published']
        public = [f for f in forms if f.is_public == True]
        both = [f for f in forms if f.status.value == 'published' and f.is_public == True]
        print(f'Publicados: {len(published)}')
        print(f'Públicos (is_public=True): {len(public)}')
        print(f'Publicados Y Públicos (visibles en app): {len(both)}')

asyncio.run(check_forms())
