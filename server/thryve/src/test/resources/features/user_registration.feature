Feature: User Registration
  As a new user
  I want to be able to register an account
  So that I can access the HatchGrid platform

  Scenario: Successful User Registration
    Given a new user with valid registration details
    When the user attempts to register
    Then the user account should be created successfully
    And the user should receive a confirmation

  Scenario: User Registration with Existing Email
    Given an existing user with email "test@example.com"
    And a new user attempts to register with the same email
    When the new user attempts to register
    Then the registration should fail
    And an error message indicating the email is already in use should be returned

  Scenario: User Registration with Invalid Email Format
    Given a new user with an invalid email format "invalid-email"
    When the user attempts to register
    Then the registration should fail
    And an error message indicating invalid email format should be returned
