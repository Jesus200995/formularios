import asyncio
from sqlalchemy import text
from app.database import engine

async def check_users():
    async with engine.begin() as conn:
        result = await conn.execute(text('SELECT id, email, nombre, apellidos FROM app_users'))
        users = result.fetchall()
        for u in users:
            print(f'ID: {u[0]}, Email: {u[1]}, Nombre: {u[2]} {u[3]}')
        if not users:
            print('No hay usuarios registrados en app_users')

if __name__ == "__main__":
    asyncio.run(check_users())
