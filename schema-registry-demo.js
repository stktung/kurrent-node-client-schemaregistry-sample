import { KurrentDBClient } from '@kurrent/kurrentdb-client';
import { v4 as uuid } from 'uuid';

/**
 * Comprehensive Schema Registry Demo
 * Demonstrates all basic functionalities of the KurrentDB Schema Registry
 */

async function schemaRegistryDemo() {
  // Create a client instance
  const client = KurrentDBClient.connectionString`kurrentdb://localhost:2113?tls=false`;

  try {
    console.log('=== KurrentDB Schema Registry Demo ===\n');

    // ==========================================
    // 1. CREATE A SCHEMA
    // ==========================================
    console.log('1. Creating a new schema...');
    
    const schemaName = `customer-schema-${uuid()}`;
    const initialSchemaDefinition = JSON.stringify({
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' }
      },
      required: ['customerId', 'name']
    });

    const createResult = await client.createSchema(
      schemaName,
      {
        dataFormat: 'json',
        compatibility: 'backward',
        description: 'Customer information schema',
        tags: {
          domain: 'customers',
          version: 'v1'
        }
      },
      {
        schemaDefinition: initialSchemaDefinition
      }
    );

    console.log(`✓ Schema created with version ${createResult.versionNumber}`);
    console.log(`  Schema Version ID: ${createResult.schemaVersionId}\n`);

    // ==========================================
    // 2. GET SCHEMA METADATA
    // ==========================================
    console.log('2. Retrieving schema metadata...');
    
    const schema = await client.getSchema(schemaName);
    
    console.log(`✓ Schema: ${schema.schemaName}`);
    console.log(`  Description: ${schema.details.description}`);
    console.log(`  Data Format: ${schema.details.dataFormat}`);
    console.log(`  Compatibility: ${schema.details.compatibility}`);
    console.log(`  Latest Version: ${schema.latestSchemaVersion}`);
    console.log(`  Created At: ${schema.createdAt}`);
    console.log(`  Tags:`, schema.details.tags, '\n');

    // ==========================================
    // 3. GET SCHEMA VERSION
    // ==========================================
    console.log('3. Retrieving schema version...');
    
    const schemaVersion = await client.getSchemaVersion(schemaName, {
      versionNumber: 1
    });
    
    console.log(`✓ Version ${schemaVersion.versionNumber}`);
    console.log(`  Schema Version ID: ${schemaVersion.schemaVersionId}`);
    console.log(`  Data Format: ${schemaVersion.dataFormat}`);
    console.log(`  Registered At: ${schemaVersion.registeredAt}`);
    
    // Decode and display the schema definition
    const decoder = new TextDecoder();
    const definition = decoder.decode(schemaVersion.schemaDefinition);
    console.log(`  Definition:`, JSON.parse(definition), '\n');

    // ==========================================
    // 4. CHECK SCHEMA COMPATIBILITY
    // ==========================================
    console.log('4. Checking schema compatibility...');
    
    // Try a compatible change (adding optional field)
    const compatibleSchemaDefinition = JSON.stringify({
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' } // New optional field
      },
      required: ['customerId', 'name']
    });

    const compatibilityResult = await client.checkSchemaCompatibility(
      compatibleSchemaDefinition,
      {
        schemaName: schemaName,
        dataFormat: 'json'
      }
    );

    console.log(`✓ Compatibility check result: ${compatibilityResult.isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}`);
    if (!compatibilityResult.isCompatible && compatibilityResult.errors) {
      console.log('  Errors:', compatibilityResult.errors);
    } else {
      console.log('  Schema is backward compatible!\n');
    }

    // ==========================================
    // 5. REGISTER A NEW SCHEMA VERSION
    // ==========================================
    console.log('5. Registering a new schema version...');
    
    const newVersion = await client.registerSchemaVersion(
      schemaName,
      compatibleSchemaDefinition
    );

    console.log(`✓ New version registered: ${newVersion.versionNumber}`);
    console.log(`  Schema Version ID: ${newVersion.schemaVersionId}\n`);

    // ==========================================
    // 6. LIST ALL SCHEMA VERSIONS
    // ==========================================
    console.log('6. Listing all schema versions...');
    
    const versions = await client.listSchemaVersions(schemaName);
    
    console.log(`✓ Found ${versions.length} version(s):`);
    for (const version of versions) {
      console.log(`  - Version ${version.versionNumber} (ID: ${version.schemaVersionId})`);
      console.log(`    Registered: ${version.registeredAt}`);
    }
    console.log();

    // ==========================================
    // 7. LIST ALL SCHEMAS
    // ==========================================
    console.log('7. Listing all schemas...');
    
    const allSchemas = await client.listSchemas();
    
    console.log(`✓ Found ${allSchemas.length} schema(s):`);
    for (const s of allSchemas) {
      console.log(`  - ${s.schemaName}`);
      console.log(`    Format: ${s.details.dataFormat}, Compatibility: ${s.details.compatibility}`);
      console.log(`    Latest Version: ${s.latestSchemaVersion}`);
    }
    console.log();

    // ==========================================
    // 8. UPDATE SCHEMA METADATA
    // ==========================================
    console.log('8. Updating schema metadata...');
    
    await client.updateSchema(schemaName, {
      dataFormat: 'json',
      compatibility: 'backward',
      description: 'Customer information schema - Updated with phone field',
      tags: {
        domain: 'customers',
        version: 'v2',
        updated: 'true'
      }
    });

    console.log(`✓ Schema metadata updated\n`);

    // ==========================================
    // 9. GET SCHEMA VERSION BY ID
    // ==========================================
    console.log('9. Getting schema version by ID...');
    
    const versionById = await client.getSchemaVersionById(newVersion.schemaVersionId);
    
    console.log(`✓ Retrieved version ${versionById.versionNumber}`);
    console.log(`  Schema Version ID: ${versionById.schemaVersionId}\n`);

    // ==========================================
    // 10. LIST REGISTERED SCHEMAS (with definitions)
    // ==========================================
    console.log('10. Listing registered schemas with definitions...');
    
    const registeredSchemas = await client.listRegisteredSchemas({
      schemaNamePrefix: schemaName
    });
    
    console.log(`✓ Found ${registeredSchemas.length} registered schema(s):`);
    for (const reg of registeredSchemas) {
      console.log(`  - ${reg.schemaName} v${reg.versionNumber}`);
      console.log(`    Schema Version ID: ${reg.schemaVersionId}`);
      if (reg.schemaDefinition) {
        const regDef = decoder.decode(reg.schemaDefinition);
        console.log(`    Definition:`, JSON.parse(regDef));
      }
    }
    console.log();

    // ==========================================
    // 11. DEMONSTRATE INCOMPATIBLE CHANGE
    // ==========================================
    console.log('11. Testing an incompatible schema change...');
    
    // Try an incompatible change (removing required field)
    const incompatibleSchemaDefinition = JSON.stringify({
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        email: { type: 'string' }
      },
      required: ['customerId'] // Removed 'name' from required
    });

    const incompatibleResult = await client.checkSchemaCompatibility(
      incompatibleSchemaDefinition,
      {
        schemaName: schemaName,
        dataFormat: 'json'
      }
    );

    console.log(`✓ Compatibility check result: ${incompatibleResult.isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}`);
    if (!incompatibleResult.isCompatible && incompatibleResult.errors) {
      console.log('  Errors detected:');
      for (const error of incompatibleResult.errors) {
        console.log(`    - ${error.kind}: ${error.details}`);
        if (error.propertyPath) console.log(`      Property: ${error.propertyPath}`);
      }
    }
    console.log();

    // ==========================================
    // 12. CLEANUP (Optional - commented out)
    // ==========================================
    console.log('12. Cleanup operations (commented out)...');
    console.log('   To delete schema versions, uncomment the deleteSchemaVersions call');
    console.log('   To delete the entire schema, uncomment the deleteSchema call\n');
    
    // Delete specific versions
    // await client.deleteSchemaVersions(schemaName, {
    //   versionNumbers: [1]
    // });
    // console.log('✓ Deleted version 1\n');

    // Delete the entire schema
    // await client.deleteSchema(schemaName);
    // console.log('✓ Schema deleted\n');

    console.log('=== Demo completed successfully! ===');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
  } finally {
    // Close the client connection
    await client.dispose();
    console.log('\nConnection closed.');
  }
}

// Run the demo
schemaRegistryDemo().catch(console.error);
