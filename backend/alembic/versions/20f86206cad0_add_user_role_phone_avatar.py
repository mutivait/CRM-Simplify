"""add_user_role_phone_avatar

Revision ID: 20f86206cad0
Revises: 001_initial
Create Date: 2026-05-05 02:27:19.212113

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20f86206cad0'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('phone', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(500), nullable=True))
    
    # Add role column with default value (use uppercase to match existing enum)
    op.add_column('users', sa.Column('role', sa.Enum('ADMIN', 'MANAGER', 'VIEWER', name='userrole'), nullable=False, server_default='MANAGER'))


def downgrade() -> None:
    # Drop columns
    op.drop_column('users', 'role')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'phone')
    
    # Note: We don't drop the enum type as it might be used elsewhere
