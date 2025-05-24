import asyncio
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.auth import hash_password
from backend.models import Practitioner
from tortoise import Tortoise

async def create_nurse():
    # Initialize database connection with the same config as main.py
    await Tortoise.init(
        db_url='sqlite://backend/db.sqlite3',
        modules={'models': ['backend.models']}
    )
    
    try:
        # Check if nurse already exists
        existing_nurse = await Practitioner.filter(email='nurse@test.com').first()
        if existing_nurse:
            print('Nurse user already exists!')
            return
            
        # Create nurse practitioner record
        nurse = await Practitioner.create(
            name=[{
                "use": "official",
                "text": "Sarah Johnson"
            }],
            email='nurse@test.com',
            identifier=[{
                "system": "license",
                "value": "N123456"
            }],
            telecom=[{
                "system": "phone",
                "value": "+1234567890"
            }],
            specialty=["Nursing"],
            password_hash=hash_password('password123')
        )
        
        print(f'Created nurse: Sarah Johnson with license: N123456')
        print(f'Email: nurse@test.com')
        print(f'Password: password123')
        print(f'Role: nurse (detected from license starting with N)')
        
    except Exception as e:
        print(f'Error creating nurse: {e}')
    finally:
        await Tortoise.close_connections()

if __name__ == '__main__':
    asyncio.run(create_nurse()) 