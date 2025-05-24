import asyncio
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tortoise import Tortoise

async def init_database():
    # Initialize database connection with the same config as main.py
    await Tortoise.init(
        db_url='sqlite://backend/db.sqlite3',
        modules={'models': ['backend.models']}
    )
    
    try:
        # Generate database schemas
        await Tortoise.generate_schemas()
        print('Database schemas created successfully!')
        
    except Exception as e:
        print(f'Error creating database schemas: {e}')
    finally:
        await Tortoise.close_connections()

if __name__ == '__main__':
    asyncio.run(init_database()) 