# Using YAML vs XML for Liquibase Migrations

How to choose a changelog format
Liquibase uses two models for changelogs:

The SQL model (.sql files): Write SQL statements directly in changesets in your changelog, formatted with SQL comments.
The platform-agnostic model (.xml, .yaml, and .json files): Use Liquibase Change Types corresponding to SQL changes in each changeset. Liquibase then generates database-specific SQL for you. You can also insert raw SQL statements in your changesets using the sql Change Type or reference a SQL file with the sqlFile Change Type.

Note: You can use one or more different changelog formats with Liquibase simultaneously!

## Overview

This document addresses the question: "Can you use YAML instead of XML for Liquibase migrations, and is it recommended?"

The short answer is **yes**, Liquibase supports YAML format for migrations, and in many cases, it can be a better choice than XML. This document explains the advantages and disadvantages of each format and provides recommendations.

## Liquibase Format Support

Liquibase supports multiple formats for change log files:
- XML (default)
- YAML
- JSON
- SQL

## Advantages of YAML over XML

1. **Readability**: YAML is generally more readable and concise than XML, with less syntactic noise (no closing tags, less brackets).

2. **Less Verbose**: YAML requires fewer characters to express the same data structure, making files shorter and easier to scan.

3. **Comments**: YAML has better support for comments with the `#` symbol, making it easier to document your migrations.

4. **No Closing Tags**: Unlike XML, YAML doesn't require closing tags, reducing the chance of syntax errors from mismatched tags.

5. **Indentation-Based Structure**: YAML's structure is defined by indentation, which can make the hierarchical relationships clearer.

6. **More Modern**: YAML is considered more modern and is widely used in many DevOps tools (Kubernetes, Docker Compose, GitHub Actions).

## Advantages of XML over YAML

1. **Schema Validation**: XML has better tooling for schema validation, which can catch errors before runtime.

2. **IDE Support**: Many IDEs have better support for XML, including auto-completion and validation.

3. **Industry Standard**: XML has been the standard format for Liquibase for longer, so there's more documentation and examples available.

4. **Whitespace Insensitivity**: XML doesn't rely on indentation for structure, reducing errors from incorrect spacing.

5. **Explicit Structure**: XML's explicit opening and closing tags can make complex structures clearer.

## Spring Boot Configuration

Spring Boot supports both XML and YAML formats for Liquibase migrations. The format is determined by the file extension in the `spring.liquibase.change-log` property:

```yaml
spring:
  liquibase:
    change-log: classpath:db/changelog/master.yaml  # For YAML
    # OR
    # change-log: classpath:db/changelog/master.xml  # For XML
    enabled: true
```

## Example Comparison

### XML Format
```xml
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.9.xsd">

    <changeSet id="001" author="developer">
        <createTable tableName="users">
            <column name="id" type="uuid">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="username" type="varchar(50)">
                <constraints unique="true" nullable="false"/>
            </column>
        </createTable>
    </changeSet>
</databaseChangeLog>
```

### YAML Format
```yaml
databaseChangeLog:
  - changeSet:
      id: 001
      author: developer
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: uuid
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: username
                  type: varchar(50)
                  constraints:
                    unique: true
                    nullable: false
```

## Recommendations

### When to Use YAML:
- For new projects where you have full control over the format
- When readability and maintainability are priorities
- When your team is more familiar with YAML than XML
- For simpler migration files where XML's verbosity adds unnecessary complexity

### When to Use XML:
- For existing projects that already use XML (for consistency)
- When you need strong schema validation
- When your team has more experience with XML
- When you're using tools or IDEs with better XML support

## Implementation in Hatchgrid

We have implemented YAML format for Liquibase migrations in the Hatchgrid project:

1. Created YAML versions of the migration files:
   - `server/thryve/src/main/resources/db/changelog/master.yaml`
   - `server/thryve/src/main/resources/db/changelog/migrations/001-initial-schema.yaml`

2. Updated the Spring Boot configuration to use YAML:
   ```yaml
   spring:
     liquibase:
       change-log: classpath:db/changelog/master.yaml
       enabled: true
   ```

## Conclusion

Both XML and YAML are valid choices for Liquibase migrations, and the decision should be based on your team's preferences, existing codebase, and specific requirements.

For the Hatchgrid project, we've chosen YAML for its improved readability and modern approach, but either format would work effectively with Liquibase and Spring Boot.
