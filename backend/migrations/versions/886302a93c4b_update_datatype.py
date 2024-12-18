"""update datatype

Revision ID: 886302a93c4b
Revises: 
Create Date: 2024-12-09 18:57:41.516738

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '886302a93c4b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('box',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('box_code', sa.String(), nullable=False),
    sa.Column('total_objects', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('box', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_box_box_code'), ['box_code'], unique=True)

    op.create_table('fresh_produce',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('box_id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.Column('category', sa.String(), nullable=False),
    sa.Column('produce', sa.String(), nullable=False),
    sa.Column('fresh', sa.String(), nullable=False),
    sa.Column('freshness_index', sa.Float(), nullable=False),
    sa.Column('shelf_life', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['box_id'], ['box.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('packed_item',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('box_id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.Column('brand', sa.Text(), nullable=False),
    sa.Column('manufacturing_date', sa.Date(), nullable=True),
    sa.Column('expiry_date', sa.Date(), nullable=True),
    sa.Column('count', sa.Integer(), nullable=False),
    sa.Column('expired', sa.String(), nullable=True),
    sa.Column('expected_life_span', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['box_id'], ['box.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('packed_item')
    op.drop_table('fresh_produce')
    with op.batch_alter_table('box', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_box_box_code'))

    op.drop_table('box')
    # ### end Alembic commands ###
