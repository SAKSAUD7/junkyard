from django.db.backends.sqlite3 import base

class DatabaseWrapper(base.DatabaseWrapper):
    def get_new_connection(self, conn_params):
        conn = super().get_new_connection(conn_params)
        # Disable foreign key constraints
        conn.execute('PRAGMA foreign_keys = OFF')
        return conn
