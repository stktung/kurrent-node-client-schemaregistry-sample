import { KurrentDBClient } from '@kurrent/kurrentdb-client';
import { v4 as uuid } from 'uuid';

/**
 * Schema Registry - Multiple Format Examples
 * Demonstrates using different schema formats: JSON, Protobuf, Avro, and Bytes
 */

async function multiFormatExample() {
  const client = KurrentDBClient.connectionString`kurrentdb://localhost:2113?tls=false`;

  try {
    console.log('=== Schema Registry Format Examples ===\n');

    // ==========================================
    // 1. JSON SCHEMA
    // ==========================================
    console.log('1. JSON Schema Example:');
    
    const jsonSchemaName = `user-json-schema-${uuid()}`;
    const jsonSchemaDefinition = JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        username: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        age: { type: 'integer', minimum: 0 }
      },
      required: ['userId', 'username', 'email']
    });

    await client.createSchema(
      jsonSchemaName,
      {
        dataFormat: 'json',
        compatibility: 'full',
        description: 'User schema in JSON format',
        tags: { format: 'json', domain: 'users' }
      },
      { schemaDefinition: jsonSchemaDefinition }
    );
    
    console.log(`✓ Created JSON schema: ${jsonSchemaName}\n`);

    // ==========================================
    // 2. PROTOBUF SCHEMA
    // ==========================================
    console.log('2. Protobuf Schema Example:');
    
    const protobufSchemaName = `product-protobuf-schema-${uuid()}`;
    const protobufSchemaDefinition = `
syntax = "proto3";

message Product {
  string product_id = 1;
  string name = 2;
  string description = 3;
  double price = 4;
  int32 stock_quantity = 5;
  repeated string categories = 6;
}
`;

    await client.createSchema(
      protobufSchemaName,
      {
        dataFormat: 'protobuf',
        compatibility: 'backward',
        description: 'Product schema in Protobuf format',
        tags: { format: 'protobuf', domain: 'products' }
      },
      { schemaDefinition: protobufSchemaDefinition }
    );
    
    console.log(`✓ Created Protobuf schema: ${protobufSchemaName}\n`);

    // ==========================================
    // 3. AVRO SCHEMA
    // ==========================================
    console.log('3. Avro Schema Example:');
    
    const avroSchemaName = `event-avro-schema-${uuid()}`;
    const avroSchemaDefinition = JSON.stringify({
      type: 'record',
      name: 'Event',
      namespace: 'com.example.events',
      fields: [
        { name: 'eventId', type: 'string' },
        { name: 'eventType', type: 'string' },
        { name: 'timestamp', type: 'long' },
        { 
          name: 'payload', 
          type: {
            type: 'map',
            values: 'string'
          }
        }
      ]
    });

    await client.createSchema(
      avroSchemaName,
      {
        dataFormat: 'avro',
        compatibility: 'forward',
        description: 'Event schema in Avro format',
        tags: { format: 'avro', domain: 'events' }
      },
      { schemaDefinition: avroSchemaDefinition }
    );
    
    console.log(`✓ Created Avro schema: ${avroSchemaName}\n`);

    // ==========================================
    // 4. BYTES SCHEMA (Custom/Binary)
    // ==========================================
    console.log('4. Bytes Schema Example:');
    
    const bytesSchemaName = `custom-bytes-schema-${uuid()}`;
    // For bytes format, you can use custom schema definitions
    const customSchemaDefinition = 'Custom binary schema definition v1.0';
    const encoder = new TextEncoder();
    const bytesSchemaDefinition = encoder.encode(customSchemaDefinition);

    await client.createSchema(
      bytesSchemaName,
      {
        dataFormat: 'bytes',
        compatibility: 'none',
        description: 'Custom schema in bytes format',
        tags: { format: 'bytes', domain: 'custom' }
      },
      { schemaDefinition: bytesSchemaDefinition }
    );
    
    console.log(`✓ Created Bytes schema: ${bytesSchemaName}\n`);

    // ==========================================
    // 5. LIST ALL SCHEMAS BY FORMAT
    // ==========================================
    console.log('5. Listing all schemas by format:');
    
    const allSchemas = await client.listSchemas();
    const schemasByFormat = allSchemas.reduce((acc, schema) => {
      const format = schema.details.dataFormat;
      if (!acc[format]) acc[format] = [];
      acc[format].push(schema);
      return acc;
    }, {});

    for (const [format, schemas] of Object.entries(schemasByFormat)) {
      console.log(`\n  ${format.toUpperCase()} Schemas (${schemas.length}):`);
      for (const schema of schemas) {
        console.log(`    - ${schema.schemaName}`);
        console.log(`      Compatibility: ${schema.details.compatibility}`);
        console.log(`      Description: ${schema.details.description}`);
      }
    }
    console.log();

    // ==========================================
    // 6. DEMONSTRATE COMPATIBILITY MODES
    // ==========================================
    console.log('6. Compatibility Modes Available:');
    console.log('   - backward: New schema can read data written with old schema');
    console.log('   - forward: Old schema can read data written with new schema');
    console.log('   - full: Both backward and forward compatible');
    console.log('   - backward-all: Backward compatible with all previous versions');
    console.log('   - forward-all: Forward compatible with all previous versions');
    console.log('   - full-all: Fully compatible with all previous versions');
    console.log('   - none: No compatibility checking\n');

    // ==========================================
    // 7. RETRIEVE AND DISPLAY SCHEMAS
    // ==========================================
    console.log('7. Retrieving schema definitions:\n');
    
    const decoder = new TextDecoder();
    
    // Get JSON schema
    const jsonVersion = await client.getSchemaVersion(jsonSchemaName);
    const jsonDef = JSON.parse(decoder.decode(jsonVersion.schemaDefinition));
    console.log(`JSON Schema Definition for ${jsonSchemaName}:`);
    console.log(JSON.stringify(jsonDef, null, 2), '\n');

    // Get Protobuf schema
    const protobufVersion = await client.getSchemaVersion(protobufSchemaName);
    const protobufDef = decoder.decode(protobufVersion.schemaDefinition);
    console.log(`Protobuf Schema Definition for ${protobufSchemaName}:`);
    console.log(protobufDef, '\n');

    // Get Avro schema
    const avroVersion = await client.getSchemaVersion(avroSchemaName);
    const avroDef = JSON.parse(decoder.decode(avroVersion.schemaDefinition));
    console.log(`Avro Schema Definition for ${avroSchemaName}:`);
    console.log(JSON.stringify(avroDef, null, 2), '\n');

    console.log('=== Multi-format demo completed! ===');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await client.dispose();
    console.log('\nConnection closed.');
  }
}

multiFormatExample().catch(console.error);
