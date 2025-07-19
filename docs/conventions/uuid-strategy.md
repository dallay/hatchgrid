# UUID Strategy

This document outlines the UUID strategy for the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the codebase.

## Table of Contents

- [UUID Strategy](#uuid-strategy)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [UUID Version](#uuid-version)
  - [UUID Generation](#uuid-generation)
  - [UUID Storage](#uuid-storage)
  - [UUID Usage](#uuid-usage)

## Introduction

A universally unique identifier (UUID) is a 128-bit number used to identify information in computer systems. We use UUIDs as the primary keys for our database tables.

## UUID Version

We use UUID version 4 (randomly generated) for all our primary keys. UUIDv4 is a good choice for most use cases because it is easy to generate and does not require a centralized authority to ensure uniqueness.

## UUID Generation

We use the `java.util.UUID` class to generate UUIDs.

```java
import java.util.UUID;

public class UuidGenerator {

    public static UUID generate() {
        return UUID.randomUUID();
    }
}
```

## UUID Storage

We store UUIDs in the database as a `binary(16)` column. This is more efficient than storing them as a `varchar(36)` column.

## UUID Usage

We use UUIDs as the primary keys for all our database tables. We also use them as the external identifiers for our resources. This allows us to expose the UUIDs in our API without exposing the internal database IDs.
