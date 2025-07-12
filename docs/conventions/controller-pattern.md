# Controller Pattern

This document outlines the controller pattern used in the Hatchgrid project. All contributors are expected to follow these guidelines to ensure consistency and maintainability of the codebase.

## Table of Contents

- [Controller Pattern](#controller-pattern)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Responsibilities of a Controller](#responsibilities-of-a-controller)
  - [Controller Structure](#controller-structure)
  - [Example](#example)
  - [Best Practices](#best-practices)

## Introduction

The controller pattern is a design pattern that separates the concerns of handling user input and interacting with the model and view. In the context of a web application, the controller is responsible for receiving the HTTP request, processing it, and returning an HTTP response.

## Responsibilities of a Controller

A controller has the following responsibilities:

- **Receive the HTTP request:** The controller receives the HTTP request from the client.
- **Parse the request:** The controller parses the request to extract the relevant information, such as the request parameters, headers, and body.
- **Validate the request:** The controller validates the request to ensure that it is valid and contains all the required information.
- **Interact with the model:** The controller interacts with the model to perform the requested action, such as creating, retrieving, updating, or deleting a resource.
- **Return the HTTP response:** The controller returns an HTTP response to the client, which includes the status code, headers, and body.

## Controller Structure

A controller should be structured as follows:

- **Constructor:** The constructor should be used to inject the dependencies of the controller, such as the service layer.
- **Public methods:** The public methods of the controller should correspond to the actions that can be performed on the resource.
- **Private methods:** The private methods of the controller should be used to implement the helper functions that are used by the public methods.

## Example

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Best Practices

- **Keep controllers thin:** Controllers should be thin and should not contain any business logic. The business logic should be implemented in the service layer.
- **Use dependency injection:** Use dependency injection to inject the dependencies of the controller.
- **Use DTOs:** Use data transfer objects (DTOs) to transfer data between the controller and the service layer.
- **Use a consistent naming convention:** Use a consistent naming convention for the controller and its methods.
- **Handle exceptions:** Handle exceptions in a consistent way and return appropriate error responses.
- **Use a global exception handler:** Use a global exception handler to handle exceptions that are not handled by the controller.
