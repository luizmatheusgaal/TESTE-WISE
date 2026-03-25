from contextlib import contextmanager
from psycopg2.pool import SimpleConnectionPool

from src.settings import settings


pool = SimpleConnectionPool(1, 10, dsn=settings.dsn)


@contextmanager
def get_connection():
    connection = pool.getconn()
    try:
        yield connection
        connection.commit()

    except Exception:
        connection.rollback()
        raise

    finally:
        pool.putconn(connection)
