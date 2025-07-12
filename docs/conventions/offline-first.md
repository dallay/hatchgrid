# Offline First

This document outlines the offline-first conventions for the Hatchgrid project. All contributors are expected to follow these guidelines to ensure that the application can be used offline.

## Table of Contents

- [Offline First](#offline-first)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Principles](#principles)
  - [Architecture](#architecture)
  - [Data Storage](#data-storage)
  - [Data Synchronization](#data-synchronization)
  - [User Interface](#user-interface)
  - [Testing](#testing)

## Introduction

Offline-first is a design and development approach that prioritizes the ability of an application to work offline. This means that the application should be able to function without an internet connection, and that it should be able to synchronize data with the server when a connection is available.

## Principles

The following principles should be followed when designing and developing an offline-first application:

- **The application should be able to function without an internet connection.**
- **The application should be able to synchronize data with the server when a connection is available.**
- **The user should be able to see the state of the application at all times.**
- **The application should be able to handle conflicts that may arise when synchronizing data.**

## Architecture

The architecture of an offline-first application should be designed to support the principles of offline-first. The following is a high-level overview of the architecture of an offline-first application:

- **Client:** The client is responsible for rendering the user interface and for storing data locally.
- **Service worker:** The service worker is responsible for intercepting network requests and for caching data.
- **Server:** The server is responsible for storing the master copy of the data and for synchronizing data with the clients.

## Data Storage

We use the following technologies for storing data locally:

- **IndexedDB:** for storing structured data.
- **Cache API:** for storing static assets, such as HTML, CSS, and JavaScript files.

## Data Synchronization

We use the following strategies for synchronizing data with the server:

- **Push synchronization:** The server pushes data to the client when it changes.
- **Pull synchronization:** The client pulls data from the server when it changes.
- **Conflict resolution:** We use a last-write-wins conflict resolution strategy.

## User Interface

The user interface should be designed to provide a good user experience even when the application is offline. The following are some of the things that should be considered when designing the user interface:

- **The user should be able to see the state of the application at all times.**
- **The user should be able to perform actions even when the application is offline.**
- **The application should provide feedback to the user when an action is performed.**

## Testing

- All new features should be tested to ensure that they work offline.
- The tests should cover all the different scenarios that may arise when the application is offline.
