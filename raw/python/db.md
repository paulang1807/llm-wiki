## [SQLLite](https://sqlite.org/index.html)
!!! example "[Usage](https://colab.research.google.com/drive/13eeiCDbPM8LD9cYnojxnc8KHqPNDreHp)"
    ```python
    import sqlite3
    DB = "test.db"
    
    # Create a connection
    with sqlite3.connect(DB) as conn:
        cursor = conn.cursor()
        
        # Create a table
        cursor.execute('CREATE TABLE IF NOT EXISTS test (test_id TEXT PRIMARY KEY, test_col REAL)')
        
        # Commit the changes
        conn.commit()

    # Insert data
    with sqlite3.connect(DB) as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO test (test_id, test_col) VALUES (?, ?) ON CONFLICT(test_id) DO UPDATE SET test_col = ?', ('id1', 'val1', 'val1'))
        conn.commit()

    # Query data
    with sqlite3.connect(DB) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT test_col FROM test WHERE test_id = ?', ('id1',))

        # Fetch the first result
        row = cursor.fetchone()
        print(f"Value for id1 is {row[0]}" if row else "No data found")

        # Fetch all the results
        rows = cursor.fetchall()
        for row in rows:
            print(row)
    ```