import { KurrentDBClient } from '@kurrent/kurrentdb-client';
import { v4 as uuid } from 'uuid';

/**
 * Simple Schema Registry Example
 * Quick start guide for using KurrentDB Schema Registry
 */

async function simpleSchemaExample() {
  const client = KurrentDBClient.connectionString`kurrentdb://localhost:2113?tls=false`;

  try {
    const schemaName = `order-schema-${uuid()}`;

    // 1. Create a schema with an initial version
    console.log('Creating schema...');
    const orderSchema = JSON.stringify({
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        customerId: { type: 'string' },
        amount: { type: 'number' }
      },
      required: ['orderId', 'customerId', 'amount']
    });

    await client.createSchema(
      schemaName,
      {
        dataFormat: 'json',
        compatibility: 'backward',
        description: 'Order event schema'
      },
      {
        schemaDefinition: orderSchema
      }
    );
    console.log('✓ Schema created!\n');

    // 2. Retrieve the schema
    const schema = await client.getSchema(schemaName);
    console.log('Schema details:');
    console.log(`  Name: ${schema.schemaName}`);
    console.log(`  Format: ${schema.details.dataFormat}`);
    console.log(`  Latest Version: ${schema.latestSchemaVersion}\n`);

    // 3. Get the schema version (with definition)
    const version = await client.getSchemaVersion(schemaName);
    const decoder = new TextDecoder();
    const definition = JSON.parse(decoder.decode(version.schemaDefinition));
    console.log('Schema definition:');
    console.log(JSON.stringify(definition, null, 2), '\n');

    // 4. Check if a new schema is compatible
    const updatedSchema = JSON.stringify({
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        customerId: { type: 'string' },
        amount: { type: 'number' },
        status: { type: 'string' } // New optional field - compatible!
      },
      required: ['orderId', 'customerId', 'amount']
    });

    const compatibility = await client.checkSchemaCompatibility(
      updatedSchema,
      {
        schemaName: schemaName,
        dataFormat: 'json'
      }
    );

    console.log(`Compatible: ${compatibility.isCompatible ? 'Yes ✓' : 'No ✗'}\n`);

    // 5. Register the new version
    if (compatibility.isCompatible) {
      const newVersion = await client.registerSchemaVersion(
        schemaName,
        updatedSchema
      );
      console.log(`New version registered: v${newVersion.versionNumber}\n`);
    }

    // 6. List all versions
    const versions = await client.listSchemaVersions(schemaName);
    console.log(`Total versions: ${versions.length}`);
    versions.forEach(v => {
      console.log(`  - Version ${v.versionNumber} (${v.schemaVersionId})`);
    });
    console.log();

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.dispose();
  }

}

simpleSchemaExample().catch(console.error);
