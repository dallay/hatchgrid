package com.hatchgrid.thryve.newsletter.subscriber.application.create

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import java.util.*
import org.slf4j.LoggerFactory

/**
 * Service class responsible for handling the SubscribeNewsletterCommand.
 *
 * @property subscriberRegistrator The service responsible for registering subscribers.
 */
@Service
class CreateSubscribeNewsletterCommandHandler(
    private val subscriberRegistrator: SubscriberRegistrator
) : CommandHandler<SubscribeNewsletterCommand> {
    /**
     * Function to handle the SubscribeNewsletterCommand.
     *
     * @param command The command to be handled.
     */
    override suspend fun handle(command: SubscribeNewsletterCommand) {
        log.debug("Handling command: {}", command)
        val id = UUID.fromString(command.id)
        val workspaceId = UUID.fromString(command.workspaceId)
        subscriberRegistrator.register(
            id,
            command.email,
            command.firstname,
            command.lastname,
            command.attributes,
            workspaceId,
        )
    }

    companion object {
        private val log =
            LoggerFactory.getLogger(CreateSubscribeNewsletterCommandHandler::class.java)
    }
}
