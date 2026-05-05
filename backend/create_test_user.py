import asyncio
from app.core.database import async_session_maker
from app.models import User
from app.core.security import get_password_hash, verify_password
from sqlalchemy import select

async def create_test_user():
    async with async_session_maker() as session:
        email = 'test@crm.local'
        password = 'test123'
        
        # Check if user exists
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            print(f'User {email} already exists. Updating password.')
            user.hashed_password = get_password_hash(password)
        else:
            print(f'Creating new user {email}')
            new_hash = get_password_hash(password)
            # Verify immediately
            if not verify_password(password, new_hash):
                print("ERROR: Hash verification failed immediately after creation!")
                return
            
            new_user = User(
                email=email,
                hashed_password=new_hash,
                full_name='Test User',
                is_active=True
            )
            session.add(new_user)
            
        await session.commit()
        
        # Final verification from DB
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user and verify_password(password, user.hashed_password):
            print(f"SUCCESS: User {email} created/updated and verified.")
            print(f"Hash in DB: {user.hashed_password}")
        else:
            print("ERROR: Final verification failed.")

if __name__ == "__main__":
    asyncio.run(create_test_user())
