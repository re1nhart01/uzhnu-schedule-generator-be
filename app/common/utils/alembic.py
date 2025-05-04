from alembic import op
import sqlalchemy as sa


def seed_permissions(permissions: list[str], role_names: list[str]) -> None:
    """
    seed_permissions function

    This function seeds the permissions table with the provided permissions and assigns them to the roles with the provided names.

    Args:
    permissions: list[dict[str, str]]: The list of permissions to seed.
    role_names: list[str]: The list of role names to assign the permissions to.

    Usage:
    seed_permissions(
        permissions=['create_user', 'update_user', 'delete_user'],
        role_names=['Client', 'Expert']
    )
    """
    metadata_obj = sa.MetaData()
    metadata_obj.reflect(bind=op.get_bind(), only=('permissions', 'roles', 'permission_role'))

    permission_table = sa.Table('permissions', metadata_obj)
    role_table = sa.Table('roles', metadata_obj)
    permission_role_table = sa.Table('permission_role', metadata_obj)

    op.bulk_insert(
        permission_table,
        [{"name": permission} for permission in permissions],
    )

    conn = op.get_bind()
    result = conn.execute(
        sa.select(permission_table.c.id).where(permission_table.c.name.in_(permissions))
    ).fetchall()

    role_ids_res = conn.execute(
        sa.select(role_table.c.id).where(role_table.c.name.in_(role_names))
    ).fetchall()
    permission_ids = [row[0] for row in result]
    role_ids = [row[0] for row in role_ids_res]
    op.bulk_insert(
        permission_role_table,
        [{"role_id": role_id, "permission_id": permission_id} for role_id in role_ids for permission_id in
         permission_ids],
    )


def remove_permissions(permissions: list[str], role_names: list[str]) -> None:
    """
    remove_permissions function

    This function removes the provided permissions from the roles with the provided names.

    Args:
    permissions: list[str]: The list of permissions to remove.
    role_names: list[str]: The list of role names to remove the permissions from.

    Usage:
    remove_permissions(
        permissions=['create_user', 'update_user', 'delete_user'],
        role_names=['Client', 'Expert']
    )
    """
    metadata_obj = sa.MetaData()
    metadata_obj.reflect(bind=op.get_bind(), only=('permissions', 'roles', 'permission_role'))

    permission_table = sa.Table('permissions', metadata_obj)
    role_table = sa.Table('roles', metadata_obj)
    permission_role_table = sa.Table('permission_role', metadata_obj)

    conn = op.get_bind()
    result = conn.execute(
        sa.select(permission_table.c.id).where(permission_table.c.name.in_(permissions))
    ).fetchall()

    role_ids_res = conn.execute(
        sa.select(role_table.c.id).where(role_table.c.name.in_(role_names))
    ).fetchall()
    permission_ids = [row[0] for row in result]
    role_ids = [row[0] for row in role_ids_res]

    conn.execute(
        permission_role_table.delete().where(
            sa.and_(
                permission_role_table.c.permission_id.in_(permission_ids),
                permission_role_table.c.role_id.in_(role_ids)
            )
        )
    )

    conn.execute(
        permission_table.delete().where(permission_table.c.id.in_(permission_ids))
    )


def _alter_enum_type(
        table_name: str,
        column_name: str,
        enum_name: str,
        old_values: tuple,
        new_values: tuple
):
    """
    Helper function to handle altering enum types (creating temp type, altering column, and dropping old type).

    Args:
        table_name (str): The name of the table that contains the ENUM column.
        column_name (str): The name of the column that uses the ENUM type.
        enum_name (str): The name of the ENUM type to be altered.
        old_values (tuple): The current values of the ENUM before modification.
        new_values (tuple): The new values of the ENUM after modification.
    """
    tmp_enum_name = f'_{enum_name}'

    # Create enum types for old, new, and temporary versions
    old_type = sa.Enum(*old_values, name=enum_name)
    new_type = sa.Enum(*new_values, name=enum_name)
    tmp_type = sa.Enum(*new_values, name=tmp_enum_name)

    # Set the column to nullable before changing the enum type
    op.alter_column(table_name, column_name, nullable=True, server_default=None)

    # Create the temporary enum type and alter the column to use it
    tmp_type.create(op.get_bind(), checkfirst=False)
    op.execute(f'ALTER TABLE {table_name} ALTER COLUMN {column_name} TYPE {tmp_enum_name}'
               f' USING {column_name}::text::{tmp_enum_name}')

    # Drop the old type and create the new type
    old_type.drop(op.get_bind(), checkfirst=False)
    new_type.create(op.get_bind(), checkfirst=False)

    # Change the column back to the new enum type
    op.execute(f'ALTER TABLE {table_name} ALTER COLUMN {column_name} TYPE {enum_name}'
               f' USING {column_name}::text::{enum_name}')

    # Drop the temporary enum type
    tmp_type.drop(op.get_bind(), checkfirst=False)

    # Restore the column to be non-nullable
    op.alter_column(table_name, column_name, nullable=False)


def add_enum_values(
        table_name: str,
        column_name: str,
        enum_name: str,
        new_values: tuple,
        existing_values: tuple
):
    """
    Adds multiple new values to a ENUM type in a specified table and column.

    Args:
        table_name (str): The name of the table that contains the ENUM column.
        column_name (str): The name of the column that uses the ENUM type.
        enum_name (str): The name of the ENUM type.
        new_values (tuple): A tuple of new ENUM values to add.
        existing_values (tuple): A tuple of the existing ENUM values.

    Usage:
        add_enum_values(
            table_name='users',
            column_name='auth_provider',
            enum_name='authprovider',
            new_values=('LINKEDIN',),
            existing_values=('EMAIL', 'GOOGLE')
        )
    """
    # Combine and sort the existing values and the new ones
    updated_values = tuple(sorted(existing_values + new_values))

    # Use the helper to perform the enum alteration
    _alter_enum_type(table_name, column_name, enum_name, existing_values, updated_values)


def remove_enum_values(
        table_name: str,
        column_name: str,
        enum_name: str,
        values_to_remove: tuple,
        remaining_values: tuple
):
    """
    Removes multiple values from a PostgreSQL ENUM type in a specified table and column.

    Args:
        table_name (str): The name of the table that contains the ENUM column.
        column_name (str): The name of the column that uses the ENUM type.
        enum_name (str): The name of the ENUM type.
        values_to_remove (tuple): A tuple of ENUM values to remove.
        remaining_values (tuple): A tuple of ENUM values to remain after removal.

    Usage:
        remove_enum_values(
            table_name='users',
            column_name='auth_provider',
            enum_name='authprovider',
            values_to_remove=('LINKEDIN',),
            remaining_values=('EMAIL', 'GOOGLE')
        )
    """
    # Sort the remaining values to maintain consistency
    updated_values = tuple(sorted(remaining_values))

    # Use the helper to perform the enum alteration
    _alter_enum_type(table_name, column_name, enum_name, remaining_values + values_to_remove, updated_values)

