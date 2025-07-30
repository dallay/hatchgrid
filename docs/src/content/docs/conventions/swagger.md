---
title: Swagger Documentation Conventions
description: Guidelines for documenting REST APIs using Swagger in the Hatchgrid project.
---
# Swagger Documentation

This document outlines the Swagger documentation conventions for the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the API documentation.

## Table of Contents

- [Swagger Documentation](#swagger-documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Annotations](#annotations)
    - [`@Api`](#api)
    - [`@ApiOperation`](#apioperation)
    - [`@ApiParam`](#apiparam)
    - [`@ApiResponse`](#apiresponse)
    - [`@ApiResponses`](#apiresponses)
    - [`@ApiModel`](#apimodel)
    - [`@ApiModelProperty`](#apimodelproperty)
  - [Example](#example)
  - [Best Practices](#best-practices)

## Introduction

Swagger is a powerful tool for documenting and visualizing RESTful APIs. It allows developers to easily understand the capabilities of the API and to interact with it in a sandbox environment.

## Annotations

We use the following Swagger annotations to document our API:

### `@Api`

The `@Api` annotation is used to document the controller. It has the following properties:

- `value`: A short description of the controller.
- `tags`: A list of tags that can be used to group the operations of the controller.

### `@ApiOperation`

The `@ApiOperation` annotation is used to document an operation. It has the following properties:

- `value`: A short description of the operation.
- `notes`: A detailed description of the operation.

### `@ApiParam`

The `@ApiParam` annotation is used to document a parameter of an operation. It has the following properties:

- `name`: The name of the parameter.
- `value`: A short description of the parameter.
- `required`: A boolean value that indicates whether the parameter is required.

### `@ApiResponse`

The `@ApiResponse` annotation is used to document a response of an operation. It has the following properties:

- `code`: The HTTP status code of the response.
- `message`: A short description of the response.
- `response`: The class of the response object.

### `@ApiResponses`

The `@ApiResponses` annotation is used to group multiple `@ApiResponse` annotations.

### `@ApiModel`

The `@ApiModel` annotation is used to document a model. It has the following properties:

- `value`: A short description of the model.

### `@ApiModelProperty`

The `@ApiModelProperty` annotation is used to document a property of a model. It has the following properties:

- `value`: A short description of the property.
- `required`: A boolean value that indicates whether the property is required.

## Example

```java
@RestController
@RequestMapping("/api/v1/users")
@Api(value = "User Management", tags = "Users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @ApiOperation(value = "Get all users", notes = "Returns a list of all users.")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Successfully retrieved list"),
            @ApiResponse(code = 401, message = "You are not authorized to view the resource"),
            @ApiResponse(code = 403, message = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(code = 404, message = "The resource you were trying to reach is not found")
    })
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // ...
}
```

## Best Practices

- **Use clear and concise descriptions:** The descriptions of the controllers, operations, parameters, and models should be clear and concise.
- **Use consistent naming conventions:** Use consistent naming conventions for the tags, operations, and parameters.
- **Document all operations:** All operations should be documented with the `@ApiOperation` annotation.
- **Document all parameters:** All parameters should be documented with the `@ApiParam` annotation.
- **Document all responses:** All responses should be documented with the `@ApiResponse` annotation.
- **Document all models:** All models should be documented with the `@ApiModel` and `@ApiModelProperty` annotations.
- **Keep the documentation up to date:** The documentation should be kept up to date with the latest changes to the API.
