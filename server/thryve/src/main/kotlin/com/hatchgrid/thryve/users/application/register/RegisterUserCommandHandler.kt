package com.hatchgrid.thryve.users.application.register

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.common.domain.vo.credential.Credential
import com.hatchgrid.common.domain.vo.email.Email
import com.hatchgrid.common.domain.vo.name.FirstName
import com.hatchgrid.common.domain.vo.name.LastName
import org.slf4j.LoggerFactory

/**
 * Command handler responsible for processing user registration commands.
 *
 * This class handles the registration of new users by delegating the process
 * to the `UserRegistrator` service. It validates and transforms the input data
 * from the `RegisterUserCommand` into domain objects before passing them to the
 * service layer.
 *
 * @property userRegistrator The service responsible for registering new users.
 */
@Service
class RegisterUserCommandHandler(
    private val userRegistrator: UserRegistrator
) : CommandHandler<RegisterUserCommand> {

    /**
     * Handles the registration of a new user.
     *
     * This method processes the `RegisterUserCommand` by extracting the user details,
     * converting them into domain objects, and invoking the `registerNewUser` method
     * of the `UserRegistrator` service.
     *
     * @param command The command containing user registration details such as email,
     * password, first name, and last name.
     */
    override suspend fun handle(command: RegisterUserCommand) {
        log.debug("Handling registration for user with email: {}", command.email)

        userRegistrator.registerNewUser(
            email = Email(command.email),
            credential = Credential.create(command.password),
            firstName = command.firstname.takeIf { it.isNotBlank() }?.let { FirstName(it) },
            lastName = command.lastname.takeIf { it.isNotBlank() }?.let { LastName(it) },
        )
    }

    companion object {
        private val log = LoggerFactory.getLogger(RegisterUserCommandHandler::class.java)
    }
}
