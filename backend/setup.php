<?php
/**
 * Database Setup Script
 * 
 * Run this script to set up the BookCommerce database
 */

require_once 'config/database.php';

echo "BookCommerce Database Setup\n";
echo "==========================\n\n";

try {
    // Connect to MySQL without specifying database
    $pdo = new PDO("mysql:host=localhost;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✓ Connected to MySQL server\n";
    
    // Read and execute schema file
    $schemaFile = '../database/migrations/001_create_bookcommerce_schema.sql';
    if(file_exists($schemaFile)) {
        $schema = file_get_contents($schemaFile);
        
        // Split into individual queries
        $queries = array_filter(explode(';', $schema));
        
        foreach($queries as $query) {
            $query = trim($query);
            if(!empty($query)) {
                $pdo->exec($query);
            }
        }
        
        echo "✓ Database schema created successfully\n";
    } else {
        echo "✗ Schema file not found: $schemaFile\n";
        exit(1);
    }
    
    // Read and execute sample data file
    $dataFile = '../database/migrations/002_insert_sample_data.sql';
    if(file_exists($dataFile)) {
        $data = file_get_contents($dataFile);
        
        // Split into individual queries
        $queries = array_filter(explode(';', $data));
        
        foreach($queries as $query) {
            $query = trim($query);
            if(!empty($query)) {
                $pdo->exec($query);
            }
        }
        
        echo "✓ Sample data inserted successfully\n";
    } else {
        echo "✗ Sample data file not found: $dataFile\n";
    }
    
    echo "\n🎉 Database setup completed successfully!\n\n";
    echo "Default admin credentials:\n";
    echo "Email: admin@bookcommerce.com\n";
    echo "Password: password\n\n";
    echo "Default customer credentials:\n";
    echo "Email: john@example.com\n";
    echo "Password: password\n\n";
    echo "You can now start using the BookCommerce API!\n";
    
} catch(PDOException $e) {
    echo "✗ Database setup failed: " . $e->getMessage() . "\n";
    echo "\nPlease ensure:\n";
    echo "1. MySQL server is running\n";
    echo "2. Database credentials in config/database.php are correct\n";
    echo "3. You have proper permissions to create databases\n";
    exit(1);
}
?>
