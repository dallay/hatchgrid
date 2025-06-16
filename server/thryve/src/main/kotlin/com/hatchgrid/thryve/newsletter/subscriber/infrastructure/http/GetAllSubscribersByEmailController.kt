package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.newsletter.subscriber.application.SubscribersResponse
import com.hatchgrid.thryve.newsletter.subscriber.application.search.email.AllSubscribersByEmailQuery
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Pattern
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
@Validated
class GetAllSubscribersByEmailController(
    mediator: Mediator,
) : ApiController(mediator) {

    @Operation(summary = "Get all subscribers by email")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Success"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("/workspace/{workspaceId}/newsletter/subscriber/find-all-by-emails")
    @ResponseBody
    suspend fun getAllByEmail(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @PathVariable
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        )
        workspaceId: String,
        @RequestParam @Valid emails: Set<@Email(message = "Invalid email format") String>
    ): ResponseEntity<SubscribersResponse> {
        // Authorization: ensure current user has access to this workspace
        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()


        log.debug(
            "Getting all subscribers for workspace: {} (number of emails: {})",
            sanitizeAndJoinPathVariables(workspaceId),
            emails.size
        )
        val response = ask(
            AllSubscribersByEmailQuery(
                workspaceId,
                userId = userId,
                emails,
            ),
        )
        return ResponseEntity.ok(response)
    }

    companion object {
        private val log = LoggerFactory.getLogger(GetAllSubscribersByEmailController::class.java)
    }
}
