package com.hatchgrid.thryve.users.application.register

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Represents a command to register a new user.
 *
 * @created 8/7/23
 * @property email The email of the new user.
 * @property password The password of the new user.
 * @property firstname The first name of the new user.
 * @property lastname The last name of the new user.
 */
data class RegisterUserCommand(
    val email: String,
    val password: String,
    val firstname: String,
    val lastname: String
) : Command {
    override fun toString(): String =
        "RegisterUserCommand(email='$email', password='***REDACTED***', firstname='$firstname', lastname='$lastname')"
}
