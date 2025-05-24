import asyncio
from datetime import date, timedelta
from decimal import Decimal

async def create_sample_data():
    # Connect to SQLite database
    import sqlite3
    
    conn = sqlite3.connect('backend/db.sqlite3')
    cursor = conn.cursor()
    
    # Sample medicines
    medicines = [
        {
            'name': 'Paracetamol',
            'generic_name': 'Acetaminophen',
            'brand_name': 'Panadol',
            'manufacturer': 'GSK',
            'dosage_form': 'tablet',
            'strength': '500mg',
            'category': 'painkiller',
            'description': 'Pain reliever and fever reducer',
            'unit_price': 10.50,
            'current_stock': 100,
            'minimum_stock': 20,
            'expiry_date': '2025-12-31',
            'batch_number': 'PAR2024001',
            'prescription_required': 0,
            'active': 1
        },
        {
            'name': 'Amoxicillin',
            'generic_name': 'Amoxicillin',
            'brand_name': 'Amoxil',
            'manufacturer': 'Pfizer',
            'dosage_form': 'capsule',
            'strength': '250mg',
            'category': 'antibiotic',
            'description': 'Broad-spectrum antibiotic',
            'unit_price': 25.00,
            'current_stock': 50,
            'minimum_stock': 10,
            'expiry_date': '2025-06-30',
            'batch_number': 'AMX2024001',
            'prescription_required': 1,
            'active': 1
        },
        {
            'name': 'Ibuprofen',
            'generic_name': 'Ibuprofen',
            'brand_name': 'Advil',
            'manufacturer': 'Pfizer',
            'dosage_form': 'tablet',
            'strength': '200mg',
            'category': 'anti-inflammatory',
            'description': 'Non-steroidal anti-inflammatory drug',
            'unit_price': 15.75,
            'current_stock': 75,
            'minimum_stock': 15,
            'expiry_date': '2025-09-15',
            'batch_number': 'IBU2024001',
            'prescription_required': 0,
            'active': 1
        },
        {
            'name': 'Lisinopril',
            'generic_name': 'Lisinopril',
            'brand_name': 'Prinivil',
            'manufacturer': 'Merck',
            'dosage_form': 'tablet',
            'strength': '10mg',
            'category': 'ACE inhibitor',
            'description': 'Used to treat high blood pressure',
            'unit_price': 30.00,
            'current_stock': 8,  # Low stock
            'minimum_stock': 10,
            'expiry_date': '2025-03-20',
            'batch_number': 'LIS2024001',
            'prescription_required': 1,
            'active': 1
        },
        {
            'name': 'Aspirin',
            'generic_name': 'Acetylsalicylic acid',
            'brand_name': 'Bayer',
            'manufacturer': 'Bayer',
            'dosage_form': 'tablet',
            'strength': '81mg',
            'category': 'antiplatelet',
            'description': 'Low-dose aspirin for heart protection',
            'unit_price': 12.25,
            'current_stock': 25,
            'minimum_stock': 20,
            'expiry_date': '2024-11-30',  # Expired
            'batch_number': 'ASP2024001',
            'prescription_required': 0,
            'active': 1
        }
    ]
    
    try:
        # Create medicines table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                generic_name VARCHAR(255) NOT NULL,
                brand_name VARCHAR(255),
                manufacturer VARCHAR(255) NOT NULL,
                dosage_form VARCHAR(100) NOT NULL,
                strength VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                unit_price DECIMAL(10,2) NOT NULL,
                current_stock INTEGER DEFAULT 0,
                minimum_stock INTEGER DEFAULT 10,
                expiry_date DATE NOT NULL,
                batch_number VARCHAR(100) NOT NULL,
                barcode VARCHAR(100),
                prescription_required BOOLEAN DEFAULT 1,
                active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert sample medicines
        for medicine in medicines:
            cursor.execute('''
                INSERT OR REPLACE INTO medicines (
                    name, generic_name, brand_name, manufacturer, dosage_form, 
                    strength, category, description, unit_price, current_stock, 
                    minimum_stock, expiry_date, batch_number, prescription_required, active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                medicine['name'], medicine['generic_name'], medicine['brand_name'],
                medicine['manufacturer'], medicine['dosage_form'], medicine['strength'],
                medicine['category'], medicine['description'], medicine['unit_price'],
                medicine['current_stock'], medicine['minimum_stock'], medicine['expiry_date'],
                medicine['batch_number'], medicine['prescription_required'], medicine['active']
            ))
        
        conn.commit()
        print(f"Successfully inserted {len(medicines)} medicines into the database")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

def create_sample_data_sync():
    # Connect to SQLite database
    import sqlite3
    
    conn = sqlite3.connect('backend/db.sqlite3')
    cursor = conn.cursor()
    
    # Sample medicines
    medicines = [
        {
            'name': 'Paracetamol',
            'generic_name': 'Acetaminophen',
            'brand_name': 'Panadol',
            'manufacturer': 'GSK',
            'dosage_form': 'tablet',
            'strength': '500mg',
            'category': 'painkiller',
            'description': 'Pain reliever and fever reducer',
            'unit_price': 10.50,
            'current_stock': 100,
            'minimum_stock': 20,
            'expiry_date': '2025-12-31',
            'batch_number': 'PAR2024001',
            'prescription_required': 0,
            'active': 1
        },
        {
            'name': 'Amoxicillin',
            'generic_name': 'Amoxicillin',
            'brand_name': 'Amoxil',
            'manufacturer': 'Pfizer',
            'dosage_form': 'capsule',
            'strength': '250mg',
            'category': 'antibiotic',
            'description': 'Broad-spectrum antibiotic',
            'unit_price': 25.00,
            'current_stock': 50,
            'minimum_stock': 10,
            'expiry_date': '2025-06-30',
            'batch_number': 'AMX2024001',
            'prescription_required': 1,
            'active': 1
        },
        {
            'name': 'Ibuprofen',
            'generic_name': 'Ibuprofen',
            'brand_name': 'Advil',
            'manufacturer': 'Pfizer',
            'dosage_form': 'tablet',
            'strength': '200mg',
            'category': 'anti-inflammatory',
            'description': 'Non-steroidal anti-inflammatory drug',
            'unit_price': 15.75,
            'current_stock': 75,
            'minimum_stock': 15,
            'expiry_date': '2025-09-15',
            'batch_number': 'IBU2024001',
            'prescription_required': 0,
            'active': 1
        },
        {
            'name': 'Lisinopril',
            'generic_name': 'Lisinopril',
            'brand_name': 'Prinivil',
            'manufacturer': 'Merck',
            'dosage_form': 'tablet',
            'strength': '10mg',
            'category': 'ACE inhibitor',
            'description': 'Used to treat high blood pressure',
            'unit_price': 30.00,
            'current_stock': 8,  # Low stock
            'minimum_stock': 10,
            'expiry_date': '2025-03-20',
            'batch_number': 'LIS2024001',
            'prescription_required': 1,
            'active': 1
        },
        {
            'name': 'Aspirin',
            'generic_name': 'Acetylsalicylic acid',
            'brand_name': 'Bayer',
            'manufacturer': 'Bayer',
            'dosage_form': 'tablet',
            'strength': '81mg',
            'category': 'antiplatelet',
            'description': 'Low-dose aspirin for heart protection',
            'unit_price': 12.25,
            'current_stock': 25,
            'minimum_stock': 20,
            'expiry_date': '2024-11-30',  # Expired
            'batch_number': 'ASP2024001',
            'prescription_required': 0,
            'active': 1
        }
    ]
    
    try:
        # Create medicines table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                generic_name VARCHAR(255) NOT NULL,
                brand_name VARCHAR(255),
                manufacturer VARCHAR(255) NOT NULL,
                dosage_form VARCHAR(100) NOT NULL,
                strength VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                unit_price DECIMAL(10,2) NOT NULL,
                current_stock INTEGER DEFAULT 0,
                minimum_stock INTEGER DEFAULT 10,
                expiry_date DATE NOT NULL,
                batch_number VARCHAR(100) NOT NULL,
                barcode VARCHAR(100),
                prescription_required BOOLEAN DEFAULT 1,
                active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert sample medicines
        for medicine in medicines:
            cursor.execute('''
                INSERT OR REPLACE INTO medicines (
                    name, generic_name, brand_name, manufacturer, dosage_form, 
                    strength, category, description, unit_price, current_stock, 
                    minimum_stock, expiry_date, batch_number, prescription_required, active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                medicine['name'], medicine['generic_name'], medicine['brand_name'],
                medicine['manufacturer'], medicine['dosage_form'], medicine['strength'],
                medicine['category'], medicine['description'], medicine['unit_price'],
                medicine['current_stock'], medicine['minimum_stock'], medicine['expiry_date'],
                medicine['batch_number'], medicine['prescription_required'], medicine['active']
            ))
        
        conn.commit()
        print(f"Successfully inserted {len(medicines)} medicines into the database")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_data_sync() 