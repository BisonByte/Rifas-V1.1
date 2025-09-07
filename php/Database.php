<?php
/**
 * Simple PDO wrapper that mirrors the Prisma client export used in
 * src/lib/prisma.ts.  It exposes a singleton connection that can be
 * retrieved anywhere in the application.
 */
class Database
{
    private static ?Database $instance = null;
    private \PDO $pdo;

    private function __construct()
    {
        $dsn = getenv('DATABASE_URL');
        $username = getenv('DB_USER') ?: '';
        $password = getenv('DB_PASS') ?: '';

        if (!$dsn) {
            // Fallback to a typical MySQL connection string
            $host = getenv('DB_HOST') ?: 'localhost';
            $db   = getenv('DB_NAME') ?: 'rifas';
            $charset = 'utf8mb4';
            $dsn = "mysql:host={$host};dbname={$db};charset={$charset}";
        }

        $options = [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ];

        $this->pdo = new \PDO($dsn, $username, $password, $options);
    }

    /**
     * Returns the singleton instance of the Database wrapper
     */
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Provides access to the underlying PDO connection
     */
    public function getConnection(): \PDO
    {
        return $this->pdo;
    }

    /**
     * Executes a prepared statement with optional parameters and returns
     * the resulting PDOStatement.
     */
    public function query(string $sql, array $params = []): \PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
}
?>
