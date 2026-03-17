import asyncio
from sqlalchemy import select, update
from app.database import async_session
from app.models import Form, FormStatus

async def fix_forms():
    async with async_session() as db:
        # Actualizar todos los formularios publicados para que sean públicos
        result = await db.execute(
            update(Form)
            .where(Form.status == FormStatus.PUBLISHED)
            .values(is_public=True)
        )
        await db.commit()
        
        # Verificar
        result = await db.execute(select(Form))
        forms = result.scalars().all()
        print(f'Total formularios: {len(forms)}')
        print('-' * 80)
        for f in forms:
            print(f'ID:{f.id} | {f.title[:30]:<30} | Status:{f.status.value:<10} | is_public:{f.is_public}')
        print('-' * 80)
        both = [f for f in forms if f.status.value == 'published' and f.is_public == True]
        print(f'Formularios visibles en app móvil: {len(both)}')

asyncio.run(fix_forms())
