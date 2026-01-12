# KurrentDB Schema Registry Examples

A collection of Node.js examples demonstrating KurrentDB Schema Registry functionality.

## Prerequisites

### Requirements

- **KurrentDB**: Version **25.1 or above** (required for Schema Registry support)
- **Node.js Client**: `@kurrent/kurrentdb-client` version **1.2.0 or above** (required for Schema Registry API)

### Start KurrentDB Server

Before running the examples, you need to have KurrentDB running. The easiest way is using Docker:

```bash
docker run --name kurrentdb-node -it -p 2113:2113 docker.kurrent.io/kurrent-latest/kurrentdb:25.1.1 --insecure --run-projections=All --enable-atom-pub-over-http --start-standard-projections
```

> **Note**: The command above is shown as a single line for compatibility across all terminals and operating systems. If your terminal supports multi-line commands, you can split it for better readability.

This will:
- Start KurrentDB on port `2113`
- Run in insecure mode (no TLS)
- Enable projections and Atom Pub
- Use the latest KurrentDB version (25.1.1)

**Managing the container:**

```bash
# Stop the server
docker stop kurrentdb-node

# Restart the server
docker start kurrentdb-node

# Remove the container
docker rm kurrentdb-node
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure KurrentDB is running on `localhost:2113` (or update the endpoint in the example files)

## Examples

### 1. Simple Schema Example (`simple-schema-example.js`)
A quick start guide showing basic schema operations:
- Create a schema with unique UUID-based name
- Retrieve schema metadata
- Check compatibility
- Register new versions
- List versions

**Note**: Uses unique schema names (with UUID suffix) for each run.

```bash
npm run simple
```

### 2. Comprehensive Schema Demo (`schema-registry-demo.js`)
Complete demonstration of all schema registry features:
- Create schemas with initial versions and unique UUID-based names
- Get schema metadata and versions
- Check schema compatibility
- Register new schema versions
- List schemas and versions
- Update schema metadata
- Get versions by ID
- Test incompatible changes
- Cleanup operations (commented out by default)

**Note**: Uses unique schema names (with UUID suffix) for each run.

```bash
npm run demo
```

### 3. Multi-Format Examples (`multi-format-example.js`)
Demonstrates different schema formats:
- **JSON Schema** - Standard JSON schema validation
- **Protobuf** - Protocol Buffers schema definition
- **Avro** - Apache Avro schema format
- **Bytes** - Custom binary schema format
- Compatibility modes explained
- Listing schemas by format

**Note**: All schemas created with unique UUID-based names.

```bash
npm run formats
```


## Schema Registry Features Demonstrated

### Schema Management
- ✓ Create schemas with different data formats (JSON, Protobuf, Avro, Bytes)
- ✓ Update schema metadata (description, tags)
- ✓ Delete schemas and versions
- ✓ List all schemas with filtering

### Version Management
- ✓ Register new schema versions
- ✓ Get specific versions by number or ID
- ✓ List all versions for a schema
- ✓ Delete specific versions

### Compatibility Checking
- ✓ Check if a new schema is compatible
- ✓ Different compatibility modes (backward, forward, full, etc.)
- ✓ Detect incompatible changes
- ✓ Error details for compatibility issues

### Data Formats
- ✓ JSON Schema
- ✓ Protocol Buffers (Protobuf)
- ✓ Apache Avro
- ✓ Custom Bytes format

### Compatibility Modes
- `backward` - New schema can read old data
- `forward` - Old schema can read new data
- `full` - Both backward and forward compatible
- `backward-all` - Compatible with all previous versions
- `forward-all` - All previous versions compatible with new
- `full-all` - Fully compatible with all versions
- `none` - No compatibility checking

## Configuration

You can modify the connection settings in each example file:
- `endpoint`: KurrentDB connection string (default: `localhost:2113`)
- `tls`: Whether to use TLS (default: `false`)

## API Reference

All examples use the `@kurrent/kurrentdb-client` package (v1.2.0-alpha.0).

Key methods demonstrated:
- `createSchema()` - Create a new schema
- `getSchema()` - Get schema metadata
- `updateSchema()` - Update schema metadata
- `deleteSchema()` - Delete a schema
- `listSchemas()` - List all schemas
- `registerSchemaVersion()` - Add a new version
- `getSchemaVersion()` - Get a specific version
- `getSchemaVersionById()` - Get version by ID
- `listSchemaVersions()` - List all versions
- `deleteSchemaVersions()` - Delete specific versions
- `checkSchemaCompatibility()` - Check compatibility
- `listRegisteredSchemas()` - List schemas with definitions
- `lookupSchemaName()` - Look up schema by version ID
