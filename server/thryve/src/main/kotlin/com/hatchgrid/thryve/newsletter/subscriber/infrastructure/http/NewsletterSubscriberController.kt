package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.newsletter.subscriber.application.create.SubscribeNewsletterCommand
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http.request.SubscribeNewsletterRequest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import java.net.URI
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class NewsletterSubscriberController(
    mediator: Mediator,
) : ApiController(mediator) {
    @Operation(summary = "Subscribe to newsletter")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Created"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @PutMapping("/workspace/{workspaceId}/newsletter/subscriber/{subscriberId}")
    suspend fun subscribe(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        ) @PathVariable workspaceId: String,
        @Parameter(
            description = "ID of the subscriber to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        )
        @PathVariable subscriberId: String,
        @Validated @RequestBody request: SubscribeNewsletterRequest
    ): ResponseEntity<String> {
        log.debug(
            "Subscribing to newsletter with data: {}",
            sanitizeAndJoinPathVariables(subscriberId, request.toString()),
        )
        dispatch(
            SubscribeNewsletterCommand(
                subscriberId,
                request.email,
                request.firstname,
                request.lastname,
                request.attributes,
                workspaceId,
            ),
        )

        return ResponseEntity.created(
            URI.create("/workspace/$workspaceId/newsletter/subscriber/$subscriberId"),
        ).build()
    }

    companion object {
        private val log = LoggerFactory.getLogger(NewsletterSubscriberController::class.java)
    }
}
