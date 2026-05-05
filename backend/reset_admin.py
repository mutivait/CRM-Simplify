import asyncio
from app.core.database import async_session_maker
from app.models import User
from app.core.security import get_password_hash, verify_password
from sqlalchemy import update, select

async def reset_admin():
    async with async_session_maker() as session:
        password = 'admin123'
        new_hash = get_password_hash(password)
        
        # Verify the hash works immediately after creation
        if not verify_password(password, new_hash):
            print("ERROR: Generated hash verification failed!")
            return
            
        await session.execute(
            update(User)
            .where(User.email == 'admin@crm.local')
            .values(hashed_password=new_hash)
        )
        await session.commit()
        
        # Double check from DB
        result = await session.execute(select(User).where(User.email == 'admin@crm.local'))
        user = result.scalar_one_or_none()
        if user and verify_password(password, user.hashed_password):
            print("SUCCESS: Admin password reset verified.")
        else:
            print("ERROR: Verification after DB update failed.")

if __name__ == "__main__":
    asyncio.run(reset_admin())
