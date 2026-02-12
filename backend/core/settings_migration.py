from .settings import *

# Override Database to point to Azure SQL (MSSQL)
# Credentials from previous context
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'junkyard_db',  # Resource name was junkyard-sql-dev/junkyard_db. Often just DB name.
        'USER': 'junkyard_admin',
        'PASSWORD': 'saksaud@7411',
        'HOST': 'junkyard-sql-dev.database.windows.net',
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'extra_params': 'Encrypt=yes;TrustServerCertificate=no',
        },
    }
}
