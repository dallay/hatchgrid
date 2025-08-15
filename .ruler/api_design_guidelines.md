---
title: REST API Conventions
description: Guidelines for designing and building REST APIs in the Hatchgrid project.
---

## REST API CONVENTIONS

This document outlines the REST API conventions for the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the API.

## Table of Contents

- [REST API CONVENTIONS](#rest-api-conventions)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [URL Structure](#url-structure)
- [HTTP Methods](#http-methods)
- [Status Codes](#status-codes)
- [Request and Response](#request-and-response)
  - [JSON](#json)
  - [Error Handling](#error-handling)
- [Versioning](#versioning)
- [Authentication](#authentication)
- [Pagination](#pagination)
- [Sorting](#sorting)
- [Filtering](#filtering)
- [HATEOAS](#hateoas)

## Introduction

This document provides a set of conventions for designing and building REST APIs. The goal is to create a consistent and easy-to-use API that is both powerful and flexible.

## URL Structure

- Use nouns instead of verbs in the URL.
- Use plural nouns for collections.
- Use kebab-case for URL segments.
- Use a consistent URL structure.

**Good:**

- `/users`
- `/users/{id}`
- `/users/{id}/posts`

**Bad:**

- `/getUsers`
- `/user/{id}`
- `/users/{id}/getPosts`

## HTTP Methods

Use the appropriate HTTP method for the action being performed.

- `GET`: Retrieve a resource or a collection of resources.
- `POST`: Create a new resource.
- `PUT`: Update an existing resource.
- `PATCH`: Partially update an existing resource.
- `DELETE`: Delete a resource.

## Status Codes

Use the appropriate HTTP status code to indicate the result of the request.

- `200 OK`: The request was successful.
- `201 Created`: The resource was created successfully.
- `204 No Content`: The request was successful, but there is no content to return.
- `400 Bad Request`: The request was invalid.
- `401 Unauthorized`: The user is not authenticated.
- `403 Forbidden`: The user is not authorized to perform the action.
- `404 Not Found`: The resource was not found.
- `500 Internal Server Error`: An error occurred on the server.

## Request and Response

### JSON

- Use JSON for all request and response bodies.
- Use camelCase for all JSON properties.

### Error Handling

- Use a consistent error format for all error responses.
- The error response should include a unique error code, a descriptive error message, and a list of validation errors (if any).

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid.",
    "errors": [
      {
        "field": "email",
        "message": "The email address is invalid."
      }
    ]
  }
}
```

## Versioning

- Version the API to avoid breaking changes.
- The API version should be included in the URL, e.g., `/v1/users`.

## Authentication

- Use a standard authentication mechanism, such as OAuth 2.0 or JWT.
- The authentication token should be included in the `Authorization` header of the request.

## Pagination

- Use pagination to limit the number of results returned in a single request.
- The pagination information should be included in the response.

## Sorting

- Allow the user to sort the results by one or more fields.
- The sorting information should be included in the query string of the request.

## Filtering

- Allow the user to filter the results by one or more fields.
- The filtering information should be included in the query string of the request.

## HATEOAS

- Use HATEOAS to provide links to related resources in the response.
- This allows the client to discover the API without prior knowledge of the URL structure.
