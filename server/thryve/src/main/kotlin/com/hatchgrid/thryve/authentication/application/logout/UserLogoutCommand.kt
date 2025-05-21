package com.hatchgrid.thryve.authentication.application.logout

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Represents a command to log out a user.
 * This class implements the Command interface from the common domain bus.
 * @property refreshToken The refresh token used to authenticate the user.
 */
data class UserLogoutCommand(val refreshToken: String) : Command
